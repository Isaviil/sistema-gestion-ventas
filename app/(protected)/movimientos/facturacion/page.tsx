"use client";

import { SearchComponent } from "@/app/components/ui/search-component";
import { useCallback, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Spinner } from "@/app/components/loading/Spinner";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import LoadingSidebar from "@/app/components/loading/LoadingSidebar";
import Input from "@/app/components/ui/input";
import { useVendedores } from "../../maestros/vendedores/api/list-vendedores";
import Button from "@/app/components/ui/button";
import { Eye, FileSpreadsheet, PlusCircle } from "lucide-react";
import { IFacturaListado } from "./types";
import { useListarFacturas } from "./api/list-facturas";
import { exportFacturasExcel } from "./utils/exportarExcel";
import { columnsListado } from "./components/columns/columns-listado";

export default function Facturacion() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedElement, setSelectedElement] = useState<IFacturaListado[]>([]);

  /*
   *=========================
   * URL Y FILTROS
   *=========================
   */

  const updateUrlParams = useCallback(
    (next: Record<string, string | Date | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === "") {
          params.delete(key);
          return;
        }

        params.set(
          key,
          value instanceof Date
            ? value.toISOString().slice(0, 10)
            : String(value),
        );
      });

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  type FilterType = "year_month" | "date_range";

  const toFilterType = (value: string | null): FilterType =>
    value === "date_range" ? "date_range" : "year_month";

  /*
   *=========================
   * QUERIES
   *=========================
   */

  const filters = {
    filterType: toFilterType(searchParams.get("ft")),
    year: searchParams.get("year") ?? "",
    month: searchParams.get("month") ?? "",
    startDate: searchParams.get("start") ?? "",
    endDate: searchParams.get("end") ?? "",
    cliente: searchParams.get("cliente") ?? "",
    estado: searchParams.get("estado") ?? "all",
    vendedor: searchParams.get("vendedor") ?? "all",
  };

  const {
    data: dataFacturas = [],
    isLoading: isLoadingFacturas,
    isFetching: isFetchingFacturas,
  } = useListarFacturas(
    filters.filterType,
    filters.year,
    filters.month,
    filters.startDate,
    filters.endDate,
  );

  const { data: dataVendedor, isLoading: isLoadingVendedor } = useVendedores();

  const [clienteInput, setClienteInput] = useState(filters.cliente);

  /*
   *=========================
   * FILTROS
   *=========================
   */

  const handleFilter = async (params: {
    filterType: "year_month" | "date_range";
    year?: string;
    month?: string;
    startDate?: string | Date;
    endDate?: string | Date;
  }) => {
    if (params.filterType === "year_month") {
      updateUrlParams({
        ft: params.filterType,
        year: params.year,
        month: params.month,
        start: undefined,
        end: undefined,
      });
    } else {
      updateUrlParams({
        ft: params.filterType,
        start: params.startDate,
        end: params.endDate,
        year: undefined,
        month: undefined,
      });
    }
  };

  const handleExportarExcel = () => {
    exportFacturasExcel(dataFacturas);
  };

  // Filtro local
  const facturasFiltradas = useMemo(() => {
    return dataFacturas.filter((factura) => {
      const matchCliente = (factura.nomaux ?? "")
        .toLowerCase()
        .includes(clienteInput.toLowerCase());

      const matchEstado =
        filters.estado === "all" || factura.estado === filters.estado;

      const matchVendedor =
        filters.vendedor === "all" ||
        factura.id_ven === Number(filters.vendedor);

      return matchCliente && matchEstado && matchVendedor;
    });
  }, [dataFacturas, filters.estado, filters.vendedor, clienteInput]);

  /*
   *=========================
   * HANDLERS
   *=========================
   */

  const handleAgregar = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");

    router.push(`/movimientos/facturacion/nuevo?${params.toString()}`);
  };

  const handleVisualizar = () => {
    if (selectedElement.length === 0) return;

    const params = new URLSearchParams(searchParams.toString());

    router.push(
      `/movimientos/facturacion/${selectedElement[0].id_cpc}?${params.toString()}`,
    );
  };

  /*
   *=========================
   * FORMULARIO
   *=========================
   */

  if (isLoadingFacturas || isFetchingFacturas) {
    return (
      <div
        className="px-4 sm:px-6 py-6 max-w-4xl mx-auto border rounded-2xl shadow-xl flex items-center justify-center h-96"
        style={{
          backgroundColor: "var(--color-component-background)",
          borderColor: "var(--color-border)",
        }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 flex">
      <div className="w-full max-w-[1200px]">
        <h1 className="text-lg font-bold text-[var(--color-regular-text)] mb-5">
          Gestión de Facturas
        </h1>

        <div className="flex items-center gap-1 mb-1">
          <Button
            className="cursor-pointer"
            variant="success"
            size="sm"
            startIcon={<PlusCircle className="w-4 h-4" />}
            onClick={handleAgregar}
          >
            Agregar
          </Button>

          <Button
            variant="info"
            size="sm"
            className="cursor-pointer"
            startIcon={<Eye className="w-4 h-4" />}
            disabled={selectedElement.length === 0}
            onClick={handleVisualizar}
          >
            Visualizar
          </Button>

          <Button
            variant="excel"
            size="sm"
            className="cursor-pointer"
            startIcon={<FileSpreadsheet className="w-4 h-4" />}
            disabled={isLoadingFacturas || dataFacturas.length === 0}
            onClick={handleExportarExcel}
          >
            Excel
          </Button>
        </div>

        <SearchComponent
          onFilter={(params) => {
            void handleFilter(params);
          }}
          initialValues={{
            filterType: filters.filterType,
            year: filters.year || undefined,
            month: filters.month || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
          }}
        />

        <div className="flex flex-wrap items-end gap-3 pt-3 border-t border-[var(--color-border)] text-xs mb-2">
          {/* Cliente */}
          <div className="flex flex-col w-[300px]">
            <Label htmlFor="cliente_filtro">Cliente</Label>
            <Input
              id="cliente_filtro"
              value={clienteInput}
              onChange={(e) => {
                const value = e.target.value;
                setClienteInput(value);
                updateUrlParams({
                  cliente: value || undefined,
                });
              }}
              placeholder="Filtrar por cliente"
              className="h-9 text-xs bg-transparent"
            />
          </div>

          {/* Vendedor */}
          <div className="flex flex-col w-[250px]">
            <Label htmlFor="id_ven">Vendedor</Label>
            <Select
              value={filters.vendedor}
              onValueChange={(value) =>
                updateUrlParams({
                  vendedor: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger id="id_ven" className="h-9 text-xs w-full min-w-0">
                <SelectValue placeholder="Seleccione un vendedor" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">TODOS</SelectItem>

                {isLoadingVendedor ? (
                  <LoadingSidebar />
                ) : (
                  dataVendedor?.map((vendedor) => (
                    <SelectItem
                      key={vendedor.id_aux}
                      value={vendedor.id_aux.toString()}
                    >
                      {vendedor.des_aux}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="flex flex-col w-[180px]">
            <Label htmlFor="estadoActual">Estado</Label>
            <Select
              value={filters.estado}
              onValueChange={(value) =>
                updateUrlParams({
                  estado: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger
                id="estadoActual"
                className="h-9 text-xs w-full min-w-0"
              >
                <SelectValue placeholder="TODOS" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">TODOS</SelectItem>
                <SelectItem value="INGRESADO">INGRESADO</SelectItem>
                <SelectItem value="ANULADO">ANULADO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="w-full">
          {facturasFiltradas.length > 0 ? (
            <DataTable
              data={facturasFiltradas}
              columns={columnsListado}
              onRowsSelected={setSelectedElement}
            />
          ) : (
            <div
              className="flex flex-col items-center justify-center h-90 rounded-xl border border-dashed transition-colors duration-200"
              style={{
                backgroundColor: "var(--color-component-background)",
                borderColor: "var(--color-border)",
              }}
            >
              <p
                className="text-xs font-medium opacity-60"
                style={{ color: "var(--color-regular-text)" }}
              >
                No se encontraron facturas.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
