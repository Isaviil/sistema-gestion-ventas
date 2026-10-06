import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id_usu: string;
      username: string;
      rol: "ADMIN" | "USER";
    } & DefaultSession["user"];
  }

  interface User {
    id_usu: string;
    username: string;
    rol: "ADMIN" | "USER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_usu: string;
    username: string;
    rol: "ADMIN" | "USER";
  }
}
