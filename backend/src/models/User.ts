import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@shared/types';

interface UserDocument extends Document {
  username: string;
  password: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  role: { type: String, enum: Object.values(UserRole), default: UserRole.CITIZEN },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<UserDocument>('User', UserSchema);