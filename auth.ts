import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

// Providers só entram se as credenciais existirem no ambiente.
const providers = [
  process.env.AUTH_GITHUB_ID && GitHub,
  process.env.AUTH_GOOGLE_ID && Google,
].filter(Boolean) as (typeof GitHub)[];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    // Guarda "<provider>:<id>" para não colidir ids entre providers.
    jwt({ token, account }) {
      if (account) token.uid = `${account.provider}:${account.providerAccountId}`;
      return token;
    },
    session({ session, token }) {
      (session as any).uid = token.uid;
      return session;
    },
  },
});
