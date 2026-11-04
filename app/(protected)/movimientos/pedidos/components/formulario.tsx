"use client";
import { getLimaDate } from "@/app/utils/dateUtils";
import Joi from "joi";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  IPedidoCabeceraForm,
  IPedidoCabeceraFormState,
  IPedidoCabeceraPorID,
  IPedidoDetalleFormState,
  IPedidoDetallePorID,
} from "../types";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { Formulario } from "@/app/components/ui/formulario";
import { Label } from "@/app/components/ui/label";
import InputNumber from "@/app/components/ui/input-number";
import Input from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import Button from "@/app/components/ui/button";
import { Search } from "lucide-react";
import InputDate from "@/app/components/ui/InputDate";
import DialogAddArticulos from "@/app/components/articulos/DialogAddArticulo";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { ArticulosActions } from "@/app/components/articulos/articulos-buttons";
import { useVendedores } from "@/app/(protected)/maestros/vendedores/api/list-vendedores";
import { usePaymentMethods } from "@/app/(protected)/maestros/formas-de-pago/api/list-formas-pago";
import LoadingSidebar from "@/app/components/loading/LoadingSidebar";
import DialogAddClientes from "@/app/components/clientes/DialogAddCliente";
import {
  IDetallePrecios,
  ProductResponse,
} from "@/app/(protected)/maestros/articulos/types";
import { useWatch } from "react-hook-form";
import {
  mapArticuloToDetalle,
  mapDetalles,
  mapCabecera,
} from "../utils/mappers";
import { useAgregarProducto } from "../hooks/useCalcularPrecio";
import { ICustomerResponse } from "@/app/(protected)/maestros/clientes/types";
import { useMoneda } from "@/app/services/useMoneda";
import { useTipoCambio } from "@/app/(protected)/maestros/tipo-de-cambio/api/list-tipos-cambio";
import { toast } from "react-toastify";
import { useCreatePedido } from "../api/create-pedido";
import { useUpdatePedido } from "../api/[id]/update-pedido";
import { NoExisteTipoDeCambio } from "@/app/components/ui/common/tipo-cambio-missing";
import { useUpdateEstadoPedido } from "../api/[id]/update-estado-pedido";
import { useSession } from "next-auth/react";
import DialogEditDetalle from "@/app/components/ui/dialog-edit-detalle";
import { columnsDetalles } from "../components/columns/columns-detalles";

const PedidoValidator = Joi.object({
  // Cabecera
  ano: Joi.string().required(),
  codmon: Joi.string().required(),
  diraux: Joi.string().required(),
  fch_ent: Joi.string().required(),
  fchdoc: Joi.string().required(),
  flg_incigv: Joi.boolean().required(),
  for_pago: Joi.number().required(),
  glosa: Joi.string().allow(null).required(),
  id_clie: Joi.number().required(),
  id_cot: Joi.number().allow(null).required(),
  id_ven: Joi.number().required(),
  impbto: Joi.number().required(),
  impigv: Joi.number().required(),
  imptot: Joi.number().required(),
  mes: Joi.string().required(),
  nomaux: Joi.string().required(),
  nrodoc: Joi.string().optional().allow("", null),
  ocompra: Joi.string().allow(null).required(),
  porigv: Joi.number().required(),
  rucaux: Joi.string().required(),
  tpocmb: Joi.number().required(),
  usuario: Joi.number().required(),
});

// Valores por defecto.
const defaultValues = (): IPedidoCabeceraFormState => ({
  ano: getLimaDate("YYYY") as string,
  codmon: "1",
  diraux: "",
  fch_ent: getLimaDate("YYYY-MM-DD") as string,
  fchdoc: getLimaDate("YYYY-MM-DD") as string,
  flg_incigv: true,
  for_pago: null,
  glosa: null,
  id_clie: null,
  id_cot: null,
  id_ven: null,
  impbto: 0,
  impigv: 0,
  imptot: 0,
  mes: getLimaDate("MM") as string,
  nomaux: "",
  nrodoc: null,
  ocompra: null,
  porigv: 18,
  rucaux: "",
  tpocmb: 0,
  usuario: null,
});

interface FormularioPedidoProps {
  isAdd: boolean;
  id_ped?: number;
  pedido?: {
    message: string;
    cabecera: IPedidoCabeceraPorID;
    detalle: IPedidoDetallePorID[];
  };
}

export default function FormularioPedido({
  isAdd,
  id_ped,
  pedido,
}: FormularioPedidoProps) {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const backToListUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    params.delete("action");

    const qs = params.toString();
    return qs ? `/movimientos/pedidos?${qs}` : "/movimientos/pedidos";
  }, [searchParams]);

  const [openArticulos, setOpenArticulos] = useState<boolean>(false);
  const [openClientes, setOpenClientes] = useState<boolean>(false);
  const [openDetalle, setOpenDetalles] = useState<boolean>(false);
  const [isEnableEdit, setIsEnableEdit] = useState(!id_ped);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [detalles, setDetalles] = useState<IPedidoDetalleFormState[]>(() =>
    pedido ? mapDetalles(pedido.detalle) : [],
  );
  const [selectedDetalle, setSelectedDetalle] = useState<
    IPedidoDetalleFormState[]
  >([]);

  // TODO EL STOCK NO SE ACTUALIZA -VERIFICAR EL HANDLER Y SI DEBERIAS MOVER EL ENDPOOINT DE ARTICULOS AQUI PARA COMPARAR EN EL HANDLER-
  // TODO AL ANULAR EL PEDIDO, EL STOCK DE ARTICULO SE REESTABLECE
  // TODO FALTAN OCULTAR LOS BTNS ANULAR, APROBAR Y SU LÓGICA
  // TODO FALTA EL BANNER QUE EXPLIQUE EL STATUS DEL PEDIDO

  /*
   *=========================
   * QUERIES
   *=========================
   */

  const { data: dataVendedor = [], isLoading: isLoadingVendedor } =
    useVendedores();
  const { data: dataFormaDePago = [], isLoading: isLoadingFormaDePago } =
    usePaymentMethods();
  const { data: dataMonedas = [], isLoading: isLoadingMonedas } = useMoneda();
  const { data: dataTipoCambio = [], isLoading: isLoadingTipoCambio } =
    useTipoCambio();

  const isReady =
    !isLoadingVendedor &&
    !isLoadingFormaDePago &&
    !isLoadingMonedas &&
    !isLoadingTipoCambio;
  /*
   *=========================
   * MUTACIONES
   *=========================
   */

  const createMutation = useCreatePedido();
  const updateMutation = useUpdatePedido();
  const updateEstadoMutation = useUpdateEstadoPedido();

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    updateEstadoMutation.isPending;

  /*
   *=========================
   *  REACT HOOK FORM
   *  =========================
   */

  const methods = useForm<IPedidoCabeceraFormState>({
    defaultValues: defaultValues(),
    resolver: joiResolver(PedidoValidator),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  // Destructurando las propiedades del methods
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    control,
  } = methods;

  /*
   *=========================
   * USEWATCH Y HOOKS
   *=========================
   */

  const porigv = useWatch({
    control,
    name: "porigv",
  });

  const router = useRouter();
  const { agregarProducto } = useAgregarProducto(porigv);

  /*
   *=========================
   * CONSTANTES
   *=========================
   */

  const fechaHoy = getLimaDate("YYYYMMDD");
  const tipoCambioHoy = dataTipoCambio.find((tc) => tc.id_tcmb === fechaHoy);

  const totales = useMemo(() => {
    return detalles.reduce(
      (acc, item) => {
        acc.subtotal += item.subtot_art;
        acc.total += item.tot_art;
        acc.igv += item.tot_art - item.subtot_art;

        return acc;
      },
      { subtotal: 0, igv: 0, total: 0 },
    );
  }, [detalles]);

  const operacionesConIngresado =
    pedido?.cabecera.estado === "INGRESADO" && !isAdd; // Anular y aprobar
  const showSubmit = isEnableEdit;
  const showEdit =
    pedido?.cabecera.estado === "INGRESADO" && !isAdd && !isEnableEdit;

  /*
   *=========================
   * HANDLERS
   *=========================
   */

  const handleAgregarCliente = (clientes: ICustomerResponse[]) => {
    if (!clientes.length) return;

    const data = clientes[0];
    setValue("id_clie", data.id_aux);
    setValue("rucaux", data.ruc_aux);
    setValue("nomaux", data.des_aux);
    setValue("diraux", data.dir_legal || "");
    setValue("for_pago", data.for_pago);
    setValue("id_ven", data.id_ven);
  };

  const handleAgregarArticulo = (articulos: ProductResponse[]) => {
    if (!articulos.length) return;

    const nuevosDetalles = articulos.map((articulo, index) =>
      mapArticuloToDetalle(articulo, index),
    );

    setDetalles((prev) => [
      ...prev,
      ...agregarProducto(nuevosDetalles, prev.length),
    ]);
  };

  const handleEditarPrecios = (pedido: IDetallePrecios) => {
    setDetalles((prev) =>
      prev.map((detalle) =>
        selectedDetalle.some(
          (seleccionado) => seleccionado.cod_art === detalle.cod_art,
        )
          ? { ...detalle, ...pedido }
          : detalle,
      ),
    );
    setClearSelectionCounter((prev) => prev + 1);
  };

  const handleEliminarArticulo = () => {
    const nuevosDetalles = detalles
      .filter((v) => v.nroitm !== selectedDetalle?.[0]?.nroitm)
      .map((val, i) => ({
        ...val,
        nroitm: i + 1,
      }));
    setClearSelectionCounter((prev) => prev + 1);
    setDetalles(nuevosDetalles);
    setSelectedDetalle([]);
  };

  const handleVisualizarDetalle = () => {
    if (!selectedDetalle.length) return;
    setOpenDetalles(true);
  };

  const handleResetSeleccion = () => {
    setOpenDetalles(false);
    setSelectedDetalle([]);
    setClearSelectionCounter((prev) => prev + 1);
  };

  const handleUpdateEstado = (accion: "aprobar" | "anular") => {
    if (!id_ped) {
      toast.error("El id del pedido no es válido", { autoClose: 1600 });
      return;
    }
    updateEstadoMutation.mutate({
      idPed: Number(id_ped),
      accion,
    });
  };

  const handleEditarPedido = () => {
    if (isAdd) return "El pedido no está en modo editar";
    toast.info("Ahora puede modificar el pedido", { autoClose: 1600 });
    setIsEnableEdit(true);
  };

  /*
   *=========================
   * SYNC / SINCRONIZACIÓN / Effects
   *=========================
   */

  useEffect(() => {
    if (!isAdd) return;
    if (isLoadingTipoCambio) return;
    if (!tipoCambioHoy) return;

    setValue("tpocmb", Number(tipoCambioHoy.ofivta));
  }, [tipoCambioHoy, isLoadingTipoCambio, setValue, isAdd]);

  useEffect(() => {
    if (!isAdd) return;
    if (!session) return;
    setValue("usuario", Number(session?.user.id_usu));
  }, [isAdd, setValue, session]);

  useEffect(() => {
    setValue("impbto", totales.subtotal);
    setValue("impigv", totales.igv);
    setValue("imptot", totales.total);
  }, [isAdd, setValue, totales]);

  /*
   *=========================
   * SUBMIT Y AUTOCOMPLETADO
   *=========================
   */

  // Loadinitialdata
  useEffect(() => {
    if (!pedido) return;

    reset({
      ...defaultValues(),
      ...mapCabecera(pedido.cabecera),
    });
  }, [pedido, reset]);

  // Submit
  const onSubmit = async (data: IPedidoCabeceraForm) => {
    if (detalles.length === 0) {
      toast.error("Debe agregar mínimo un artículo.", { autoClose: 1500 });
      return;
    }

    if (detalles.some((val) => val.can_art === 0)) {
      toast.error("Un elemento o más tienen un precio de 0.", {
        autoClose: 1500,
      });
      return;
    }

    const cabecera = data;
    const detalle = detalles;

    if (isAdd) {
      const res = await createMutation.mutateAsync({ cabecera, detalle });
      const createdId = res.id_ped;
      if (createdId) {
        router.push(
          `/movimientos/pedidos/${createdId}?${searchParams.toString()}`,
        );
      } else {
        router.push(`${backToListUrl}`);
      }
    } else if (id_ped) {
      await updateMutation.mutateAsync({
        id_ped,
        cabecera,
        detalle,
      });
    }
    setIsEnableEdit(false);
  };

  const onError = () => {
    //data: IPedidoCabeceraFormState
    //console.log(data);
    toast.error("Complete los campos requeridos");
  };

  /*
   *=========================
   * FORMULARIO
   *=========================
   */

  if (!isReady) {
    return <LoadingSidebar />;
  }

  if (!tipoCambioHoy) {
    return <NoExisteTipoDeCambio />;
  }

  return (
    <>
      <DialogAddArticulos
        open={openArticulos}
        setOpen={setOpenArticulos}
        onConfirm={handleAgregarArticulo}
        detalles={detalles}
      />

      <DialogAddClientes
        open={openClientes}
        setOpen={setOpenClientes}
        onConfirm={handleAgregarCliente}
      />

      {selectedDetalle[0] && (
        <DialogEditDetalle
          key={selectedDetalle[0].nroitm}
          open={openDetalle}
          setOpen={setOpenDetalles}
          data={selectedDetalle[0]}
          igv={porigv}
          onCommit={handleEditarPrecios}
          onClose={handleResetSeleccion}
        />
      )}

      <FormProvider {...methods}>
        <Formulario
          title={isAdd ? "Nuevo Pedido" : "Consultar Pedido"}
          showAnular={operacionesConIngresado}
          showAprobar={operacionesConIngresado}
          showEdit={showEdit}
          showSubmit={showSubmit}
          onSave={handleSubmit(onSubmit, onError)}
          onEdit={handleEditarPedido}
          onCancel={() => router.push(backToListUrl)}
          isSubmitting={isPending}
          onAprobar={() => handleUpdateEstado("aprobar")}
          onAnular={() => handleUpdateEstado("anular")}
          {...totales}
          pedido={pedido?.cabecera || undefined}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-1.5 w-full">
            {/* Primera fila: Pedido y Fecha */}
            <div className="flex flex-col">
              <Label htmlFor="nrodoc">N.º Pedido</Label>
              <Input id="nrodoc" disabled {...register("nrodoc")} />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="fchdoc">Fecha</Label>
              <InputDate
                id="fchdoc"
                {...register("fchdoc")}
                name="fchdoc"
                disabled={!isEnableEdit}
              />
            </div>

            <div className="hidden lg:block lg:col-span-4" />

            {/* Segunda fila: RUC Cliente, Razón social, Cotizaciones y espacio vacío */}
            <div className="flex flex-col">
              <Label htmlFor="rucaux">
                RUC Cliente <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="rucaux"
                  disabled
                  placeholder="RUC"
                  className="pr-9"
                  {...register("rucaux")}
                  error={!!errors.rucaux}
                />
                <Button
                  type="button"
                  className="absolute right-0 top-0 h-full px-2.5 flex items-center justify-center text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-r-md transition-colors cursor-pointer"
                  disabled={!isEnableEdit}
                  onClick={() => {
                    setOpenClientes(true);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="sm:col-span-1 md:col-span-2 lg:col-span-3 flex flex-col">
              <Label htmlFor="nomaux">
                Razón social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomaux"
                disabled
                placeholder="Nombre o razón social"
                {...register("nomaux")}
                error={!!errors.nomaux}
              />
            </div>

            <div className="flex flex-col justify-end">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                disabled
              >
                Cotizaciones
              </Button>
            </div>

            <div className="hidden lg:block" />

            {/* Tercera fila: Dirección */}
            <div className="sm:col-span-2 md:col-span-4 lg:col-span-6 flex flex-col">
              <Label htmlFor="diraux">
                Dirección <span className="text-red-500">*</span>
              </Label>
              <Input
                id="diraux"
                placeholder="Ingrese dirección"
                {...register("diraux")}
                error={!!errors.diraux}
                disabled={!isEnableEdit}
              />
            </div>

            {/* Cuarta fila: Vendedor, Forma de pago y Orden de compra */}
            <div className="sm:col-span-2 md:col-span-2 lg:col-span-2 flex flex-col">
              <Label htmlFor="id_ven">
                Vendedor <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="id_ven"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() ?? ""}
                    disabled={!isEnableEdit}
                    onValueChange={(value) => {
                      const num = parseInt(value, 10);
                      if (!Number.isFinite(num)) return;

                      setValue("id_ven", num);
                    }}
                  >
                    <SelectTrigger
                      id="id_ven"
                      error={!!errors.id_ven}
                      className="data-[placeholder]:!normal-case"
                    >
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>

                    <SelectContent>
                      {isLoadingVendedor ? (
                        <LoadingSidebar />
                      ) : (
                        dataVendedor?.map((vendedor) => (
                          <SelectItem
                            key={vendedor.id_aux}
                            value={vendedor.id_aux.toString()}
                          >
                            {vendedor.des_aux}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="sm:col-span-2 flex flex-col">
              <Label htmlFor="for_pago">
                Forma de pago <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="for_pago"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value?.toString() ?? ""}
                    disabled={!isEnableEdit}
                    onValueChange={(value) => {
                      const num = parseInt(value, 10);
                      if (!Number.isFinite(num)) return;

                      field.onChange(num);
                    }}
                  >
                    <SelectTrigger
                      id="for_pago"
                      error={!!errors.for_pago}
                      className="data-[placeholder]:!normal-case"
                    >
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>

                    <SelectContent>
                      {isLoadingFormaDePago ? (
                        <LoadingSidebar />
                      ) : (
                        dataFormaDePago?.map((formaDePago) => (
                          <SelectItem
                            key={formaDePago.for_pago}
                            value={formaDePago.for_pago.toString()}
                          >
                            {formaDePago.forma_pago}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="ocompra">O/Compra</Label>
              <Input
                id="ocompra"
                placeholder="N.º O/C"
                {...register("ocompra")}
                disabled={!isEnableEdit}
              />
            </div>

            <div className="hidden lg:block" />

            {/* Quinta fila: Glosa, Moneda y Tipo de cambio */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4 flex flex-col gap-1">
              <Label htmlFor="glosa">Glosa</Label>
              <Input
                id="glosa"
                placeholder="Ingrese una descripción -opcional-"
                {...register("glosa")}
                disabled={!isEnableEdit}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="codmon">Moneda</Label>
              <Controller
                name="codmon"
                control={control}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    disabled={!isEnableEdit}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="for_pago"
                      className="data-[placeholder]:!normal-case"
                    >
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingMonedas ? (
                        <SelectItem value="loading" disabled>
                          Cargando...
                        </SelectItem>
                      ) : (
                        dataMonedas?.map((moneda) => (
                          <SelectItem key={moneda.codmon} value={moneda.codmon}>
                            {moneda.descrip}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col">
              <Label htmlFor="tpocmb">T.Cambio</Label>
              <InputNumber id="tpocmb" disabled {...register("tpocmb")} />
            </div>
          </div>

          <div className="space-y-1">
            <ArticulosActions
              disableAdd={!isEnableEdit}
              onAdd={() => setOpenArticulos(true)}
              onDelete={handleEliminarArticulo}
              onView={handleVisualizarDetalle}
              disableView={!selectedDetalle.length}
              disableDelete={!selectedDetalle.length}
            />

            {detalles?.length > 0 ? (
              <DataTable
                columns={columnsDetalles}
                disable={!isEnableEdit}
                data={detalles}
                cantidadMostrar={7}
                onRowsSelected={setSelectedDetalle}
                clearSelectionTrigger={clearSelectionCounter}
              />
            ) : (
              <div className="flex items-center justify-center h-32 rounded-xl border border-black/15 dark:border-[var(--color-border)] shadow-sm bg-gray-100 dark:bg-white/[0.02]">
                <p className="text-base font-semibold text-[var(--color-regular-text)]">
                  Aún no se han agregado detalles.
                </p>
              </div>
            )}
          </div>
        </Formulario>
      </FormProvider>
    </>
  );
}
