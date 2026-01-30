import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { userQueries } from '@/db/queries';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[Auth][authorize] Credentials received:', credentials);
        const { email, password } = credentials!;

        if (!email || !password) {
          console.error('[Auth][authorize] Missing email or password');
          throw new Error('Email and password are required');
        }

        try {
          const user = await userQueries.getUserByEmail(email);

          if (!user) {
            console.error('[Auth][authorize] No user found with email:', email);
            throw new Error('No matching user found');
          }

          console.log('[Auth][authorize] User found, validating password');
          const isValid = await bcrypt.compare(password, user.hashedPassword);
          if (!isValid) {
            console.error('[Auth][authorize] Invalid password for user:', email);
            throw new Error('Invalid password');
          }

          console.log('[Auth][authorize] Authentication successful, returning user:', { id: user.id, email: user.email, username: user.username });
          return { id: user.id, email: user.email, username: user.username || '' };
        } catch (error) {
          console.error('[Auth][authorize] Database error:', error);
          throw new Error('Error retrieving user');
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

  pages: {
    signIn: '/auth/signin',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.username = user.username || '';
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        email: token.email as string,
        username: (token.username as string) || '',
      };
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
