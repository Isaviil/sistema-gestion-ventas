"use client";

import { useForm } from "react-hook-form";
import { User, KeyRound, Calendar } from "lucide-react";
import { CreatePaymentMethodRequest, PaymentMethodResponse } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import { useCreateFormaPago } from "../api/create-forma-pago";
import { useUpdateFormaPago } from "../api/[id]/update-forma-pago";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { toast } from "react-toastify";
import { Dispatch, SetStateAction, useEffect } from "react";

interface DialogAddFormaPagoProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: PaymentMethodResponse | null;
}

export const PaymentMethodValidator = Joi.object({
  forma_pago: Joi.string()
    .pattern(/^[A-Za-zÁÉÍÓÚáéíóúÑñÜü0-9\s%\-]+$/)
    .required()
    .messages({
      "string.empty": "La forma de pago es obligatoria",
      "string.pattern.base":
        "La forma de pago solo puede contener letras, números, espacios, porcentajes y guiones",
    }),

  codigo: Joi.string().pattern(/^\d+$/).allow(null, "").messages({
    "string.pattern.base": "El código debe contener solo números",
  }),

  dias: Joi.number().integer().min(0).required().messages({
    "number.base": "Los días deben ser un número entero",
    "number.integer": "Los días deben ser un número entero",
    "number.min": "Los días no pueden ser negativos",
  }),
});

// Forma de lo que enviaremos al hacer submit
const mapPaymentMethodToForm = (
  data: PaymentMethodResponse,
): CreatePaymentMethodRequest => ({
  forma_pago: data.forma_pago,
  codigo: data.codigo,
  dias: data.dias,
});

export function DialogAddFormaPago({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddFormaPagoProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): CreatePaymentMethodRequest => ({
    forma_pago: "",
    codigo: null,
    dias: 0,
  });

  /*
   * =========================
   *  MUTACIONES
   *  =========================
   */

  const createMutation = useCreateFormaPago();
  const updateMutation = useUpdateFormaPago();

  /*
   * =========================
   *  REACT HOOK FORM
   *  =========================
   */

  const methods = useForm<CreatePaymentMethodRequest>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(PaymentMethodValidator),
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
   *=========================
   *  SUBMIT Y AUTOCOMPLETADO
   *  =========================
   */

  // LoadInitialData
  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }

    reset(mapPaymentMethodToForm(data));
  }, [data, reset]);

  // Reinicia los datos al cerrar
  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  // Submit
  const onSubmit = async (values: CreatePaymentMethodRequest) => {
    if (!values.forma_pago.trim()) {
      toast.error("El nombre de la forma de pago es obligatorio.", {
        autoClose: 1500,
      });
      return;
    }

    if (Number.isNaN(values.dias)) {
      toast.error("Los días son obligatorios.", {
        autoClose: 1500,
      });
      return;
    }

    try {
      if (!isEditing) {
        await createMutation.mutateAsync(values);
      } else {
        await updateMutation.mutateAsync({
          id: data!.for_pago, // *Se agrega ! porque el id se necesita sí o sí para updatear; es decir, sí existe.
          data: values,
        });
      }

      setOpen(false);
      setClearSelectionCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error al procesar la forma de pago:", error);
    }
  };

  /*
   *=========================
   * FORMULARIO
   * =========================
   */

  return (
    <DialogAddElement
      open={open}
      setOpen={setOpen}
      title={isEditing ? "Editar forma de pago" : "Nueva forma de pago"}
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
        <div>
          <Label htmlFor="forma_pago">Nombre</Label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
            <Input
              id="forma_pago"
              type="text"
              placeholder="Nombre"
              className="pl-9"
              {...register("forma_pago")}
            />
          </div>
          {errors.forma_pago && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.forma_pago.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="codigo">Código</Label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="codigo"
                type="text"
                placeholder="Código"
                className="pl-9"
                {...register("codigo")}
              />
            </div>
            {errors.codigo && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.codigo.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="dias">Días</Label>
            <div className="relative flex items-center">
              <Calendar className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="dias"
                type="number"
                placeholder="Días"
                className="pl-9"
                {...register("dias", { valueAsNumber: true })}
              />
            </div>
            {errors.dias && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.dias.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </DialogAddElement>
  );
}
