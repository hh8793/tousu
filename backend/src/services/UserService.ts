import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '@/config';
import logger from '@/utils/logger';
import UserModel from '@/models/User';
import { User, UserRole, LoginRequest, LoginResponse } from '@shared/types';

interface SanitizedUser extends Omit<User, 'password'> {
  _id: string;
}

function toSanitizedUser(user: any): SanitizedUser {
  const obj = user.toObject ? user.toObject() : user;
  const { password, ...rest } = obj;
  return {
    ...rest,
    _id: rest._id?.toString() || ''
  };
}

export class UserService {
  async register(userData: Omit<User, '_id' | 'createdAt' | 'updatedAt'>): Promise<SanitizedUser> {
    const existingUser = await UserModel.findOne({
      $or: [{ username: userData.username }, { email: userData.email }]
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = await UserModel.create({
      ...userData,
      password: hashedPassword
    });

    logger.info(`User registered: ${user.username}`);
    return toSanitizedUser(user);
  }

  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const user = await UserModel.findOne({ username: loginData.username });

    if (!user) {
      throw new Error('Invalid username or password');
    }

    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }

    const secret = config.jwtSecret || 'default-secret-key-must-be-at-least-32-characters-long';
    const token = jwt.sign(
      { id: user._id.toString(), username: user.username, role: user.role },
      secret as jwt.Secret,
      { expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'] }
    );

    logger.info(`User logged in: ${user.username}`);
    return {
      token,
      user: toSanitizedUser(user)
    };
  }

  async getUserById(id: string): Promise<SanitizedUser | null> {
    const user = await UserModel.findById(id);
    return user ? toSanitizedUser(user) : null;
  }

  async getAllUsers(role?: UserRole): Promise<SanitizedUser[]> {
    const query = role ? { role } : {};
    const users = await UserModel.find(query);
    return users.map(toSanitizedUser);
  }

  async updateUser(id: string, updateData: Partial<Omit<User, '_id' | 'createdAt' | 'updatedAt' | 'password'>>): Promise<SanitizedUser | null> {
    const user = await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    return user ? toSanitizedUser(user) : null;
  }

  async deleteUser(id: string): Promise<void> {
    await UserModel.findByIdAndDelete(id);
    logger.info(`User deleted: ${id}`);
  }
}

export const userService = new UserService();