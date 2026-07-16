const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['receptionist', 'doctor'], required: true },
    specialization: { type: String, trim: true, default: '' }, // only meaningful for doctors
  },
  { timestamps: true }
);

// Hash the password automatically before saving, but only if it changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
});

// Instance method to check a plaintext password against the stored hash.
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Strips the password out before sending a user object back to the client.
userSchema.methods.toSafeObject = function () {
  return { id: this._id, name: this.name, email: this.email, role: this.role, specialization: this.specialization };
};

module.exports = mongoose.model('User', userSchema);