const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required']
    },
    role: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'ADMIN'],
      default: 'STUDENT'
    },
    institution: {
      type: String,
      default: 'Institute of Thermal Technology'
    },
    department: {
      type: String,
      default: 'Mechanical Engineering Department'
    },
    studentIdNumber: {
      type: String,
      default: 'ME-2026-4401'
    },
    teacherIdNumber: {
      type: String
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Method to compare entered password with passwordHash
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Safe JSON serialization (strip passwordHash)
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
    institution: this.institution,
    department: this.department,
    studentIdNumber: this.studentIdNumber,
    teacherIdNumber: this.teacherIdNumber,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    lastLogin: this.lastLogin
  };
};

module.exports = mongoose.model('User', userSchema);
