import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function backup() {
  console.log("🔒 Starting KeevOS database backup...");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = path.join(process.cwd(), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const data = {
    timestamp,
    version: "1.0",
    tables: {} as Record<string, unknown[]>,
  };

  const tables = [
    "profile",
    "contact",
    "tenant",
    "landlord",
    "broker",
    "caseworker",
    "property",
    "housingCase",
    "task",
    "note",
    "document",
    "activityLog",
    "automationRule",
    "webhook",
    "integration",
  ] as const;

  for (const table of tables) {
    try {
      // @ts-expect-error - dynamic table access
      data.tables[table] = await prisma[table].findMany();
      console.log(`  ✓ Exported ${data.tables[table].length} records from ${table}`);
    } catch (err) {
      console.warn(`  ⚠ Could not export ${table}:`, err);
    }
  }

  const filename = `keevos-backup-${timestamp}.json`;
  const filepath = path.join(backupDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

  console.log(`\n✅ Backup complete: ${filepath}`);
  console.log(`   Size: ${(fs.statSync(filepath).size / 1024).toFixed(1)} KB`);

  // Record backup in database
  try {
    await prisma.backup.create({
      data: {
        backupType: "manual-cli",
        status: "completed",
        fileUrl: filepath,
        completedAt: new Date(),
      },
    });
  } catch {
    // Ignore if can't write backup record
  }
}

backup()
  .catch((e) => {
    console.error("❌ Backup failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
