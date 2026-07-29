const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const db = new PrismaClient();

async function main() {
  const ownerEmail = process.env.OWNER_EMAIL || "crochybyqueen@gmail.com";
  const ownerPassword = process.env.OWNER_PASSWORD || "workshop123";

  const existing = await db.user.findUnique({ where: { email: ownerEmail } });
  if (existing) {
    console.log(`Owner account already exists: ${ownerEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(ownerPassword, 10);
  await db.user.create({
    data: {
      name: "Workshop Owner",
      email: ownerEmail,
      passwordHash,
      role: "OWNER",
    },
  });

  console.log("Owner account created:");
  console.log(`  Email:    ${ownerEmail}`);
  console.log(`  Password: ${ownerPassword}`);
  console.log("Log in at /admin/login — change this password by signing up a new");
  console.log("owner user and updating the role in the database, or add a");
  console.log("'change password' feature before going live.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
