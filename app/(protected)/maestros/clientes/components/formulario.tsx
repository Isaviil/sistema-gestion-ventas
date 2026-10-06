"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { ICustomerCreateRequest, ICustomerResponse } from "../types";
import { DialogAddElement } from "@/app/components/ui/dialoga-add-element";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
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
import { useCreateCliente } from "../api/create-cliente";
import { useUpdateCliente } from "../api/[id]/update-cliente";
import { useUbigeo } from "@/app/hooks/useUbigeo";
import { usePaymentMethods } from "../../formas-de-pago/api/list-formas-pago";
import { useVendedores } from "../../vendedores/api/list-vendedores";
import { toast } from "react-toastify";
import { documentosData } from "@/app/services/estaticos";
import { Loader2, Search } from "lucide-react";
import { useConsultaSunat } from "../api/servicios/use-consulta-sunat";

interface DialogAddClienteProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  setClearSelectionCounter: Dispatch<SetStateAction<number>>;
  data?: ICustomerResponse | null;
}

interface FormCustomerValues extends ICustomerCreateRequest {
  id_departamento?: string;
  id_provincia?: string;
}

export const CustomerValidator = Joi.object({
  des_aux: Joi.string().trim().required().messages({
    "string.empty": "La razón social o nombre es obligatorio",
    "any.required": "La razón social o nombre es obligatorio",
  }),
  id_departamento: Joi.string().required().messages({
    "string.empty": "El departamento es obligatorio",
    "any.required": "El departamento es obligatorio",
  }),
  id_provincia: Joi.string().required().messages({
    "string.empty": "La provincia es obligatoria",
    "any.required": "La provincia es obligatoria",
  }),
  ubigeo: Joi.string().required().messages({
    "string.empty": "El distrito es obligatorio",
    "any.required": "El distrito es obligatorio",
  }),
  id_ven: Joi.number().required().messages({
    "number.base": "El vendedor es obligatorio",
  }),
  id_tpoclie: Joi.number().required().messages({
    "number.base": "El tipo de cliente es obligatorio",
  }),
  tipo_pers: Joi.number().allow(null).optional(),
  tdoc_ide: Joi.string().allow("", null).optional(),
  ruc_aux: Joi.string().allow("", null).optional(),
  dir_legal: Joi.string().allow("", null).optional(),
  referencia: Joi.string().allow("", null).optional(),
  telefono: Joi.string().allow("", null).optional(),
  email: Joi.string()
    .email({ tlds: false })
    .allow("", null)
    .optional()
    .messages({
      "string.email": "El correo electrónico no es válido",
    }),
  for_pago: Joi.number().allow(null).optional(),
  departamento: Joi.string().allow("").optional(),
  provincia: Joi.string().allow("").optional(),
  distrito: Joi.string().allow("").optional(),
  flg_activo: Joi.boolean().optional(),
});

const mapCustomerToForm = (data: ICustomerResponse): FormCustomerValues => ({
  des_aux: data.des_aux ?? "",
  tipo_pers: data.tipo_pers ?? null,
  tdoc_ide: data.tdoc_ide ?? "",
  ruc_aux: data.ruc_aux ?? "",
  dir_legal: data.dir_legal ?? "",
  referencia: data.referencia ?? "",
  telefono: data.telefono ?? "",
  email: data.email ?? "",
  id_departamento: data.ubigeo ? data.ubigeo.substring(0, 2) : "",
  id_provincia: data.ubigeo ? data.ubigeo.substring(0, 4) : "",
  ubigeo: data.ubigeo ?? "",
  departamento: data.departamento ?? "",
  provincia: data.provincia ?? "",
  distrito: data.distrito ?? "",
  id_ven: data.id_ven ?? 0,
  for_pago: data.for_pago ?? null,
  id_tpoclie: data.id_tpoclie ?? 0,
  flg_activo: data.flg_activo ?? true,
});

export function DialogAddCliente({
  open,
  setOpen,
  setClearSelectionCounter,
  data,
}: DialogAddClienteProps) {
  const isEditing = Boolean(data);

  const createDefaultValues = (): FormCustomerValues => ({
    des_aux: "",
    tipo_pers: null,
    tdoc_ide: "1",
    ruc_aux: "",
    dir_legal: "",
    referencia: "",
    telefono: "",
    email: "",
    id_departamento: "",
    id_provincia: "",
    ubigeo: "",
    departamento: "",
    provincia: "",
    distrito: "",
    id_ven: 0,
    for_pago: null,
    id_tpoclie: 0,
    flg_activo: true,
  });

  /*
   *=========================
   *  Mutaciones
   * =========================
   */

  const createMutation = useCreateCliente();
  const updateMutation = useUpdateCliente();

  /*
   *=========================
   *  REACT HOOK FORM
   * =========================
   */

  const methods = useForm<FormCustomerValues>({
    defaultValues: createDefaultValues(),
    resolver: joiResolver(CustomerValidator),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const isPending =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  /*
   *=========================
   *  QUERIES
   * =========================
   */

  const { consultarDocumento, isLoading: isSearchingDoc } = useConsultaSunat();
  const { data: ubigeoData, isLoading: isLoadingUbigeos } = useUbigeo();
  const { data: formaPagoData, isLoading: isLoadingFormaPagos } =
    usePaymentMethods();
  const { data: vendedoresData, isLoading: isLoadingVendedor } =
    useVendedores();
  const {
    departamentos = [],
    provincias = [],
    distritos = [],
  } = ubigeoData || {};

  /*
   *=========================
   *  CONSTANTES
   * =========================
   */

  const selectedDepartamento = useWatch({ control, name: "id_departamento" });
  const selectedProvincia = useWatch({ control, name: "id_provincia" });
  const selectedTdocIde = useWatch({ control, name: "tdoc_ide" });
  const rucAuxValue = useWatch({ control, name: "ruc_aux" });

  const provinciasFiltradas = provincias.filter(
    (prov) => prov.id_depart === selectedDepartamento,
  );
  const distritosFiltrados = distritos.filter(
    (dist) => dist.id_provincia === selectedProvincia,
  );

  /*
   *=========================
   *  HANDLERS
   * =========================
   */

  const handleBuscarDocumento = async () => {
    if (!rucAuxValue?.trim()) {
      toast.error("Ingrese un número de documento para buscar");
      return;
    }

    let tipoConsulta: "dni" | "ruc" | null = null;

    if (
      selectedTdocIde === "1" ||
      (rucAuxValue.length === 8 && /^\d+$/.test(rucAuxValue))
    ) {
      tipoConsulta = "dni";
    } else if (
      selectedTdocIde === "6" ||
      (rucAuxValue.length === 11 && /^\d+$/.test(rucAuxValue))
    ) {
      tipoConsulta = "ruc";
    } else {
      toast.error(
        "La búsqueda automática solo está disponible para DNI (8 dígitos) o RUC (11 dígitos)",
      );
      return;
    }

    try {
      const res = await consultarDocumento(tipoConsulta, rucAuxValue.trim());

      if (res && res.success) {
        const nombreORazonSocial =
          res.razonSocial ||
          [res.nombres, res.apellidoPaterno, res.apellidoMaterno]
            .filter(Boolean)
            .join(" ");

        if (nombreORazonSocial) {
          setValue("des_aux", nombreORazonSocial.trim(), {
            shouldValidate: true,
          });
        }

        if (res.direccion) {
          setValue("dir_legal", res.direccion, { shouldValidate: true });
        }

        if (res.ubigeo && res.ubigeo.length === 6) {
          setValue("id_departamento", res.ubigeo.substring(0, 2));
          setValue("id_provincia", res.ubigeo.substring(0, 4));
          setValue("ubigeo", res.ubigeo, { shouldValidate: true });
        }

        toast.success("Datos obtenidos correctamente");
      }
    } catch {
      // Ya está controlado
    }
  };

  /*
   *=========================
   *  SUBMIT Y AUTOCOMPLETADO
   * =========================
   */

  useEffect(() => {
    if (!data) {
      reset(createDefaultValues());
      return;
    }
    reset(mapCustomerToForm(data));
  }, [data, reset]);

  useEffect(() => {
    if (!open) {
      reset(createDefaultValues());
    }
  }, [open, reset]);

  // Submit
  const onSubmit = async (values: FormCustomerValues) => {
    if (values.tdoc_ide === "1" && values.ruc_aux?.length !== 8) {
      toast.error("El DNI debe tener 8 dígitos");
      return;
    }

    if (values.tdoc_ide === "6" && values.ruc_aux?.length !== 11) {
      toast.error("El RUC debe tener 11 dígitos");
      return;
    }

    const depObj = departamentos.find(
      (d) => d.id_depart === values.id_departamento,
    );
    const provObj = provincias.find(
      (p) => p.id_provincia === values.id_provincia,
    );
    const distObj = distritos.find((d) => d.id_distrito === values.ubigeo);

    const payload: ICustomerCreateRequest = {
      des_aux: values.des_aux,
      tipo_pers: values.tipo_pers,
      tdoc_ide: values.tdoc_ide,
      ruc_aux: values.ruc_aux,
      dir_legal: values.dir_legal,
      referencia: values.referencia,
      telefono: values.telefono,
      email: values.email,
      ubigeo: values.ubigeo,
      departamento: depObj?.departamento ?? "",
      provincia: provObj?.provincia ?? "",
      distrito: distObj?.distrito ?? "",
      id_ven: values.id_ven,
      for_pago: values.for_pago,
      id_tpoclie: values.id_tpoclie,
      flg_activo: values.flg_activo,
    };

    try {
      if (!isEditing) {
        await createMutation.mutateAsync(payload);
      } else {
        await updateMutation.mutateAsync({
          id: data!.id_aux,
          data: payload,
        });
      }

      setOpen(false);
      setClearSelectionCounter((prev) => prev + 1);
    } catch (error) {
      console.error("Error al procesar el cliente:", error);
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
      title={isEditing ? "Editar cliente" : "Nuevo cliente"}
      onSave={() => {
        void handleSubmit(onSubmit)();
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
        {/* Tipo de Cliente y Tipo de Persona */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Tipo de Cliente *</Label>
            <Controller
              name="id_tpoclie"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger
                    className={errors.id_tpoclie ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Mayorista</SelectItem>
                    <SelectItem value="2">Cliente final</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.id_tpoclie && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.id_tpoclie.message}
              </span>
            )}
          </div>

          <div>
            <Label>Tipo de Persona</Label>
            <Controller
              name="tipo_pers"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Natural</SelectItem>
                    <SelectItem value="2">Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Tipo de Documento y N° Documento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label>Tipo Documento</Label>
            <Controller
              name="tdoc_ide"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {documentosData
                      .filter((doc) => doc.id === "1" || doc.id === "6")
                      .map((doc) => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.descripcion}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="ruc_aux">N° Documento</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="ruc_aux"
                type="text"
                className="pl-4 flex-1"
                placeholder="Ingrese número"
                maxLength={
                  documentosData.find((d) => d.id === selectedTdocIde)
                    ?.maxLength
                }
                {...register("ruc_aux")}
              />
              <button
                type="button"
                onClick={handleBuscarDocumento}
                disabled={isSearchingDoc || !rucAuxValue}
                title="Buscar en SUNAT/RENIEC"
                className="px-3 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-md hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center justify-center min-w-[42px]"
              >
                {isSearchingDoc ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Razón Social / Nombre */}
        <div>
          <Label htmlFor="des_aux">Razón Social / Nombre *</Label>
          <Input
            id="des_aux"
            type="text"
            className="pl-4"
            {...register("des_aux")}
          />
          {errors.des_aux && (
            <span className="text-xs text-red-500 mt-1 block">
              {errors.des_aux.message}
            </span>
          )}
        </div>

        {/* Vendedor y Forma de Pago */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Vendedor *</Label>
            <Controller
              name="id_ven"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isLoadingVendedor}
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger
                    className={errors.id_ven ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendedoresData?.map((vendedor) => (
                      <SelectItem
                        key={vendedor.id_aux}
                        value={String(vendedor.id_aux)}
                      >
                        {vendedor.des_aux}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.id_ven && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.id_ven.message}
              </span>
            )}
          </div>

          <div>
            <Label>Forma de Pago</Label>
            <Controller
              name="for_pago"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isLoadingFormaPagos}
                  value={field.value ? String(field.value) : ""}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione" />
                  </SelectTrigger>
                  <SelectContent>
                    {formaPagoData?.map((formaPago) => (
                      <SelectItem
                        key={formaPago.for_pago}
                        value={String(formaPago.for_pago)}
                      >
                        {formaPago.forma_pago}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>

        {/* Teléfono y Correo Electrónico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              type="text"
              className="pl-4"
              {...register("telefono")}
            />
          </div>
          <div>
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              className="pl-4"
              {...register("email")}
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>
        </div>

        {/* Dirección Legal y Referencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dir_legal">Dirección Legal</Label>
            <Input
              id="dir_legal"
              type="text"
              className="pl-4"
              {...register("dir_legal")}
            />
          </div>
          <div>
            <Label htmlFor="referencia">Referencia</Label>
            <Input
              id="referencia"
              type="text"
              className="pl-4"
              {...register("referencia")}
            />
          </div>
        </div>

        {/* Ubigeo en cascada */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-b py-3 my-2 dark:border-slate-800">
          <div>
            <Label>Departamento *</Label>
            <Controller
              name="id_departamento"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={isLoadingUbigeos}
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("id_provincia", "");
                    setValue("ubigeo", "");
                  }}
                >
                  <SelectTrigger
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

          <div>
            <Label>Provincia *</Label>
            <Controller
              name="id_provincia"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={!selectedDepartamento || isLoadingUbigeos}
                  value={field.value ?? ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("ubigeo", "");
                  }}
                >
                  <SelectTrigger
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

          <div>
            <Label>Distrito *</Label>
            <Controller
              name="ubigeo"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={!selectedProvincia || isLoadingUbigeos}
                  value={field.value ?? ""}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
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
      </div>
    </DialogAddElement>
  );
}
