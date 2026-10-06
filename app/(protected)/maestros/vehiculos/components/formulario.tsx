"use client";

import { useForm } from "react-hook-form";
import { CreateVehiculoRequest, Vehiculo } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import { useCreateVehiculo } from "../api/create-vehiculo";
import { useUpdateVehiculo } from "../api/[id]/update-vehiculo";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { Car, FileText, IdCard } from "lucide-react";

interface DialogAddVehiculoProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: Vehiculo | null;
}

export const VehiculoValidator = Joi.object({
  placa: Joi.string().required().messages({
    "string.empty": "La placa es obligatoria",
    "any.required": "La placa es obligatoria",
  }),
  marca: Joi.string().required().messages({
    "string.empty": "La marca es obligatoria",
    "any.required": "La marca es obligatoria",
  }),
  certificado: Joi.string().allow(null, ""),
});

const mapVehiculoToForm = (data: Vehiculo): CreateVehiculoRequest => ({
  placa: data.placa ?? "",
  marca: data.marca ?? "",
  certificado: data.certificado ?? null,
});

export function DialogAddVehiculo({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddVehiculoProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): CreateVehiculoRequest => ({
    placa: "",
    marca: "",
    certificado: null,
  });

  /*
   * =========================
   *     MUTACIONES Y HOOKS
   *  =========================
   */

  const createMutation = useCreateVehiculo();
  const updateMutation = useUpdateVehiculo();

  /*
   * =========================
   *     REACT HOOK FORM
   *  =========================
   */

  const methods = useForm<CreateVehiculoRequest>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(VehiculoValidator),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const isPending =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  /*
   * =========================
   *     EFECTOS
   *  =========================
   */

  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }

    reset(mapVehiculoToForm(data));
  }, [data, reset]);

  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  /*
   * =========================
   *       SUBMIT
   *       =========================
   */

  const onSubmit = async (values: CreateVehiculoRequest) => {
    if (!values.placa.trim()) {
      toast.error("La placa del vehículo es obligatoria.", {
        autoClose: 1500,
      });
      return;
    }

    if (!values.marca.trim()) {
      toast.error("La marca del vehículo es obligatoria.", {
        autoClose: 1500,
      });
      return;
    }

    const payload: CreateVehiculoRequest = {
      ...values,
    };

    try {
      if (!isEditing) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({
          id: data!.id_vehi,
          data: payload,
        });
      }

      setOpen(false);
      setClearSelectionCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error al procesar el vehículo:", error);
    }
  };

  return (
    <DialogAddElement
      open={open}
      setOpen={setOpen}
      title={isEditing ? "Editar vehículo" : "Nuevo vehículo"}
      onSave={() => {
        void handleSubmit(onSubmit)();
      }}
      onClose={() => {
        setClearSelectionCounter((prev) => prev + 1);
      }}
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      isSubmitting={isPending}
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="placa">Placa</Label>
            <div className="relative flex items-center">
              <IdCard className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="placa"
                type="text"
                placeholder="Placa del vehículo"
                className="pl-9"
                {...register("placa")}
              />
            </div>
            {errors.placa && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.placa.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="marca">Marca</Label>
            <div className="relative flex items-center">
              <Car className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="marca"
                type="text"
                placeholder="Marca del vehículo"
                className="pl-9"
                {...register("marca")}
              />
            </div>
            {errors.marca && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.marca.message}
              </span>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="certificado">Certificado</Label>
          <div className="relative flex items-center">
            <FileText className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <Input
              id="certificado"
              type="text"
              placeholder="Certificado (opcional)"
              className="pl-9"
              {...register("certificado")}
            />
          </div>
          {errors.certificado && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.certificado.message}
            </span>
          )}
        </div>
      </div>
    </DialogAddElement>
  );
}
