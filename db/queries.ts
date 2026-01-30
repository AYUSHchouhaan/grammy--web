import { db } from './drizzleclient';
import { users, type NewUser, type User } from './schema';
import { eq } from 'drizzle-orm';

export const userQueries = {
  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0] || null;
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  },

  // Create a new user (with 50 credits by default from schema)
  async createUser(data: { email: string; username?: string; hashedPassword: string }): Promise<User> {
    const result = await db.insert(users).values({
      email: data.email,
      username: data.username,
      hashedPassword: data.hashedPassword,
    }).returning();
    return result[0];
  },

  // Update user credits
  async updateCredits(userId: string, credits: number): Promise<User | null> {
    const result = await db
      .update(users)
      .set({ credits, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return result[0] || null;
  },

  // Get user credits
  async getCredits(userId: string): Promise<number | null> {
    const user = await db.select({ credits: users.credits }).from(users).where(eq(users.id, userId)).limit(1);
    return user[0]?.credits ?? null;
  },
};
