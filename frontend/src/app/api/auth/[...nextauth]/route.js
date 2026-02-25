import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const ADMIN_EMAIL = 'bmayer.rojel@gmail.com';

const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn() {
      return true; // Allow all Google accounts
    },
    async session({ session }) {
      if (session?.user) {
        session.user.isAdmin = session.user.email === ADMIN_EMAIL;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
