"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { queryClient } from "./lib/react-query";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          {children}
          <ToastContainer position="top-right" />
        </ThemeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
