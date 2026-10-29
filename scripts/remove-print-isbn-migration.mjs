/**
 * Migration Script: Remove Print ISBN from Persistent Storage
 *
 * This migration safely strips the legacy `printISBN` field from existing MongoDB paper records.
 * It does NOT modify or delete any records, and keeps all other metadata (including `electronicISBN`) intact.
 *
 * Usage:
 *   MONGODB_URI="mongodb://..." node scripts/remove-print-isbn-migration.mjs
 */

import mongoose from "mongoose";

const uri = process.env.MONGODB_URI || "mongodb://admin:admin@localhost:27017/multiconw?authSource=admin";

async function runMigration() {
  console.log("Connecting to database...");
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  const db = mongoose.connection.db;

  console.log("Checking for papers collection...");
  const collections = await db.listCollections({ name: "papers" }).toArray();
  if (collections.length === 0) {
    console.log("No papers collection found. Nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  const papers = db.collection("papers");
  const countWithPrintIsbn = await papers.countDocuments({ printISBN: { $exists: true } });
  console.log(`Found ${countWithPrintIsbn} documents with printISBN.`);

  if (countWithPrintIsbn > 0) {
    const result = await papers.updateMany(
      { printISBN: { $exists: true } },
      { $unset: { printISBN: "" } }
    );
    console.log(`Migration successful. Updated ${result.modifiedCount} documents.`);
  } else {
    console.log("No documents contained printISBN. Schema is already clean.");
  }

  await mongoose.disconnect();
  console.log("Database connection closed.");
}

runMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

