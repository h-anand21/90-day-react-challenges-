import mongoose from 'mongoose';

const fileAttachmentSchema = new mongoose.Schema(
  {
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    publicId: {
      type: String, // Cloudinary public_id for deletion
      required: true,
    },
    fileType: {
      type: String,
      enum: ['image', 'pdf', 'document', 'other'],
      default: 'other',
    },
    mimeType: {
      type: String,
      default: '',
    },
    size: {
      type: Number, // in bytes
      default: 0,
    },
    // Optional — link file to a specific activity or reservation
    relatedActivity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Activity',
      default: null,
    },
    relatedReservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
    },
  },
  { timestamps: true },
);

fileAttachmentSchema.index({ trip: 1, createdAt: -1 });

const FileAttachment = mongoose.model('FileAttachment', fileAttachmentSchema);
export default FileAttachment;
