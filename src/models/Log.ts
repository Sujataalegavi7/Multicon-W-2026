import mongoose, { Schema } from "mongoose";

const logSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  paper: { type: Schema.Types.ObjectId, ref: "Paper" },
  timestamp: { type: Date, default: Date.now, index: true },
});

export const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

export async function audit(user: unknown, action: string, paper?: unknown) {
  try {
    await Log.create({ user, action, paper });
  } catch (err) {
    console.error("Audit log failed", err);
  }
}
