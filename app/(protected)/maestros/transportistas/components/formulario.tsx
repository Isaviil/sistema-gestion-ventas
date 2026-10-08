"use client";
import { useForm } from "react-hook-form";
import { IChofer, CreateChoferRequest } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import { useCreateTransportista } from "../api/create-transportista";
import { useUpdateTransportista } from "../api/[id]/update-transportista";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { Dispatch, SetStateAction, useEffect } from "react";

interface DialogAddTransportistaProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: IChofer | null;
}

export const TransportistaValidator = Joi.object({
  brevete: Joi.string().required().messages({
    "string.empty": "El brevete es obligatorio",
  }),
  dni: Joi.string()
    .pattern(/^\d{8}$/)
    .required()
    .messages({
      "string.empty": "El DNI es obligatorio",
      "string.pattern.base": "El DNI debe tener exactamente 8 dígitos",
    }),
  nombre: Joi.string().required().messages({
    "string.empty": "El nombre del transportista es obligatorio",
  }),
});

const mapTransportistaToForm = (data: IChofer): CreateChoferRequest => ({
  brevete: data.brevete ?? "",
  dni: data.dni ?? "",
  nombre: data.nombre ?? "",
});

export function DialogAddTransportista({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddTransportistaProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): CreateChoferRequest => ({
    brevete: "",
    dni: "",
    nombre: "",
  });

  /*
   * =========================
   *       MUTACIONES
   * =========================
   */

  const createMutation = useCreateTransportista();
  const updateMutation = useUpdateTransportista();

  /*
   * =========================
   *   REACT HOOK FORM
   * =========================
   */

  const methods = useForm<CreateChoferRequest>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(TransportistaValidator),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const isPending =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  /*
   * =========================
   *   AUTOCOMPLETADO
   * =========================
   */

  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }

    reset(mapTransportistaToForm(data));
  }, [data, reset]);

  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  /*
   * =========================
   *        SUBMIT
   * =========================
   */

  const onSubmit = async (values: CreateChoferRequest) => {
    if (!isEditing) {
      await createMutation.mutateAsync(values);
    } else {
      await updateMutation.mutateAsync({
        id: data!.id_chof,
        data: values,
      });
    }

    setOpen(false);
    setClearSelectionCounter((prev) => prev + 1);
  };

  /*
   * =========================
   *      FORMULARIO
   * =========================
   */

  return (
    <DialogAddElement
      open={open}
      setOpen={setOpen}
      title={isEditing ? "Editar transportista" : "Nuevo transportista"}
      onSave={() => {
        void handleSubmit(onSubmit)();
      }}
      onClose={() => {
        setClearSelectionCounter((prev) => prev + 1);
      }}
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      isSubmitting={isPending}
      className="max-w-lg"
    >
      <div className="space-y-4">
        {/* Brevete y DNI */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="brevete">Brevete *</Label>
            <Input id="brevete" type="text" {...register("brevete")} />
          </div>

          <div>
            <Label htmlFor="dni">DNI *</Label>
            <Input id="dni" type="text" maxLength={8} {...register("dni")} />
          </div>
        </div>

        {/* Nombre */}
        <div>
          <Label htmlFor="nombre">Nombre completo *</Label>
          <Input id="nombre" type="text" {...register("nombre")} />
        </div>
      </div>
    </DialogAddElement>
  );
}
