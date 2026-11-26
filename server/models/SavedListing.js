// ============================================================
// A single bookmarked listing.
// ------------------------------------------------------------
// One document per (user, listing) pair — a user "saving" the
// same listing twice should update nothing, not create a
// duplicate, hence the compound unique index below.
// ============================================================
import mongoose from "mongoose";

const savedListingSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
  },
  listingId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// One save per user per listing — trying to insert the same pair
// twice throws a duplicate-key error instead of creating a second
// row, which the route handler below treats as a harmless no-op.
savedListingSchema.index({ firebaseUid: 1, listingId: 1 }, { unique: true });

// mongoose.models.X check avoids Mongoose re-compiling the same
// model twice on a warm serverless instance, which throws
// "Cannot overwrite model once compiled."
export default mongoose.models.SavedListing ||
  mongoose.model("SavedListing", savedListingSchema);