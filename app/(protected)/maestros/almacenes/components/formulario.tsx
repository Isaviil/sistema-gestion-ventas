"use client";
import { useForm, Controller, useWatch } from "react-hook-form";
import { IAlmacen, IAlmacenList } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useCreateAlmacen } from "../api/create-almacen";
import { useUpdateAlmacen } from "../api/[id]/update-almacen";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useUbigeo } from "@/app/hooks/useUbigeo";
import { Checkbox } from "@/app/components/ui/checkbox";
import { getSession } from "next-auth/react";

interface DialogAddAlmacenProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: IAlmacenList | null;
}

interface FormAlmacenValues extends IAlmacen {
  id_departamento?: string;
  id_provincia?: string;
}

export const AlmacenValidator = Joi.object({
  aliasalm: Joi.string().required().messages({
    "string.empty": "El alias del almacén es obligatorio",
  }),
  desalm: Joi.string().required().messages({
    "string.empty": "La descripción del almacén es obligatoria",
  }),
  diralm: Joi.string().allow(null, ""),
  departam: Joi.string().required().messages({
    "string.empty": "El departamento es obligatorio",
  }),
  provincia: Joi.string().required().messages({
    "string.empty": "La provincia es obligatoria",
  }),
  distrito: Joi.string().required().messages({
    "string.empty": "El distrito es obligatorio",
  }),
  ubigeo: Joi.string().required().messages({
    "string.empty": "El ubigeo es obligatorio",
  }),
  kanexo: Joi.string().pattern(/^\d+$/).max(4).required().messages({
    "string.empty": "El código de anexo es obligatorio",
    "string.pattern.base": "El código de anexo solo puede contener números",
    "string.max": "El código de anexo no puede tener más de 4 dígitos",
  }),
  id_departamento: Joi.string().allow("", null).optional(), // Solo para validar ya que no se envía
  id_provincia: Joi.string().allow("", null).optional(), // Solo para validar ya que no se envía
  telefalm: Joi.string().allow(null, ""),
  logoalm: Joi.string().allow(null, ""),
  flg_stock: Joi.boolean().required(),
  flg_acu: Joi.boolean().required(),
  usuario: Joi.number().integer().allow(null),
});

const mapAlmacenToForm = (data: IAlmacenList): FormAlmacenValues => ({
  aliasalm: data.aliasalm ?? "",
  desalm: data.desalm ?? "",
  diralm: data.diralm ?? null,
  departam: data.departam ?? "",
  provincia: data.provincia ?? "",
  distrito: data.distrito ?? "",
  id_departamento: data.ubigeo ? data.ubigeo.substring(0, 2) : "",
  id_provincia: data.ubigeo ? data.ubigeo.substring(0, 4) : "",
  ubigeo: data.ubigeo ?? "",
  kanexo: data.kanexo ?? "",
  telefalm: data.telefalm ?? null,
  logoalm: data.logoalm ?? null,
  flg_stock: data.flg_stock ?? false,
  flg_acu: data.flg_acu ?? false,
  usuario: data.usuario ?? null,
});

export function DialogAddAlmacen({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddAlmacenProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): FormAlmacenValues => ({
    aliasalm: "",
    desalm: "",
    diralm: null,
    departam: "",
    provincia: "",
    distrito: "",
    ubigeo: "",
    kanexo: "",
    id_departamento: "",
    id_provincia: "",
    telefalm: null,
    logoalm: null,
    flg_stock: false,
    flg_acu: false,
    usuario: null,
  });

  /*
   * =========================
   *       MUTACIONES
   * =========================
   */

  const createMutation = useCreateAlmacen();
  const updateMutation = useUpdateAlmacen();

  /*
   * =========================
   *   REACT HOOK FORM
   * =========================
   */

  const methods = useForm<FormAlmacenValues>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(AlmacenValidator),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    control,
  } = methods;

  const isPending =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  /*
   * =========================
   *   QUERIES
   * =========================
   */

  const { data: ubigeoData, isLoading: isLoadingUbigeos } = useUbigeo();
  const {
    departamentos = [],
    provincias = [],
    distritos = [],
  } = ubigeoData || {};

  /*
   * =========================
   *   CONSTANTES Y USEWATCH
   * =========================
   */

  const selectedDepartamento = useWatch({ control, name: "id_departamento" });
  const selectedProvincia = useWatch({ control, name: "id_provincia" });

  const provinciasFiltradas = provincias.filter(
    (prov) => prov.id_depart === selectedDepartamento,
  );
  const distritosFiltrados = distritos.filter(
    (dist) => dist.id_provincia === selectedProvincia,
  );

  /*
   * =========================
   *   SUBMIT Y AUTOCOMPLETADO
   * =========================
   */

  // Autocompleta la info al seleccionar
  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }

    reset(mapAlmacenToForm(data));
  }, [data, reset]);

  // Reinicia la info al cerrar
  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  // Submit
  const onSubmit = async (values: FormAlmacenValues) => {
    // Solo traemos los datos del usuario al no editar
    // Solo se generará id_usu al crear; al editar, no cambiará
    const session = !isEditing ? await getSession() : null;

    // Se reforma del extend al payload
    const payload: IAlmacen = {
      aliasalm: values.aliasalm,
      desalm: values.desalm,
      diralm: values.diralm,
      departam: values.departam,
      provincia: values.provincia,
      distrito: values.distrito,
      ubigeo: values.ubigeo,
      kanexo: values.kanexo,
      telefalm: values.telefalm,
      logoalm: values.logoalm,
      flg_stock: values.flg_stock,
      flg_acu: values.flg_acu,
      usuario: isEditing
        ? values.usuario
        : session?.user?.id_usu
          ? Number(session.user.id_usu)
          : null,
    };

    if (!isEditing) {
      await createMutation.mutateAsync(payload);
    } else {
      await updateMutation.mutateAsync({
        id: data!.codalm,
        data: payload,
      });
    }

    setOpen(false);
    setClearSelectionCounter((prev) => prev + 1);
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
      title={isEditing ? "Editar almacén" : "Nuevo almacén"}
      onSave={() => {
        void handleSubmit(onSubmit, (errors) =>
          console.log("Errores de validación Joi:", errors),
        )();
      }}
      onClose={() => {
        setClearSelectionCounter((prev) => prev + 1);
      }}
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      isSubmitting={isPending}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Alias y Descripción */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="desalm">Descripción *</Label>
            <Input id="desalm" type="text" {...register("desalm")} />
            {errors.desalm && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.desalm.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="aliasalm">Alias *</Label>
            <Input id="aliasalm" type="text" {...register("aliasalm")} />
            {errors.aliasalm && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.aliasalm.message}
              </span>
            )}
          </div>
        </div>

        {/* Dirección */}
        <div>
          <Label htmlFor="diralm">Dirección</Label>
          <Input id="diralm" type="text" {...register("diralm")} />
        </div>

        {/* Ubigeos en cascada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-b py-3 my-2 dark:border-slate-800">
          {/* Departamento */}
          <div>
            <Label htmlFor="id_departamento">Departamento *</Label>
            <Controller
              name="id_departamento"
              control={control}
              render={({ field }) => (
                <Select
                  name="id_departamento"
                  disabled={isLoadingUbigeos}
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);

                    // Busca el objeto y asigna el texto del departamento
                    const depObj = departamentos.find(
                      (d) => d.id_depart === val,
                    );
                    setValue("departam", depObj?.departamento ?? "", {
                      shouldValidate: true,
                    });

                    // Resetea dependientes
                    setValue("id_provincia", "");
                    setValue("provincia", "");
                    setValue("ubigeo", "");
                    setValue("distrito", "");
                  }}
                >
                  <SelectTrigger
                    id="id_departamento"
                    className={errors.id_departamento ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dep) => (
                      <SelectItem key={dep.id_depart} value={dep.id_depart}>
                        {dep.departamento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.id_departamento && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.id_departamento.message}
              </span>
            )}
          </div>

          {/* Provincia */}
          <div>
            <Label htmlFor="id_provincia">Provincia *</Label>
            <Controller
              name="id_provincia"
              control={control}
              render={({ field }) => (
                <Select
                  name="id_provincia"
                  disabled={!selectedDepartamento || isLoadingUbigeos}
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);

                    // Busca el objeto y asigna el texto de la provincia
                    const provObj = provincias.find(
                      (p) => p.id_provincia === val,
                    );
                    setValue("provincia", provObj?.provincia ?? "", {
                      shouldValidate: true,
                    });

                    // Resetea dependientes
                    setValue("ubigeo", "");
                    setValue("distrito", "");
                  }}
                >
                  <SelectTrigger
                    id="id_provincia"
                    className={`${errors.id_provincia ? "border-red-500" : ""} ${
                      !selectedDepartamento
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {provinciasFiltradas.map((prov) => (
                      <SelectItem
                        key={prov.id_provincia}
                        value={prov.id_provincia}
                      >
                        {prov.provincia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.id_provincia && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.id_provincia.message}
              </span>
            )}
          </div>

          {/* Distrito */}
          <div>
            <Label htmlFor="ubigeo">Distrito *</Label>
            <Controller
              name="ubigeo"
              control={control}
              render={({ field }) => (
                <Select
                  name="ubigeo"
                  disabled={!selectedProvincia || isLoadingUbigeos}
                  value={field.value ?? ""}
                  onValueChange={(val) => {
                    field.onChange(val);

                    // Busca el objeto y asigna el texto del distrito
                    const distObj = distritos.find(
                      (d) => d.id_distrito === val,
                    );
                    setValue("distrito", distObj?.distrito ?? "", {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger
                    id="ubigeo"
                    className={`${errors.ubigeo ? "border-red-500" : ""} ${
                      !selectedProvincia ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {distritosFiltrados.map((dist) => (
                      <SelectItem
                        key={dist.id_distrito}
                        value={dist.id_distrito}
                      >
                        {dist.distrito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.ubigeo && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.ubigeo.message}
              </span>
            )}
          </div>
        </div>

        {/* Cod. Sunat, Teléfono y Logo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kanexo">Cod. Sunat *</Label>
            <Input
              id="kanexo"
              type="text"
              maxLength={4}
              placeholder="0000"
              {...register("kanexo")}
            />
            {errors.kanexo && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.kanexo.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="telefalm">Teléfono</Label>
            <Input
              id="telefalm"
              type="text"
              placeholder="Ej: 957212485"
              {...register("telefalm")}
            />
          </div>

          <div>
            <Label htmlFor="logoalm">Logo</Label>
            <Input
              id="logoalm"
              type="text"
              placeholder="Ruta o id del logo"
              {...register("logoalm")}
            />
          </div>
        </div>

        {/* Controla stock */}
        <div className="flex items-center space-x-2 pt-2">
          <Controller
            name="flg_stock"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="flg_stock"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
              />
            )}
          />
          <Label
            htmlFor="flg_stock"
            className="text-sm font-medium leading-none cursor-pointer"
          >
            Controla stock
          </Label>
        </div>
      </div>
    </DialogAddElement>
  );
}
