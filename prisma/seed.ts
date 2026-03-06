import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Plomberie", slug: "plomberie", icon: "🚿" },
  { name: "Électricité", slug: "electricite", icon: "⚡" },
  { name: "Serrurerie", slug: "serrurerie", icon: "🔒" },
  { name: "Chauffage", slug: "chauffage", icon: "🌡️" },
  { name: "Toiture", slug: "toiture", icon: "🏠" },
  { name: "Menuiserie", slug: "menuiserie", icon: "🔧" },
  { name: "Peinture", slug: "peinture", icon: "🖌️" },
  { name: "Nettoyage", slug: "nettoyage", icon: "🧹" },
];

async function main() {
  console.log("🌱 Seeding GoServi database...\n");

  // Categories
  for (const cat of CATEGORIES) {
    await prisma.serviceCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log(`✅ ${CATEGORIES.length} categories created`);

  const categories = await prisma.serviceCategory.findMany();
  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // Admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@goservi.ch" },
    update: {},
    create: {
      role: "ADMIN",
      firstName: "Admin",
      lastName: "GoServi",
      email: "admin@goservi.ch",
      password: adminPassword,
      isVerified: true,
    },
  });
  console.log(`✅ Admin: admin@goservi.ch / Admin123!`);

  // Demo client
  const clientPassword = await bcrypt.hash("Client123!", 12);
  const client = await prisma.user.upsert({
    where: { email: "client@goservi.ch" },
    update: {},
    create: {
      role: "CLIENT",
      firstName: "Marie",
      lastName: "Dupont",
      email: "client@goservi.ch",
      password: clientPassword,
      phone: "+41 79 123 45 67",
      isVerified: true,
    },
  });
  console.log(`✅ Client: client@goservi.ch / Client123!`);

  // Demo artisan — approved
  const artisanPassword = await bcrypt.hash("Artisan123!", 12);
  const artisanUser = await prisma.user.upsert({
    where: { email: "artisan@goservi.ch" },
    update: {},
    create: {
      role: "ARTISAN",
      firstName: "Pierre",
      lastName: "Martin",
      email: "artisan@goservi.ch",
      password: artisanPassword,
      phone: "+41 79 987 65 43",
      isVerified: true,
      artisanProfile: {
        create: {
          companyName: "Martin Plomberie Sàrl",
          rcNumber: "CH-550.1.123.456-7",
          city: "Lausanne",
          description: "Plombier professionnel avec 15 ans d'expérience dans la région lausannoise.",
          isApproved: true,
          emergencyAvailable: true,
          ratingAverage: 4.8,
          ratingCount: 23,
          latitude: 46.5197,
          longitude: 6.6323,
        },
      },
    },
    include: { artisanProfile: true },
  });

  // Artisan services
  if (artisanUser.artisanProfile) {
    const servicesToCreate = [
      { slug: "plomberie", basePrice: 120, emergencyFee: 60 },
      { slug: "chauffage", basePrice: 150, emergencyFee: 75 },
    ];

    for (const s of servicesToCreate) {
      await prisma.artisanService.upsert({
        where: {
          artisanId_categoryId: {
            artisanId: artisanUser.artisanProfile.id,
            categoryId: catMap[s.slug],
          },
        },
        update: {},
        create: {
          artisanId: artisanUser.artisanProfile.id,
          categoryId: catMap[s.slug],
          basePrice: s.basePrice,
          emergencyFee: s.emergencyFee,
        },
      });
    }
  }
  console.log(`✅ Artisan: artisan@goservi.ch / Artisan123! (approuvé)`);

  // Demo artisan — pending
  const artisan2Password = await bcrypt.hash("Artisan123!", 12);
  await prisma.user.upsert({
    where: { email: "artisan2@goservi.ch" },
    update: {},
    create: {
      role: "ARTISAN",
      firstName: "Sophie",
      lastName: "Bernard",
      email: "artisan2@goservi.ch",
      password: artisan2Password,
      phone: "+41 78 111 22 33",
      isVerified: false,
      artisanProfile: {
        create: {
          companyName: "Bernard Électricité",
          rcNumber: "CH-550.2.234.567-8",
          city: "Lausanne",
          description: "Électricienne qualifiée, spécialisée dépannage urgent.",
          isApproved: false,
          emergencyAvailable: true,
          latitude: 46.5230,
          longitude: 6.6282,
        },
      },
    },
  });
  console.log(`✅ Artisan (pending): artisan2@goservi.ch / Artisan123!`);

  console.log("\n🎉 Seed completed!\n");
  console.log("Credentials:");
  console.log("  Admin:   admin@goservi.ch    / Admin123!");
  console.log("  Client:  client@goservi.ch   / Client123!");
  console.log("  Artisan: artisan@goservi.ch  / Artisan123! (approved)");
  console.log("  Artisan: artisan2@goservi.ch / Artisan123! (pending)");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
