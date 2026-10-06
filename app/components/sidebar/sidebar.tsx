"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  ChevronDown,
  X,
  Users,
  CreditCard,
  Package,
  Wrench,
} from "lucide-react";
import { AxonLogo } from "@/app/services/logo";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  // Estados independientes para cada subgrupo
  const [openVentas, setOpenVentas] = useState(true);
  const [openContactos, setOpenContactos] = useState(true);
  const [openParametros, setOpenParametros] = useState(true);
  const [openCatalogo, setOpenCatalogo] = useState(true);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r flex flex-col justify-between p-4 transition-all duration-200 ease-in-out select-none
          md:static md:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          backgroundColor: "var(--color-component-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <div className="space-y-6 overflow-y-auto custom-scrollbar">
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between px-2 py-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 transition-opacity hover:opacity-90"
            >
              <AxonLogo className="w-9 h-9 shrink-0" />
              <span
                className="font-black text-lg tracking-tight leading-none"
                style={{ color: "var(--color-regular-text)" }}
              >
                Axon
              </span>
            </Link>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors md:hidden"
              style={{ color: "var(--color-regular-text)" }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-4 text-xs font-medium">
            {/* Dashboard */}
            <div>
              <span className="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Main
              </span>
              <div className="mt-1.5">
                <Link
                  href="/dashboard"
                  onClick={onClose}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
                    isActive("/dashboard")
                      ? "font-semibold border-l-2 border-blue-500"
                      : "hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                  style={{
                    backgroundColor: isActive("/dashboard")
                      ? "var(--color-background-primary)"
                      : "transparent",
                    color: "var(--color-regular-text)",
                  }}
                >
                  <LayoutDashboard
                    className={`w-4 h-4 ${isActive("/dashboard") ? "text-blue-500" : ""}`}
                  />
                  <span>Dashboard</span>
                </Link>
              </div>
            </div>

            {/* MAESTROS */}
            <div>
              <span className="px-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                Maestros
              </span>
              <div className="mt-1.5 space-y-2">
                {/* 1. Clientes y Vendedores */}
                <div>
                  <button
                    onClick={() => setOpenContactos(!openContactos)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ color: "var(--color-regular-text)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Entidades</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        openContactos ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      openContactos
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="ml-6 border-l pl-2 space-y-1 my-1"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        {[
                          { href: "/maestros/clientes", label: "Clientes" },
                          { href: "/maestros/vendedores", label: "Vendedores" },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`block px-3 py-1.5 rounded-md transition-colors ${
                              isActive(item.href)
                                ? "text-blue-500 font-semibold bg-blue-500/10"
                                : "hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                            style={{
                              color: isActive(item.href)
                                ? undefined
                                : "var(--color-regular-text)",
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formas de pago, Tipo de documento, Almacenes, Vehículos */}
                <div>
                  <button
                    onClick={() => setOpenParametros(!openParametros)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ color: "var(--color-regular-text)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Parámetros</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        openParametros ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      openParametros
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="ml-6 border-l pl-2 space-y-1 my-1"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        {[
                          {
                            href: "/maestros/formas-de-pago",
                            label: "Formas de Pago",
                          },
                          {
                            href: "/maestros/tipo-de-documentos",
                            label: "Tipos de Documento",
                          },
                          { href: "/maestros/almacenes", label: "Almacenes" },
                          { href: "/maestros/vehiculos", label: "Vehículos" },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`block px-3 py-1.5 rounded-md transition-colors ${
                              isActive(item.href)
                                ? "text-blue-500 font-semibold bg-blue-500/10"
                                : "hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                            style={{
                              color: isActive(item.href)
                                ? undefined
                                : "var(--color-regular-text)",
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tipo de cambio y Artículos */}
                <div>
                  <button
                    onClick={() => setOpenCatalogo(!openCatalogo)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ color: "var(--color-regular-text)" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">Catálogo y Operación</span>
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                        openCatalogo ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-200 ease-in-out ${
                      openCatalogo
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div
                        className="ml-6 border-l pl-2 space-y-1 my-1"
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        {[
                          { href: "/maestros/articulos", label: "Artículos" },
                          {
                            href: "/maestros/tipo-de-cambio",
                            label: "Tipo de Cambio",
                          },
                        ].map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`block px-3 py-1.5 rounded-md transition-colors ${
                              isActive(item.href)
                                ? "text-blue-500 font-semibold bg-blue-500/10"
                                : "hover:bg-black/5 dark:hover:bg-white/5"
                            }`}
                            style={{
                              color: isActive(item.href)
                                ? undefined
                                : "var(--color-regular-text)",
                            }}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gestión Comercial */}
            <div>
              <div className="flex items-center gap-1.5 px-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Gestión Comercial
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-medium text-amber-500 ring-1 ring-inset ring-amber-500/20">
                  <Wrench className="w-2.5 h-2.5" />
                  En construcción
                </span>
              </div>
              <div className="mt-1.5 space-y-1">
                <button
                  onClick={() => setOpenVentas(!openVentas)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  style={{ color: "var(--color-regular-text)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <ShoppingCart className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">Ventas</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gray-500 transition-transform duration-200 ${
                      openVentas ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`grid transition-all duration-200 ease-in-out ${
                    openVentas
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div
                      className="ml-6 border-l pl-2 space-y-1 my-1"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      {[
                        { href: "/movimientos/pedidos", label: "Pedidos" },
                        {
                          href: "/movimientos/facturacion",
                          label: "Facturación",
                        },
                        {
                          href: "/movimientos/remisiones",
                          label: "Remisiones",
                        },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          className={`block px-3 py-1.5 rounded-md transition-colors ${
                            isActive(item.href)
                              ? "text-blue-500 font-semibold bg-blue-500/10"
                              : "hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                          style={{
                            color: isActive(item.href)
                              ? undefined
                              : "var(--color-regular-text)",
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/* Configuración (Vacío/Comentado por ahora) */}
        <div
          className="border-t pt-3"
          style={{ borderColor: "var(--color-border)" }}
        >
          {/* Vacío por ahora */}
        </div>
      </aside>
    </>
  );
}
