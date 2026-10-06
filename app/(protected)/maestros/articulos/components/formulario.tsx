"use client";
import { useForm, Controller } from "react-hook-form";
import { CreateProductRequest, ProductResponse } from "../types";
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
import { useCreateProduct } from "../api/create-articulo";
import { useUpdateProduct } from "../api/[id]/update-articulo";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import { toast } from "react-toastify";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useBrands } from "../api/servicios/get-marca";
import { useGroups } from "../api/servicios/get-grupos";
import { useCuts } from "../api/servicios/get-corte";
import { useColors } from "../api/servicios/get-colores";
import { useSizes } from "../api/servicios/get-tamanio";
import { useUnitsOfMeasure } from "../api/servicios/get-unidad-medida";

interface DialogAddArticuloProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: ProductResponse | null;
}

export const ProductValidator = Joi.object({
  cod_art: Joi.string().allow(null, ""),
  des_art: Joi.string().required().messages({
    "string.empty": "La descripción es obligatoria",
  }),
  des_art2: Joi.string().allow(null, ""),
  stkact: Joi.number().min(0).required().messages({
    "number.base": "El stock debe ser un número",
    "number.min": "El stock no puede ser negativo",
  }),
  peso: Joi.number().min(0).allow(null),
  pre_art: Joi.number().min(0).required().messages({
    "number.base": "El precio debe ser un número",
    "number.min": "El precio no puede ser negativo",
    "any.required": "El precio es obligatorio",
  }),
  pv2: Joi.number().allow(null),
  pv3: Joi.number().allow(null),
  pv4: Joi.number().allow(null),
  id_umedr: Joi.number().integer().required().messages({
    "number.base": "La unidad de medida es obligatoria",
    "any.required": "La unidad de medida es obligatoria",
  }),
  id_fam: Joi.number().integer().allow(null),
  id_corte: Joi.number().integer().allow(null),
  id_mar: Joi.number().integer().allow(null),
  id_color: Joi.number().integer().allow(null),
  id_talla: Joi.number().integer().allow(null),
});

const mapProductToForm = (data: ProductResponse): CreateProductRequest => ({
  cod_art: data.cod_art,
  des_art: data.des_art ?? "",
  des_art2: data.des_art2 ?? null,
  stkact: data.stkact ?? 0,
  peso: data.peso ?? null,
  pre_art: data.pre_art ?? 0,
  pv2: null,
  pv3: null,
  pv4: null,
  id_umedr: data.id_umedr ?? null,
  id_fam: data.id_fam ?? null,
  id_corte: data.id_corte ?? null,
  id_mar: data.id_mar ?? null,
  id_color: data.id_color ?? null,
  id_talla: data.id_talla ?? null,
});

export function DialogAddArticulo({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddArticuloProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): CreateProductRequest => ({
    cod_art: "",
    des_art: "",
    des_art2: null,
    stkact: 0,
    peso: null,
    pre_art: 0,
    pv2: null,
    pv3: null,
    pv4: null,
    id_umedr: null,
    id_fam: null,
    id_corte: null,
    id_mar: null,
    id_color: null,
    id_talla: null,
  });
  console.log(data);
  /*
   * =========================
   *       MUTACIONES Y HOOKS
   *       =========================
   */
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();

  const { data: dataBrands, isLoading: isLoadingBrands } = useBrands();
  const { data: dataGroups, isLoading: isLoadingGroups } = useGroups();
  const { data: dataCuts, isLoading: isLoadingCuts } = useCuts();
  const { data: dataColors, isLoading: isLoadingColors } = useColors();
  const { data: dataSizes, isLoading: isLoadingSizes } = useSizes();
  const { data: dataUnitsOfMeasure, isLoading: isLoadingUnitsOfMeasure } =
    useUnitsOfMeasure();

  /*
   * =========================
   *   REACT HOOK FORM
   *   =========================
   */
  const methods = useForm<CreateProductRequest>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(ProductValidator),
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
   *  EFECTOS
   *  =========================
   */
  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }
    reset(mapProductToForm(data));
  }, [data, reset]);

  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  /*
   *=========================
   *   SUBMIT
   *   =========================
   */

  const onSubmit = async (values: CreateProductRequest) => {
    if (!values.des_art.trim()) {
      toast.error("La descripción del artículo es obligatoria.", {
        autoClose: 1500,
      });
      return;
    }

    const payload: CreateProductRequest = {
      ...values,
    };

    if (!isEditing) {
      await createMutation.mutateAsync(payload);
    } else {
      await updateMutation.mutateAsync({
        id: data!.id_art,
        data: payload,
      });
    }

    setOpen(false);
    setClearSelectionCounter((prev) => prev + 1);
  };

  return (
    <DialogAddElement
      open={open}
      setOpen={setOpen}
      title={isEditing ? "Editar artículo" : "Nuevo artículo"}
      onSave={() => {
        void handleSubmit(onSubmit)();
      }}
      onClose={() => {
        setClearSelectionCounter((prev) => prev + 1);
      }}
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
      isSubmitting={isPending}
      className=""
    >
      <div className="space-y-4">
        {/* Código y Marca */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cod_art">Código</Label>
            <div className="relative flex items-center">
              <Input
                id="cod_art"
                type="text"
                disabled
                {...register("cod_art")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="id_mar">Marca</Label>
            <Controller
              name="id_mar"
              control={control}
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => {
                    const num = parseInt(value, 10);
                    field.onChange(Number.isFinite(num) ? num : null);
                  }}
                >
                  <SelectTrigger
                    id="id_mar"
                    className={errors.id_mar ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione marca" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBrands ? (
                      <div className="p-2 text-xs text-gray-500 text-center">
                        Cargando marcas...
                      </div>
                    ) : (
                      dataBrands?.map((brand) => (
                        <SelectItem
                          key={brand.id_mar}
                          value={String(brand.id_mar)}
                        >
                          {brand.marca}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Grupo / Familia y Corte */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="id_fam">Grupo / Familia</Label>
            <Controller
              name="id_fam"
              control={control}
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => {
                    const num = parseInt(value, 10);
                    field.onChange(Number.isFinite(num) ? num : null);
                  }}
                >
                  <SelectTrigger id="id_fam">
                    <SelectValue placeholder="Seleccione grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingGroups ? (
                      <div className="p-2 text-xs text-gray-500 text-center">
                        Cargando grupos...
                      </div>
                    ) : (
                      dataGroups?.map((group) => (
                        <SelectItem
                          key={group.id_fam}
                          value={String(group.id_fam)}
                        >
                          {group.familia}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="id_corte">Corte</Label>
            <Controller
              name="id_corte"
              control={control}
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => {
                    const num = parseInt(value, 10);
                    field.onChange(Number.isFinite(num) ? num : null);
                  }}
                >
                  <SelectTrigger id="id_corte">
                    <SelectValue placeholder="Seleccione corte" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCuts ? (
                      <div className="p-2 text-xs text-gray-500 text-center">
                        Cargando cortes...
                      </div>
                    ) : (
                      dataCuts?.map((cut) => (
                        <SelectItem
                          key={cut.id_corte}
                          value={String(cut.id_corte)}
                        >
                          {cut.corte}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Color y Talla */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="id_color">Color</Label>
            <Controller
              name="id_color"
              control={control}
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => {
                    const num = parseInt(value, 10);
                    field.onChange(Number.isFinite(num) ? num : null);
                  }}
                >
                  <SelectTrigger id="id_color">
                    <SelectValue placeholder="Seleccione color" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingColors ? (
                      <div className="p-2 text-xs text-gray-500 text-center">
                        Cargando colores...
                      </div>
                    ) : (
                      dataColors?.map((color) => (
                        <SelectItem
                          key={color.id_color}
                          value={String(color.id_color)}
                        >
                          {color.color}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="id_talla">Talla / Tamaño</Label>
            <Controller
              name="id_talla"
              control={control}
              render={({ field }) => (
                <Select
                  name={field.name}
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(value) => {
                    const num = parseInt(value, 10);
                    field.onChange(Number.isFinite(num) ? num : null);
                  }}
                >
                  <SelectTrigger id="id_talla">
                    <SelectValue placeholder="Seleccione talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSizes ? (
                      <div className="p-2 text-xs text-gray-500 text-center">
                        Cargando tallas...
                      </div>
                    ) : (
                      dataSizes?.map((size) => (
                        <SelectItem
                          key={size.id_talla}
                          value={String(size.id_talla)}
                        >
                          {size.talla}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Unidad de Medida (Obligatoria) */}
        <div>
          <Label htmlFor="id_umedr">Unidad de Medida *</Label>
          <Controller
            name="id_umedr"
            control={control}
            render={({ field }) => (
              <Select
                name={field.name}
                value={field.value ? String(field.value) : undefined}
                onValueChange={(value) => {
                  const num = parseInt(value, 10);
                  field.onChange(Number.isFinite(num) ? num : null);
                }}
              >
                <SelectTrigger
                  id="id_umedr"
                  className={errors.id_umedr ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Seleccione unidad de medida" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUnitsOfMeasure ? (
                    <div className="p-2 text-xs text-gray-500 text-center">
                      Cargando unidades...
                    </div>
                  ) : (
                    dataUnitsOfMeasure?.map((unit) => (
                      <SelectItem
                        key={unit.id_umed}
                        value={String(unit.id_umed)}
                      >
                        {unit.alias_umed}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          />
          {errors.id_umedr && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.id_umedr.message}
            </span>
          )}
        </div>

        {/* Descripción 1 */}
        <div>
          <Label htmlFor="des_art">Descripción</Label>
          <div className="relative flex items-center">
            <Input
              id="des_art"
              type="text"
              placeholder="Descripción principal"
              className="pl-4"
              {...register("des_art")}
            />
          </div>
          {errors.des_art && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.des_art.message}
            </span>
          )}
        </div>

        {/* Descripción Secundaria */}
        <div>
          <Label htmlFor="des_art2">Descripción Secundaria</Label>
          <div className="relative flex items-center">
            <Input
              id="des_art2"
              type="text"
              placeholder="Descripción secundaria (opcional)"
              className="pl-4"
              {...register("des_art2")}
            />
          </div>
        </div>

        {/* Stock, Precio Base y Peso */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="stkact">Stock</Label>
            <Input
              id="stkact"
              type="number"
              placeholder="0"
              {...register("stkact", { valueAsNumber: true })}
            />
            {errors.stkact && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.stkact.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="pre_art">Precio Base</Label>
            <Input
              id="pre_art"
              type="number"
              step="any"
              placeholder="0.00"
              {...register("pre_art", { valueAsNumber: true })}
            />
            {errors.pre_art && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.pre_art.message}
              </span>
            )}
          </div>

          <div>
            <Label htmlFor="peso">Peso (opcional)</Label>
            <Input
              id="peso"
              type="number"
              step="any"
              placeholder="0.00"
              {...register("peso", {
                setValueAs: (v) =>
                  v === "" || isNaN(Number(v)) ? null : Number(v),
              })}
            />
          </div>
        </div>
      </div>
    </DialogAddElement>
  );
}
