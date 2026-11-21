import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useUbigeos } from "@/app/services/useUbigeo";
import { useState } from "react";

type DialogAddUbigeoOrigenProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  ubigeoValue: string | null;
  onConfirm: (ubigeo: string) => void;
};

export function DialogAddUbigeo({
  open,
  setOpen,
  onConfirm,
  ubigeoValue,
}: DialogAddUbigeoOrigenProps) {
  const { data: ubigeoData, isLoading } = useUbigeos();
  const {
    departamentos = [],
    distritos = [],
    provincias = [],
  } = ubigeoData || {};

  const [departamento, setDepartamento] = useState("");
  const [provincia, setProvincia] = useState("");
  const [distrito, setDistrito] = useState("");

  const [prevOpen, setPrevOpen] = useState(open);
  const [prevUbigeoValue, setPrevUbigeoValue] = useState(ubigeoValue);

  if (open !== prevOpen || ubigeoValue !== prevUbigeoValue) {
    setPrevOpen(open);
    setPrevUbigeoValue(ubigeoValue);

    if (open) {
      if (ubigeoValue) {
        setDepartamento(ubigeoValue.slice(0, 2));
        setProvincia(ubigeoValue.slice(0, 4));
        setDistrito(ubigeoValue);
      } else {
        setDepartamento("");
        setProvincia("");
        setDistrito("");
      }
    }
  }

  const provinciasFiltradas = provincias.filter(
    (p) => p.id_depart === departamento,
  );

  const distritosFiltrados = distritos.filter(
    (d) => d.id_provincia === provincia,
  );

  const handleConfirm = () => {
    if (departamento && provincia && distrito) {
      onConfirm(distrito);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setDepartamento("");
    setProvincia("");
    setDistrito("");
    setOpen(false);
  };

  if (isLoading) return <div>Cargando ubigeos...</div>;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="px-2 md:max-w-[260px]! shadow-2xl md:px-4"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        aria-describedby={undefined}
      >
        <DialogHeader>
          <DialogTitle className="text-l font-semibold text-blue-950 dark:text-white tracking-tight">
            Seleccione una ubicación
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-12 gap-3">
          {/* Departamento */}
          <div className="col-span-12">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Departamento <span className="text-red-500">*</span>
            </label>
            <Select
              value={departamento}
              onValueChange={(val) => {
                setDepartamento(val);
                setProvincia("");
                setDistrito("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccione departamento" />
              </SelectTrigger>
              <SelectContent>
                {departamentos.map((dep) => (
                  <SelectItem key={dep.id_depart} value={dep.id_depart}>
                    {dep.departamento}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Provincia */}
          <div className="col-span-12">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Provincia <span className="text-red-500">*</span>
            </label>
            <Select
              value={provincia}
              onValueChange={(val) => {
                setProvincia(val);
                setDistrito("");
              }}
              disabled={!departamento}
            >
              <SelectTrigger
                className={
                  !departamento ? "opacity-50 bg-muted cursor-not-allowed" : ""
                }
              >
                <SelectValue placeholder="Seleccione provincia" />
              </SelectTrigger>
              <SelectContent>
                {provinciasFiltradas.map((prov) => (
                  <SelectItem key={prov.id_provincia} value={prov.id_provincia}>
                    {prov.provincia}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Distrito */}
          <div className="col-span-12">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Distrito <span className="text-red-500">*</span>
            </label>
            <Select
              value={distrito || ""}
              onValueChange={setDistrito}
              disabled={!provincia}
            >
              <SelectTrigger
                className={
                  !provincia ? "opacity-50 bg-muted cursor-not-allowed" : ""
                }
              >
                <SelectValue placeholder="Seleccione distrito" />
              </SelectTrigger>
              <SelectContent>
                {distritosFiltrados.map((dist) => (
                  <SelectItem key={dist.id_distrito} value={dist.id_distrito}>
                    {dist.distrito}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex mt-4 gap-1 w-full">
          <button
            type="button"
            className="h-7 px-3 rounded-lg bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-700 dark:border-white/15 dark:hover:bg-white/5 dark:text-white/80 text-sm font-medium transition-all"
            onClick={handleCancel}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="h-7 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-600/25"
            onClick={handleConfirm}
            disabled={!departamento || !provincia || !distrito}
          >
            Confirmar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
