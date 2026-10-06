import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { prisma } from "@/app/lib/prisma";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Usuario",
          type: "text",
        },
        password: {
          label: "Contraseña",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username,
          },
        });

        if (!user || !user.flg_activo) {
          return null;
        }

        if (user.password !== credentials.password) {
          return null;
        }

        return {
          id: user.id_usu.toString(),
          id_usu: user.id_usu.toString(),
          username: user.username,
          name: `${user.nombres} ${user.apellidos}`,
          email: user.email,
          rol: user.rol,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id_usu = user.id_usu;
        token.username = user.username;
        token.rol = user.rol;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id_usu = token.id_usu;
        session.user.username = token.username;
        session.user.rol = token.rol;
      }

      return session;
    },
  },
});

export { handler as GET, handler as POST };
