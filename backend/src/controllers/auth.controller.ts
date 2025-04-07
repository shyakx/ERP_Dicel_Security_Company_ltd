import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, position, department, dateOfBirth, dateJoined } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
    } catch (dbError) {
      return res.status(500).json({ message: 'Error checking user existence', error: dbError });
    }

    // Hash password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (hashError) {
      return res.status(500).json({ message: 'Error hashing password', error: hashError });
    }

    // Create user
    let user;
    try {
      user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber,
          position,
          department,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
          dateJoined: dateJoined ? new Date(dateJoined) : undefined
        }
      });
    } catch (dbError) {
      return res.status(500).json({ message: 'Error creating user', error: dbError });
    }

    // Generate token
    let token;
    try {
      token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );
    } catch (tokenError) {
      return res.status(500).json({ message: 'Error generating token', error: tokenError });
    }

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        department: user.department
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error registering user', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (dbError) {
      return res.status(500).json({ message: 'Error finding user', error: dbError });
    }

    // Check password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    } catch (bcryptError) {
      return res.status(500).json({ message: 'Error validating password', error: bcryptError });
    }

    // Generate token
    let token;
    try {
      token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1d' }
      );
    } catch (tokenError) {
      return res.status(500).json({ message: 'Error generating token', error: tokenError });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        position: user.position,
        department: user.department
      },
      token
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging in', error });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Find user
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
    } catch (dbError) {
      return res.status(500).json({ message: 'Error finding user', error: dbError });
    }

    // Check current password
    let isPasswordValid;
    try {
      isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
    } catch (bcryptError) {
      return res.status(500).json({ message: 'Error validating password', error: bcryptError });
    }

    // Hash new password
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    } catch (hashError) {
      return res.status(500).json({ message: 'Error hashing password', error: hashError });
    }

    // Update password
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
    } catch (dbError) {
      return res.status(500).json({ message: 'Error updating password', error: dbError });
    }

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error changing password', error });
  }
}; 