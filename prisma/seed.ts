import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";
import path from "path";

const url = process.env.TURSO_DATABASE_URL || `file:${path.join(process.cwd(), "dev.db")}`;
const authToken = process.env.TURSO_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url, authToken } as any);
const db = new PrismaClient({ adapter } as any);

// The knowledge the chat agent needs that isn't already derivable from
// lib/content.ts — team-maintained operational context, editable afterwards
// from /admin/agent.
const AGENT_INFO = `Discovery calls are free and typically last 45 minutes. Book by leaving name, email and a short description of the problem.
We work in weekly sprints. Clients see something usable within the first few weeks.
Every engagement ships into the client's own repositories and infrastructure — we never hold the code hostage.
We do not quote prices over chat or email; pricing always comes out of the discovery consultation.
Timezone coverage: Costa Rica (GMT-6), working across the USA to Argentina.`;

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@valcatech.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "admin123";

  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin ${email} already exists — leaving it alone.`);
  } else {
    await db.adminUser.create({
      data: {
        email,
        passwordHash: await bcrypt.hash(password, 10),
        name: "VALCA Admin",
        role: "super_admin",
      },
    });
    console.log(`Created super admin ${email}`);
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log("  ⚠  Seeded with the default password — change it from /admin/users before going live.");
    }
  }

  await db.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", agentInfo: AGENT_INFO },
  });
  console.log("Site settings ready.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
