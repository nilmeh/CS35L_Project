import mongoose from 'mongoose';

const { Schema } = mongoose;

const userSchema = new Schema({
  firebaseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  allergens: { type: [String], default: [] },
  vegetarian: { type: Boolean, default: false },
  vegan: { type: Boolean, default: false },
  dietaryRestrictions: { type: [String], default: [] }, // e.g. kosher, halal
  profilePicture: { type: String }, // URL to profile picture if available
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
