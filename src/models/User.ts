import mongoose, { Schema, InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    loginId: { type: String, unique: true, sparse: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["contributor", "admin"], default: "contributor" },
    isActive: { type: Boolean, default: true },
    department: { type: String, default: "" },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = (mongoose.models.User as mongoose.Model<UserDoc>) || mongoose.model<UserDoc>("User", userSchema);
