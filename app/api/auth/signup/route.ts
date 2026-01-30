import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { userQueries } from '@/db/queries';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userQueries.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user (will have 50 credits by default)
    const user = await userQueries.createUser({
      email,
      username: username || email.split('@')[0],
      hashedPassword,
    });

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username,
          credits: user.credits 
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Signup] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
