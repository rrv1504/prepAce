const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["pdf", "video", "note", "roadmap"],
      required: true,
    },
    url: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String, default: "" },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storageProvider: {
      type: String,
      enum: ["cloudinary", "azure", "external"],
      default: "external",
    },
    storageKey: { type: String },
    mimeType: { type: String },
    size: { type: Number },
    format: { type: String },
    originalFilename: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

resourceSchema.virtual("uploadedAt").get(function uploadedAt() {
  return this.createdAt ? this.createdAt.toISOString().slice(0, 10) : undefined;
});

resourceSchema.index({ type: 1, topic: 1 });
resourceSchema.index({ uploadedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Resource", resourceSchema);
