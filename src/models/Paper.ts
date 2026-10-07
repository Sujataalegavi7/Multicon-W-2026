import mongoose, { Schema, InferSchemaType } from "mongoose";

export const STATUSES = ["pending", "approved", "rejected", "changes_requested"] as const;
export type Status = (typeof STATUSES)[number];

const paperSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    authors: { type: [String], required: true },
    abstract: { type: String, required: true },
    conferenceName: { type: String, required: true, index: true },
    conferenceDate: { type: String, default: "" },
    conferenceLocation: { type: String, default: "" },
    doi: { type: String, default: "" },
    electronicISBN: { type: String, default: "" },
    printISBN: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    // Object keys inside the private MinIO bucket. Never a public URL.
    pdfKey: { type: String, required: true },
    pdfSize: { type: Number, default: 0 },
    thumbnailKey: { type: String, default: null },
    thumbnailType: { type: String, default: null },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: STATUSES, default: "pending" },
    adminRemarks: { type: String, default: "" },
    isFeatured: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

paperSchema.index(
  { title: "text", keywords: "text", authors: "text", abstract: "text" },
  { weights: { title: 10, keywords: 5, authors: 3, abstract: 1 }, name: "paper_text" }
);
paperSchema.index({ status: 1, createdAt: -1 });
paperSchema.index({ isFeatured: 1, status: 1 });

export type PaperDoc = InferSchemaType<typeof paperSchema> & { _id: mongoose.Types.ObjectId; createdAt: Date; updatedAt: Date };
export const Paper = (mongoose.models.Paper as mongoose.Model<PaperDoc>) || mongoose.model<PaperDoc>("Paper", paperSchema);
