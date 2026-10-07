"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { Label } from "../components/ui/label";
import Input from "../components/ui/input";
import Button from "../components/ui/button";
import { AxonLogo } from "../services/logo";
import { getSession, signIn, useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const emptySubscribe = () => () => {};

export default function LoginPage() {
  const { theme, setTheme } = useTheme();

  // Evita errores de hidratación al renderizar el tema
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const router = useRouter();
  const { status } = useSession(); // Verifica la sesión

  const [showPassword, setShowPassword] = useState(false);
  const [usuario, setUsuario] = useState("ADMIN");
  const [password, setPassword] = useState("123");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Submit con next
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usuario.trim() || !password.trim()) {
      setError(true);
      return;
    }

    setError(false);
    setIsLoading(true);

    const result = await signIn("credentials", {
      username: usuario,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(true);
      setIsLoading(false);
      return;
    }

    const session = await getSession();

    toast.success(`Bienvenido ${session?.user.name ?? ""}`);

    router.push("/dashboard");
  };

  // Si estamos logueados, nos lleva al dashboard por defecto
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div
        className="flex min-h-screen w-full items-center justify-center font-medium"
        style={{
          backgroundColor: "var(--color-background-primary)",
          color: "var(--color-regular-text)",
        }}
      >
        Cargando...
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen w-full items-center justify-center relative overflow-hidden p-4 cursor-default select-none transition-colors duration-200"
      style={{
        backgroundColor: "var(--color-background-primary)",
        color: "var(--color-regular-text)",
      }}
    >
      <div className="absolute top-4 right-4 z-20">
        {isMounted ? (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            type="button"
            className="p-2.5 rounded-xl border backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
            style={{
              backgroundColor: "var(--color-component-background)",
              borderColor: "var(--color-border)",
            }}
            aria-label="Cambiar tema"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>
        ) : (
          <div className="w-10 h-10 rounded-xl border border-transparent" />
        )}
      </div>

      {/* Luz Radial Central */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #2068bb 0%, transparent 70%)",
        }}
      />

      {/* Malla de Puntos */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(var(--color-regular-text) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div
        className="relative z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl border backdrop-blur-md transition-all duration-200 border-t-slate-500/30"
        style={{
          backgroundColor: "var(--color-component-background)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center justify-center gap-3">
          <AxonLogo className="w-16 h-16 filter drop-shadow-[0_4px_12px_rgba(255,107,74,0.35)]" />

          {/* Nombre de empresa */}
          <div
            className="px-4 py-1.5 rounded-lg font-extrabold text-xs tracking-widest uppercase border cursor-default shadow-sm opacity-90"
            style={{
              backgroundColor: "var(--color-background-primary)",
              borderColor: "var(--color-border)",
              color: "var(--color-regular-text)",
            }}
          >
            AXON <span style={{ color: "#2068bb" }}>SYSTEM</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1 cursor-default">
            Inicio de Sesión
          </h1>
        </div>

        {error && (
          <p className="text-xs text-amber-500 font-medium text-center mb-4 cursor-default">
            Complete los campos necesarios *
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="usuario" className="cursor-default">
              Usuario <span className="text-red-500">*</span>
            </Label>
            <Input
              id="usuario"
              type="text"
              value={usuario}
              disabled={isLoading}
              onChange={(e) => setUsuario(e.target.value)}
              error={error && !usuario.trim()}
            />
          </div>

          <div>
            <Label htmlFor="password" className="cursor-default">
              Contraseña <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                disabled={isLoading}
                onChange={(e) => setPassword(e.target.value)}
                error={error && !password.trim()}
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-start">
            <Link
              href="#"
              className="text-xs font-semibold text-slate-400 hover:text-slate-200 hover:underline cursor-default transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 cursor-default flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </form>

        <div className="text-xs text-center mt-6 text-slate-400 cursor-default">
          &copy; {new Date().getFullYear()} AXON SYSTEM
        </div>
      </div>
    </div>
  );
}
