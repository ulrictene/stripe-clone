import { prisma } from "./prisma";

async function main() {
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: [
      {
        name: "Minimal Hoodie",
        description: "Heavyweight hoodie, clean fit.",
        priceCents: 6500,
        currency: "gbp",
        imageUrl: "https://picsum.photos/seed/hoodie/800/600",
        active: true,
      },
      {
        name: "Everyday Tote",
        description: "Canvas tote for daily carry.",
        priceCents: 2800,
        currency: "gbp",
        imageUrl: "https://picsum.photos/seed/tote/800/600",
        active: true,
      },
      {
        name: "Desk Mat",
        description: "Soft-touch desk mat.",
        priceCents: 1900,
        currency: "gbp",
        imageUrl: "https://picsum.photos/seed/mat/800/600",
        active: true,
      },
      {
        name: "Stainless Bottle",
        description: "Insulated bottle, 500ml.",
        priceCents: 2400,
        currency: "gbp",
        imageUrl: "https://picsum.photos/seed/bottle/800/600",
        active: true,
      },
      {
        name: "Cap",
        description: "Unstructured cap with embroidered logo.",
        priceCents: 1600,
        currency: "gbp",
        imageUrl: "https://picsum.photos/seed/cap/800/600",
        active: true,
      }
    ],
  });

  console.log("✅ Seeded products.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
