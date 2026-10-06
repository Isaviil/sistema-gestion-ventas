"use client";
import { Controller, useForm } from "react-hook-form";
import { CreateVendedorRequest, Vendedor } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import { useCreateVendedor } from "../api/create-vendedor";
import { useUpdateVendedor } from "../api/[id]/update-vendedor";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { Dispatch, SetStateAction, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { documentosData } from "@/app/services/estaticos";

interface DialogAddVendedorProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: Vendedor | null;
}

export const VendedorValidator = Joi.object({
  nom_aux: Joi.string().trim().required().messages({
    "string.empty": "El nombre es obligatorio",
    "any.required": "El nombre es obligatorio",
  }),
  ape_aux: Joi.string().allow("").optional(),
  ape_mat: Joi.string().allow("").optional(),
  tdoc_ide: Joi.string().allow("").optional(),
  ndoc_ide: Joi.string().allow("").optional(),
  cel_job: Joi.string().allow("").optional(),
  email_job: Joi.string().email({ tlds: false }).allow("").optional().messages({
    "string.email": "El correo electrónico no es válido",
  }),
});

const mapVendedorToForm = (data: Vendedor): CreateVendedorRequest => ({
  nom_aux: data.nom_aux ?? "",
  ape_aux: data.ape_aux ?? "",
  ape_mat: data.ape_mat ?? "",
  tdoc_ide: data.tdoc_ide ?? "",
  ndoc_ide: data.ndoc_ide ?? "",
  cel_job: data.cel_job ?? "",
  email_job: data.email_job ?? "",
});

export function DialogAddVendedor({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddVendedorProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): CreateVendedorRequest => ({
    nom_aux: "",
    ape_aux: "",
    ape_mat: "",
    tdoc_ide: "",
    ndoc_ide: "",
    cel_job: "",
    email_job: "",
  });

  /*
   *=========================
   *  MUTACIONES Y QUERIES
   * =========================
   */

  const createMutation = useCreateVendedor();
  const updateMutation = useUpdateVendedor();

  /*
   *=========================
   *  REACT HOOK FORM
   * =========================
   */

  const methods = useForm<CreateVendedorRequest>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(VendedorValidator),
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
   *=========================
   *  SUBMIT Y AUTOCOMPLETADO
   * =========================
   */

  // LoadInitialData
  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }

    reset(mapVendedorToForm(data));
  }, [data, reset]);

  // Reinicia los datos al cerrar
  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  // Submit
  const onSubmit = async (values: CreateVendedorRequest) => {
    try {
      if (!isEditing) {
        await createMutation.mutateAsync(values);
      } else {
        await updateMutation.mutateAsync({
          id: data!.id_aux,
          data: values,
        });
      }

      setOpen(false);
      setClearSelectionCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Hubo un error al operar el documento", error);
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
      title={isEditing ? "Editar vendedor" : "Nuevo vendedor"}
      onSave={() => {
        void handleSubmit(onSubmit)();
      }}
      onClose={() => {
        setClearSelectionCounter((prev) => prev + 1);
      }}
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      isSubmitting={isPending}
      className="max-w-xl"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="nom_aux">Nombres</Label>
          <Input
            id="nom_aux"
            type="text"
            className="pl-4"
            {...register("nom_aux")}
          />
          {errors.nom_aux && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.nom_aux.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ape_aux">Apellido paterno</Label>
            <Input
              id="ape_aux"
              type="text"
              className="pl-4"
              {...register("ape_aux")}
            />
            {errors.ape_aux && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.ape_aux.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="ape_mat">Apellido materno</Label>
            <Input
              id="ape_mat"
              type="text"
              className="pl-4"
              {...register("ape_mat")}
            />
            {errors.ape_mat && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.ape_mat.message}
              </span>
            )}
          </div>
        </div>

        {/* Tipo de Documento y Número en 2 columnas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tdoc_ide">Tipo de documento</Label>
            <Controller
              name="tdoc_ide"
              control={control}
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger
                    id="tdoc_ide"
                    className={errors.tdoc_ide ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentosData.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        {doc.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tdoc_ide && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.tdoc_ide.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="ndoc_ide">N° Documento</Label>
            <Input
              id="ndoc_ide"
              type="text"
              className="pl-4"
              {...register("ndoc_ide")}
            />
            {errors.ndoc_ide && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.ndoc_ide.message}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cel_job">Teléfono</Label>
            <Input
              id="cel_job"
              type="text"
              className="pl-4"
              {...register("cel_job")}
            />
            {errors.cel_job && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.cel_job.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="email_job">Correo</Label>
            <Input
              id="email_job"
              type="email"
              className="pl-4"
              {...register("email_job")}
            />
            {errors.email_job && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.email_job.message}
              </span>
            )}
          </div>
        </div>
      </div>
    </DialogAddElement>
  );
}
