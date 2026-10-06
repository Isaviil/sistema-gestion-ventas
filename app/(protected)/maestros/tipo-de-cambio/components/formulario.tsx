"use client";

import { Controller, useForm } from "react-hook-form";
import { CreateTipoCambioRequest, TipoCambio } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { toast } from "react-toastify";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useCreateTipoCambio } from "../api/create-tipo-cambio";
import { useUpdateTipoCambio } from "../api/[id]/update-tipo-cambio";
import InputNumber from "@/app/components/ui/input-number";

interface DialogAddTipoCambioProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: TipoCambio | null;
}

export const TipoCambioValidator = Joi.object({
  fchcmb: Joi.string().required().messages({
    "string.empty": "La fecha es obligatoria",
    "any.required": "La fecha es obligatoria",
  }),

  oficmp: Joi.number().positive().required().messages({
    "number.base": "El tipo de cambio de compra debe ser un número",
    "number.positive": "El tipo de cambio de compra debe ser mayor a 0",
    "any.required": "El tipo de cambio de compra es obligatorio",
  }),

  ofivta: Joi.number().positive().required().messages({
    "number.base": "El tipo de cambio de venta debe ser un número",
    "number.positive": "El tipo de cambio de venta debe ser mayor a 0",
    "any.required": "El tipo de cambio de venta es obligatorio",
  }),
});

const mapTipoCambioToForm = (data: TipoCambio): CreateTipoCambioRequest => ({
  fchcmb: data.fchcmb.split("T")[0],
  oficmp: data.oficmp ?? 0,
  ofivta: data.ofivta ?? 0,
});

const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDefaultValues = (): CreateTipoCambioRequest => ({
  fchcmb: getTodayString(),
  oficmp: null,
  ofivta: null,
});

export function DialogAddTipoCambio({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddTipoCambioProps) {
  const isEditing = Boolean(data);

  /*
   *=========================
   *   MUTACIONES Y HOOKS
   *   =========================
   */

  const createMutation = useCreateTipoCambio();
  const updateMutation = useUpdateTipoCambio();

  /*
   *=========================
   *   RHF
   *  =========================
   */

  const methods = useForm<CreateTipoCambioRequest>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(TipoCambioValidator),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    control,
  } = methods;

  const isPending =
    createMutation.isPending || updateMutation.isPending || isSubmitting;
  /*
   * =========================
   *   SUBMIT
   *   =========================
   */

  // Autocompletado
  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }

    reset(mapTipoCambioToForm(data));
  }, [data, reset]);

  // Reiniciar al cerrar
  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  const onSubmit = async (values: CreateTipoCambioRequest) => {
    console.log(values.fchcmb);
    if (!values.fchcmb) {
      toast.error("La fecha es obligatoria.", {
        autoClose: 1500,
      });
      return;
    }

    const payload: CreateTipoCambioRequest = {
      ...values,
    };

    if (!isEditing) {
      await createMutation.mutateAsync(payload);
    } else {
      await updateMutation.mutateAsync({
        id: data!.id_tcmb,
        data: payload,
      });
    }

    setOpen(false);
    setClearSelectionCounter((prev) => prev + 1);
  };

  /*
   * =========================
   *   FORMULARIO
   *   =========================
   */

  return (
    <DialogAddElement
      open={open}
      setOpen={setOpen}
      title={isEditing ? "Editar tipo de cambio" : "Nuevo tipo de cambio"}
      onSave={() => {
        void handleSubmit(onSubmit)();
      }}
      onClose={() => {
        setClearSelectionCounter((prev) => prev + 1);
      }}
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      isSubmitting={isPending}
      className="max-w-[300px]"
    >
      <div className="space-y-4">
        {/* Msj de error en caso falten campos */}
        {Object.keys(errors).length > 0 && (
          <p className="text-xs text-red-500 font-medium text-center">
            Complete los campos necesarios *
          </p>
        )}

        {/* Fecha */}
        <div>
          <Label htmlFor="fchcmb">
            Fecha <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fchcmb"
            type="date"
            {...register("fchcmb")}
            error={!!errors.fchcmb}
            className={errors.fchcmb ? "border-red-500" : ""}
          />
        </div>

        {/* Compra y Venta */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="oficmp">
              Compra <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="oficmp"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="oficmp"
                  value={
                    typeof field.value === "number"
                      ? field.value.toFixed(3)
                      : (field.value ?? "")
                  }
                  onChange={field.onChange}
                  onBlur={(e) => {
                    const val = e.target.value;

                    if (val === "") {
                      field.onChange(0);
                      return;
                    }

                    const num = parseFloat(val);

                    if (!isNaN(num)) {
                      field.onChange(Number(num.toFixed(3)));
                    }
                  }}
                  error={!!errors.oficmp}
                  placeholder="0.000"
                />
              )}
            />
          </div>

          <div>
            <Label htmlFor="ofivta">
              Venta <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="ofivta"
              control={control}
              render={({ field }) => (
                <InputNumber
                  id="ofivta"
                  value={
                    typeof field.value === "number"
                      ? field.value.toFixed(3)
                      : (field.value ?? "")
                  }
                  onChange={field.onChange}
                  onBlur={(e) => {
                    const val = e.target.value;

                    if (val === "") {
                      field.onChange(0);
                      return;
                    }

                    const num = parseFloat(val);

                    if (!isNaN(num)) {
                      field.onChange(Number(num.toFixed(3)));
                    }
                  }}
                  error={!!errors.ofivta}
                  placeholder="0.000"
                />
              )}
            />
          </div>
        </div>
      </div>
    </DialogAddElement>
  );
}
