import Stripe from "stripe";
import { z } from "zod";
import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma";

if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");
if (!process.env.STRIPE_WEBHOOK_SECRET) throw new Error("Missing STRIPE_WEBHOOK_SECRET");
if (!process.env.CLIENT_URL) throw new Error("Missing CLIENT_URL");


const CheckoutSchema = z.object({
  email: z.string().email(),
  address: z.object({
    name: z.string().min(1),
    line1: z.string().min(1),
    line2: z.string().optional(),
    city: z.string().min(1),
    postcode: z.string().min(1),
    country: z.string().min(2),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.coerce.number().int().min(1),
    })
  ).min(1),
});


const app = express();

app.use(cors({ origin: "http://localhost:5173"}));
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") {
      return res.status(400).send("Missing Stripe signature");
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = session.metadata?.orderId;
      const sessionId = session.id;

      // Idempotent update: mark PAID if we find the order by metadata or session id
      await prisma.order.updateMany({
        where: {
          OR: [
            { id: orderId ?? "__nope__" },
            { stripeSessionId: sessionId },
          ],
          status: "PENDING",
        },
        data: { status: "PAID" },
      });
    }

    res.json({ received: true });
  }
);

app.use(express.json());

app.get("/orders/by-session/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  const order = await prisma.order.findFirst({
    where: { stripeSessionId: sessionId },
    include: { items: true, address: true },
  });

  if (!order) return res.status(404).json({ error: "Order not found" });

  res.json(order);
});


app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/products", async (_req, res) => {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  res.json(products);
});

app.post("/checkout/session", async (req, res) => {
  const parsed = CheckoutSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const { email, address, items } = parsed.data;

  // Fetch products from DB (never trust client prices)
  const products = await prisma.product.findMany({
    where: { id: { in: items.map(i => i.productId) }, active: true },
  });

  if (products.length !== items.length) {
    return res.status(400).json({ error: "Invalid products" });
  }

  const productMap = new Map(products.map(p => [p.id, p]));

  const orderItems = items.map(i => {
    const p = productMap.get(i.productId)!;
    return {
      productId: p.id,
      nameSnapshot: p.name,
      unitPriceCents: p.priceCents,
      quantity: i.quantity,
      lineTotalCents: p.priceCents * i.quantity,
    };
  });

  const totalCents = orderItems.reduce((sum, i) => sum + i.lineTotalCents, 0);
  const currency = products[0].currency;

  // Create Order (PENDING)
  const order = await prisma.order.create({
    data: {
      email,
      status: "PENDING",
      totalCents,
      currency,
      items: { create: orderItems },
      address: { create: address },
    },
    include: { items: true },
  });

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: order.items.map(i => ({
      quantity: i.quantity,
      price_data: {
        currency,
        unit_amount: i.unitPriceCents,
        product_data: { name: i.nameSnapshot },
      },
    })),
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
    metadata: {
      orderId: order.id,
    },
  });

  // Store session id
  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  res.json({ url: session.url });
});


const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});

