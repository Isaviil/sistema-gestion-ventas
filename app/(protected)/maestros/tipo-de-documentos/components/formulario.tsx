"use client";
import { useForm, useWatch } from "react-hook-form";
import { CreateTipoDocumentoRequest, TipoDocumento } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useCreateTipoDocumento } from "../api/create-tipo-doc";
import { useUpdateTipoDocumento } from "../api/[id]/update-tipo-doc";
import { FileText, Tag } from "lucide-react";

interface DialogAddTipoDocumentoProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: TipoDocumento | null;
}

export const TipoDocumentoValidator = Joi.object({
  dlar_tdoc: Joi.string().trim().required().messages({
    "string.empty": "El nombre del documento es obligatorio",
    "any.required": "El nombre del documento es obligatorio",
  }),

  dcor_tdoc: Joi.string().trim().required().messages({
    "string.empty": "La abreviatura es obligatoria",
    "any.required": "La abreviatura es obligatoria",
  }),

  codsunat: Joi.string().allow(null, ""),
  alias_alm: Joi.string().allow(null, ""),
  flg_sunat: Joi.boolean().required(),
  flg_alm: Joi.boolean().required(),
  flg_vta: Joi.boolean().required(),
});

// Forma de lo que enviaremos al hacer submit
const mapTipoDocumentoToForm = (
  data: TipoDocumento,
): CreateTipoDocumentoRequest => ({
  dlar_tdoc: data.dlar_tdoc,
  dcor_tdoc: data.dcor_tdoc,
  codsunat: data.codsunat,
  alias_alm: data.alias_alm,
  flg_sunat: data.flg_sunat,
  flg_alm: data.flg_alm,
  flg_vta: data.flg_vta,
});

export function DialogAddTipoDocumento({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddTipoDocumentoProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): CreateTipoDocumentoRequest => ({
    dlar_tdoc: "",
    dcor_tdoc: "",
    codsunat: null,
    alias_alm: null,
    flg_sunat: false,
    flg_alm: false,
    flg_vta: false,
  });

  /*
   *=========================
   *  MUTACIONES
   * =========================
   */

  const createMutation = useCreateTipoDocumento();
  const updateMutation = useUpdateTipoDocumento();

  /*
   *=========================
   *  REACT HOOK FORM
   * =========================
   * */

  const methods = useForm<CreateTipoDocumentoRequest>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(TipoDocumentoValidator),
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
   *  USEWATCH
   * =========================
   */

  const flgSunat = useWatch({
    control,
    name: "flg_sunat",
  });

  const flgAlm = useWatch({
    control,
    name: "flg_alm",
  });

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

    reset(mapTipoDocumentoToForm(data));
  }, [data, reset]);

  // Reinicia los datos al cerrar
  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  // Submit
  const onSubmit = async (values: CreateTipoDocumentoRequest) => {
    try {
      if (!isEditing) {
        await createMutation.mutateAsync(values);
      } else {
        await updateMutation.mutateAsync({
          id: data!.id_tipdoc,
          data: values,
        });
      }

      setOpen(false);
      setClearSelectionCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Hubo un error al operar el tipo de documento", error);
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
      title={isEditing ? "Editar tipo de documento" : "Nuevo tipo de documento"}
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
            <Label htmlFor="dlar_tdoc">Nombre del documento</Label>
            <div className="relative flex items-center">
              <FileText className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="dlar_tdoc"
                type="text"
                className="pl-9"
                {...register("dlar_tdoc")}
              />
            </div>
            {errors.dlar_tdoc && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.dlar_tdoc.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="dcor_tdoc">Abreviatura</Label>
            <div className="relative flex items-center">
              <Tag className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <Input
                id="dcor_tdoc"
                type="text"
                className="pl-9"
                {...register("dcor_tdoc")}
              />
            </div>
            {errors.dcor_tdoc && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.dcor_tdoc.message}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input id="flg_sunat" type="checkbox" {...register("flg_sunat")} />
          <Label htmlFor="flg_sunat">Pertenece a SUNAT</Label>
        </div>

        {flgSunat && (
          <div>
            <Label htmlFor="codsunat">Código SUNAT</Label>
            <Input
              id="codsunat"
              type="text"
              className="pl-4"
              {...register("codsunat")}
            />
            {errors.codsunat && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.codsunat.message}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input id="flg_alm" type="checkbox" {...register("flg_alm")} />
          <Label htmlFor="flg_alm">Se usa en procesos de almacenes</Label>
        </div>

        {flgAlm && (
          <div>
            <Label htmlFor="alias_alm">Alias de almacén</Label>
            <Input
              id="alias_alm"
              type="text"
              className="pl-4"
              {...register("alias_alm")}
            />
            {errors.alias_alm && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.alias_alm.message}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input id="flg_vta" type="checkbox" {...register("flg_vta")} />
          <Label htmlFor="flg_vta">Se utiliza para procesos de ventas</Label>
        </div>
      </div>
    </DialogAddElement>
  );
}
