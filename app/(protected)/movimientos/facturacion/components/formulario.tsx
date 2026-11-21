"use client";

import { useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { getLimaDate } from "@/app/utils/dateUtils";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";

import LoadingSidebar from "@/app/components/loading/LoadingSidebar";
import { NoExisteTipoDeCambio } from "@/app/components/ui/common/tipo-cambio-missing";

import { useAlmacenes } from "@/app/(protected)/maestros/almacenes/api/list-almacenes";
import { useVendedores } from "@/app/(protected)/maestros/vendedores/api/list-vendedores";
import { usePaymentMethods } from "@/app/(protected)/maestros/formas-de-pago/api/list-formas-pago";
import { useMoneda } from "@/app/services/useMoneda";
import { useTipoCambio } from "@/app/(protected)/maestros/tipo-de-cambio/api/list-tipos-cambio";
import { useProducts } from "@/app/(protected)/maestros/articulos/api/list-articulos";

import { usePedidosPorCliente } from "../../pedidos/api/list-pedidos-by-idclient";
import { IPedidoPorCliente } from "../../pedidos/types";

import { ICustomerResponse } from "@/app/(protected)/maestros/clientes/types";
import { ProductResponse } from "@/app/(protected)/maestros/articulos/types";

import { useCreateFactura } from "../api/create-factura";
import { useAnularFactura } from "../api/[id]/update-estado-factura";

import {
  FacturacionCabecera,
  FacturacionCabeceraFormState,
  FacturacionDetalle,
  FacturacionDetalleFormState,
} from "../types";
import DialogAddArticulos from "@/app/components/articulos/DialogAddArticulo";
import DialogEditDetalle from "@/app/components/ui/dialog-edit-detalle";
import DialogAddClientes from "@/app/components/clientes/DialogAddCliente";
import { Formulario } from "@/app/components/ui/formulario";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import InputDate from "@/app/components/ui/InputDate";
import Button from "@/app/components/ui/button";
import { Search } from "lucide-react";
import InputNumber from "@/app/components/ui/input-number";
import DialogAddModulo, {
  IDocumentoPorCliente,
  Modulos,
} from "@/app/components/ui/common/dialog-select-modulo";
import { ArticulosActions } from "@/app/components/articulos/articulos-buttons";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import { columnsDetalles } from "./columns/columns-detalles";
import { useAgregarProducto } from "../hooks/useCalcularPrecio";
import { mapArticuloToDetalle } from "../utils/mappers";
import { useRemisionesPorCliente } from "../../guia-remision/api/list-remisiones-by-idaux";
import { IRemisionPorCliente } from "../../guia-remision/types";
import { descargarFacturaPdf } from "../print";

const Validaciones = Joi.object<FacturacionCabecera>({
  ano: Joi.string().required(),
  codalm: Joi.string().required(),
  codmon: Joi.string().required(),
  diavto: Joi.number().required(),
  diraux: Joi.string().allow("", null).optional(),
  fchcob: Joi.string().allow(null).optional(),
  fchdoc: Joi.string().required(),
  fchvto: Joi.string().required(),
  flg_incigv: Joi.boolean().required(),
  for_pago: Joi.number().allow(null).optional(),
  guia_remision: Joi.string().allow("", null).optional(),
  id_remision: Joi.number().allow(null).optional(),
  id_aux: Joi.number().allow(null).optional(),
  id_cpc: Joi.number().allow(null).optional(),
  id_ped: Joi.number().allow(null).optional(),
  id_tipdoc: Joi.number().required(),
  id_ven: Joi.number().allow(null).optional(),
  impadel: Joi.number().required(),
  impigv: Joi.number().required(),
  impsbt: Joi.number().required(),
  imptot: Joi.number().required(),
  monto_a: Joi.number().required(),
  monto_i: Joi.number().required(),
  nomaux: Joi.string().allow("", null).optional(),
  nro_ped: Joi.string().allow(null, "").optional(),
  nromes: Joi.string().required(),
  num_doc: Joi.string().allow(null, "").optional(),
  ocompra: Joi.string().allow(null, "").optional(),
  porigv: Joi.number().required(),
  rucaux: Joi.string().allow("", null).optional(),
  sdodoc: Joi.number().required(),
  ser_doc: Joi.string().required(),
  tipo: Joi.string().allow(null).optional(),
  tpocmb: Joi.number().required(),
  usuario: Joi.number().allow(null).optional(),
});

const defaultValues = (): FacturacionCabecera => ({
  ano: getLimaDate("YYYY") as string,
  codalm: "",
  codmon: "1",
  diavto: 0,
  diraux: "",
  fchcob: null,
  fchdoc: getLimaDate("YYYY-MM-DD") as string,
  fchvto: getLimaDate("YYYY-MM-DD") as string,
  flg_incigv: true,
  for_pago: null,
  guia_remision: null,
  id_remision: null,
  id_aux: null,
  id_cpc: null,
  id_ped: null,
  id_tipdoc: 1,
  id_ven: null,
  impadel: 0,
  impigv: 0,
  impsbt: 0,
  imptot: 0,
  monto_a: 0,
  monto_i: 0,
  nomaux: "",
  nro_ped: null,
  nromes: getLimaDate("MM") as string,
  num_doc: null,
  ocompra: null,
  porigv: 18,
  rucaux: "",
  sdodoc: 0,
  ser_doc: "",
  tipo: "3",
  tpocmb: 0,
  usuario: null,
});

interface FormularioFacturaProps {
  isAdd: boolean;
  id_cpc?: number;
  factura?: {
    message: string;
    cabecera: FacturacionCabeceraFormState;
    detalle: FacturacionDetalleFormState[];
  };
}

export default function FormularioFactura({
  isAdd,
  id_cpc,
  factura,
}: FormularioFacturaProps) {
  const router = useRouter();
  const session = useSession();
  const searchParams = useSearchParams();

  const backToListUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    params.delete("action");

    const qs = params.toString();

    return qs ? `/movimientos/facturacion?${qs}` : "/movimientos/facturacion/";
  }, [searchParams]);

  /* =========================
     ESTADOS
  ========================= */

  const [openArticulos, setOpenArticulos] = useState(false);
  const [openClientes, setOpenClientes] = useState(false);
  const [openDetalle, setOpenDetalles] = useState(false);
  const [openModulo, setOpenModulo] = useState(false);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);

  const [detalles, setDetalles] = useState<FacturacionDetalleFormState[]>(
    () => factura?.detalle ?? [],
  );

  const [selectedDetalle, setSelectedDetalle] = useState<
    FacturacionDetalleFormState[]
  >([]);

  /*
   *=========================
   *  REACT HOOK FORM
   *  =========================
   */

  const methods = useForm<FacturacionCabecera>({
    resolver: joiResolver(Validaciones),
    defaultValues: defaultValues(),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  const {
    setValue,
    register,
    handleSubmit,
    reset,
    control,
    formState,
    formState: { errors },
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

  const idaux = useWatch({
    control,
    name: "id_aux",
  });

  // Remisión, pedido, libre
  const tipo = useWatch({
    control,
    name: "tipo",
  });

  const idtipdoc = useWatch({
    control,
    name: "id_tipdoc",
  });

  const forpago = useWatch({
    control,
    name: "for_pago",
  });

  const fchdoc = useWatch({
    control,
    name: "fchdoc",
  });

  const { agregarProducto } = useAgregarProducto(porigv);

  /*
   *=========================
   * QUERIES
   *=========================
   */
  const { data: dataAlmacen = [], isLoading: isLoadingAlmacen } =
    useAlmacenes();
  const { data: dataVendedor = [], isLoading: isLoadingVendedor } =
    useVendedores();
  const { data: dataFormaDePago = [], isLoading: isLoadingFormaDePago } =
    usePaymentMethods();
  const { data: dataMonedas = [], isLoading: isLoadingMonedas } = useMoneda();
  const { data: dataTipoCambio = [], isLoading: isLoadingTipoCambio } =
    useTipoCambio();
  const { data: dataArticulos = [], isLoading: isLoadingArticulos } =
    useProducts();
  const { data: dataPedidos = [], isLoading: isLoadingPedidosPorCliente } =
    usePedidosPorCliente(idaux ?? null);
  const { data: dataRemision = [], isLoading: isLoadingRemisionPorCliente } =
    useRemisionesPorCliente(idaux ?? null);

  const isReady =
    !isLoadingAlmacen &&
    !isLoadingVendedor &&
    !isLoadingFormaDePago &&
    !isLoadingMonedas &&
    !isLoadingTipoCambio &&
    !isLoadingArticulos;

  /*
   *=========================
   * MUTACIONES
   *=========================
   */
  const createMutation = useCreateFactura();
  const anularMutation = useAnularFactura();

  const isPending = createMutation.isPending || anularMutation.isPending;

  /*
   *=========================
   * CONSTANTES
   *=========================
   */
  const tipoModulo: Record<string, keyof Modulos> = {
    "1": "remisiones",
    "2": "pedidos",
    "3": "pedidos",
  };

  const fechaHoy = getLimaDate("YYYYMMDD");
  const tipoCambioHoy = dataTipoCambio.find((tc) => tc.id_tcmb === fechaHoy);

  const totales = useMemo(() => {
    return detalles.reduce(
      (acc, item) => {
        const subtot = Number(item.subtot_art) || 0;
        const tot = Number(item.tot_art) || 0;

        acc.subtotal += subtot;
        acc.total += tot;
        acc.igv += tot - subtot;

        return acc;
      },
      { subtotal: 0, igv: 0, total: 0 },
    );
  }, [detalles]);

  const isAdmin = session?.data?.user?.rol === "ADMIN";

  const showAnular = isAdmin && factura?.cabecera.estado === "INGRESADO";
  const showPrint = !isAdd && factura?.cabecera.estado === "INGRESADO";
  const formaPago = dataFormaDePago?.find(
    (fp) => fp.for_pago === Number(forpago),
  );

  const articulosStockActual = useMemo(
    () =>
      dataArticulos.map((articulo) => {
        const cantidad = detalles
          .filter(
            (item) =>
              item.id_art === articulo?.id_art && !item.id_ped && !item.id_alm,
          )
          .reduce((total, item) => total + item.can_art, 0);

        if (isAdd) {
          return {
            ...articulo,
            stkact: articulo.stkact - cantidad,
          };
        }

        const cantidadOriginal =
          factura?.detalle
            .filter(
              (item) =>
                item.id_art === articulo.id_art && !item.id_ped && !item.id_alm,
            )
            .reduce((total, item) => total + item.can_art, 0) ?? 0;

        return {
          ...articulo,
          stkact: articulo.stkact - (cantidad - cantidadOriginal),
        };
      }),
    [dataArticulos, detalles, isAdd, factura],
  );

  const isRemision = tipoModulo[tipo] === "remisiones";

  const dataModulo = isRemision ? dataRemision : dataPedidos;
  const isLoadingModulo = isRemision
    ? isLoadingRemisionPorCliente
    : isLoadingPedidosPorCliente;

  /*
   *=========================
   * HANDLERS
   *=========================
   */

  const handleAgregarCliente = (clientes: ICustomerResponse[]) => {
    if (!clientes.length) return;

    const data = clientes[0];

    setValue("id_aux", data.id_aux);
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

  const handleEditarPrecios = (
    detalleActualizado: Partial<FacturacionDetalle>,
  ) => {
    setDetalles((prev) =>
      prev.map((detalle) =>
        selectedDetalle.some(
          (seleccionado) => seleccionado.nroitm === detalle.nroitm,
        )
          ? { ...detalle, ...detalleActualizado }
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

  const handleResetSeleccion = () => {
    setOpenDetalles(false);
    setSelectedDetalle([]);
    setClearSelectionCounter((prev) => prev + 1);
  };

  const handleVisualizarDetalle = () => {
    if (!selectedDetalle.length) return;
    setOpenDetalles(true);
  };

  const handleCommitPedido = (pedido: IPedidoPorCliente) => {
    if (!pedido || !pedido.id_ped) return;

    const year = pedido.fchdoc.slice(0, 4);
    setValue("id_ven", pedido.id_ven);
    setValue("for_pago", pedido.for_pago);
    setValue("codmon", pedido.codmon);
    setValue("tpocmb", pedido.tpocmb);
    setValue("id_ped", pedido.id_ped);
    setValue("nro_ped", `${year}-${pedido.nrodoc}`);

    const nuevosDetalles = pedido.detalles.map((det, index) => ({
      alias_umed: det.alias_umed,
      can_art: det.can_pendiente ?? det.can_art,
      cod_art: det.cod_art,
      des_ar1: det.des_ar1 ?? "",
      des_ar2: det.des_ar2 ?? "",
      des_ar3: det.des_ar3 ?? "",
      des_ar4: det.des_ar4 ?? "",
      des_ar5: det.des_ar5 ?? "",
      des_ar6: det.des_ar6 ?? "",
      des_ar7: det.des_ar7 ?? "",
      des_ar8: det.des_ar8 ?? "",
      des_art: det.des_art,
      factor: det.factor,
      id_art: det.id_art,
      id_alm: null,
      id_ped: det.id_ped || null,
      id_umedr: det.id_umedr,
      igv_art: Number(det.igv_art),
      itmalm: null,
      itmped: det.nroitm,
      nroalm: null,
      nroitm: index + 1,
      nroped: pedido.nrodoc,
      operador: det.operador,
      pdes_art: det.pdes_art,
      pre_art: det.pre_art,
      pu_conigv: Number(det.pu_conigv),
      pu_des: det.pu_des,
      pu_sinigv: Number(det.pu_sinigv),
      subtot_art: Number(det.subtot_art),
      tot_art: det.tot_art,
    }));
    setDetalles(nuevosDetalles);
    toast.success("Pedido agregado correctamente", { autoClose: 1600 });
  };

  const handleCommitRemisiones = (remision: IRemisionPorCliente) => {
    if (!remision || !remision.id_remision || !remision.numero) return;

    setValue("id_ven", remision.id_ven);
    setValue("for_pago", remision.for_pago);
    setValue("codmon", remision.codmon);
    setValue("tpocmb", remision.tpocmb);
    setValue("id_remision", remision.id_remision);
    setValue("guia_remision", remision.numero);

    const nuevosDetalles = remision.detalles.map((det, index) => ({
      alias_umed: det.alias_umed,
      can_art: det.can_art,
      cod_art: det.cod_art,
      des_ar1: det.des_ar1 ?? "",
      des_ar2: det.des_ar2 ?? "",
      des_ar3: det.des_ar3 ?? "",
      des_ar4: det.des_ar4 ?? "",
      des_ar5: det.des_ar5 ?? "",
      des_ar6: det.des_ar6 ?? "",
      des_ar7: det.des_ar7 ?? "",
      des_ar8: det.des_ar8 ?? "",
      des_art: det.des_art,
      factor: det.factor,
      id_art: det.id_art,
      id_alm: remision.id_remision,
      id_ped: det.id_ped ?? null,
      id_umedr: det.id_umedr,
      igv_art: Number(det.igv_art),
      itmalm: det.nroitm,
      itmped: det.itmped ?? null,
      nroalm: remision.numero,
      nroitm: index + 1,
      nroped: det.nroped ?? null,
      operador: det.operador,
      pdes_art: det.pdes_art,
      pre_art: det.pre_art,
      pu_conigv: Number(det.pu_conigv),
      pu_des: det.pu_des,
      pu_sinigv: Number(det.pu_sinigv),
      subtot_art: Number(det.subtot_art),
      tot_art: det.tot_art,
    }));

    setDetalles(nuevosDetalles);
    toast.success("Guía de remisión agregada correctamente", {
      autoClose: 1600,
    });
  };

  function esPedido(item: IDocumentoPorCliente): item is IPedidoPorCliente {
    return item.id_ped !== undefined && item.id_ped !== null;
  }

  function esRemision(item: IDocumentoPorCliente): item is IRemisionPorCliente {
    return item.id_remision !== undefined;
  }

  const handleCommitDatosModulo = (element: IDocumentoPorCliente) => {
    const moduloActual = tipoModulo[tipo];

    if (moduloActual === "pedidos" && esPedido(element)) {
      handleCommitPedido(element);
    } else if (moduloActual === "remisiones" && esRemision(element)) {
      handleCommitRemisiones(element);
    }
  };

  const handleAnularFactura = () => {
    if (!id_cpc) return;
    anularMutation.mutate({ idCpc: id_cpc });
  };

  const handlePrintFactura = async () => {
    if (!factura?.cabecera) return;
    await descargarFacturaPdf({
      cabecera: factura.cabecera,
      detalle: factura.detalle ?? [],
    });
  };

  /*
   *=========================
   * SYNC / SINCRONIZACIÓN / Effects
   *=========================
   */

  useEffect(() => {
    if (isLoadingTipoCambio || !tipoCambioHoy) return;

    setValue("tpocmb", Number(tipoCambioHoy.ofivta));
  }, [tipoCambioHoy, isLoadingTipoCambio, setValue]);

  useEffect(() => {
    if (!isAdd || !session.data) return;

    setValue("usuario", Number(session.data.user.id_usu));
  }, [isAdd, setValue, session.data]);

  useEffect(() => {
    if (!factura) return;

    reset({
      ...defaultValues(),
      ...factura.cabecera,
    });
  }, [factura, reset]);

  useEffect(() => {
    if (!formaPago || !fchdoc) return;

    const dias = Number(formaPago.dias);

    if (dias <= 0) {
      setValue("diavto", 0);
      setValue("fchvto", fchdoc);
      setValue("fchcob", fchdoc);
      return;
    }

    setValue("diavto", formaPago.dias);

    const fechaVencimiento = new Date(fchdoc);
    fechaVencimiento.setDate(fechaVencimiento.getDate() + dias);

    const fechaVencimientoString = fechaVencimiento.toISOString().split("T")[0];

    setValue("fchvto", fechaVencimientoString);
    setValue("fchcob", fechaVencimientoString);
  }, [formaPago, fchdoc, setValue]);

  useEffect(() => {
    if (!isAdd) return;
    setValue("impsbt", totales.subtotal);
    setValue("impigv", totales.igv);
    setValue("imptot", totales.total);
    setValue("sdodoc", totales.total);
    setValue("monto_a", totales.subtotal);
  }, [isAdd, setValue, totales]);

  useEffect(() => {
    if (!isAdd) return;

    if (idtipdoc === 1) {
      setValue("ser_doc", "B001");
    } else {
      setValue("ser_doc", "F001");
    }
  }, [isAdd, idtipdoc, setValue]);

  /*
   *=========================
   * SUBMIT Y AUTOCOMPLETADO
   *=========================
   */

  useEffect(() => {
    if (!factura) return;
    reset({
      ...defaultValues(),
      ...factura.cabecera,
    });
  }, [factura, reset]);

  const onSubmit = async (data: FacturacionCabecera) => {
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
      const createdId = res.id_cpc;
      if (createdId) {
        router.push(
          `/movimientos/facturacion/${createdId}?${searchParams.toString()}`,
        );
      } else {
        router.push(`${backToListUrl}`);
      }
    }
  };

  const onError = () => {
    //data: FacturacionCabeceraFormState
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
      <DialogAddModulo
        modulo={tipoModulo[tipo]}
        data={dataModulo}
        open={openModulo}
        setOpen={setOpenModulo}
        isLoading={isLoadingModulo}
        onCommit={handleCommitDatosModulo}
      />

      <DialogAddClientes
        open={openClientes}
        setOpen={setOpenClientes}
        onConfirm={handleAgregarCliente}
      />

      <DialogAddArticulos
        open={openArticulos}
        setOpen={setOpenArticulos}
        onConfirm={handleAgregarArticulo}
        dataArticulos={dataArticulos}
        stockDisponible={articulosStockActual}
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
          title={isAdd ? "Nueva factura" : "Consultar factura"}
          showAnular={showAnular}
          showSubmit={isAdd}
          showPrint={showPrint}
          onCancel={() => router.push(backToListUrl)}
          onPrint={handlePrintFactura}
          isSubmitting={isPending}
          onSave={handleSubmit(onSubmit, onError)}
          onAnular={handleAnularFactura}
          {...totales}
          data={factura?.cabecera || undefined}
        >
          <div className="grid grid-cols-12 gap-x-1.5 gap-y-1.5 w-full">
            {/* Primera fila */}
            <div className="col-span-12 grid grid-cols-12 gap-x-2">
              {/* Serie */}
              <div className="col-span-6 md:col-span-1">
                <Label htmlFor="ser_doc">Serie</Label>
                <Input
                  id="ser_doc"
                  {...register("ser_doc")}
                  disabled={!isAdd}
                />
              </div>

              {/* Número */}
              <div className="col-span-6 md:col-span-2 lg:col-span-1">
                <Label htmlFor="num_doc">Número</Label>
                <Input id="num_doc" {...register("num_doc")} disabled />
              </div>

              {/* Tipo de documento */}
              <div className="col-span-12 md:col-span-3 lg:col-span-2">
                <Label htmlFor="id_tipdoc">Tipo</Label>
                <Controller
                  name="id_tipdoc"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      disabled={!isAdd}
                      value={field.value !== null ? String(field.value) : ""}
                      onValueChange={(value) => {
                        const num = parseInt(value, 10);
                        if (!Number.isFinite(num)) return;

                        setValue("id_tipdoc", num);
                      }}
                    >
                      <SelectTrigger id="id_tipdoc">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>

                      <SelectContent>
                        {[
                          { id_tipdoc: 1, descripcion: "BOLETA" },
                          { id_tipdoc: 2, descripcion: "FACTURA" },
                        ].map((tipo) => (
                          <SelectItem
                            key={tipo.id_tipdoc}
                            value={String(tipo.id_tipdoc)}
                          >
                            {tipo.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Origen */}
              <div className="col-span-6 md:col-span-3 lg:col-span-2">
                <Label htmlFor="tipo">Origen</Label>
                <Controller
                  name="tipo"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      disabled={!isAdd}
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        const str = value?.trim();
                        if (!str) return;

                        field.onChange(str);
                      }}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="1">G/REMISIÓN</SelectItem>
                        <SelectItem value="2">P/DESPACHAR</SelectItem>
                        <SelectItem value="3">LIBRE</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Almacén */}
              <div className="col-span-6 md:col-span-3 md:col-span-2">
                <Label htmlFor="codalm">
                  Almacén <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="codalm"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      disabled={!isAdd}
                      value={field.value ?? ""}
                      onValueChange={(value) => {
                        const str = value?.trim();
                        if (!str) return;

                        setValue("codalm", str);
                      }}
                    >
                      <SelectTrigger id="codalm" className="min-w-0">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>

                      <SelectContent>
                        {dataAlmacen?.map((alm) => (
                          <SelectItem
                            key={alm.codalm}
                            value={String(alm.codalm)}
                          >
                            {alm.aliasalm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          </div>

          <div className=" grid grid-cols-12 gap-x-2">
            <div className="col-span-12 md:col-span-3 lg:col-span-2">
              <Label htmlFor="rucaux">
                RUC/DNI <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="rucaux"
                  placeholder="RUC/DNI"
                  className="pr-9"
                  {...register("rucaux")}
                  disabled
                />
                <Button
                  type="button"
                  className="absolute right-0 top-0 h-full px-2.5 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-r-md"
                  disabled={!isAdd}
                  onClick={() => {
                    setOpenClientes(true);
                  }}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="col-span-12 md:col-span-7">
              <Label htmlFor="nomaux">
                Razón social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nomaux"
                placeholder="Nombre o razón social"
                {...register("nomaux")}
                disabled
              />
            </div>

            <div className="col-span-12 md:col-span-2">
              <Label className="invisible">Pedidos</Label>
              <Button
                type="button"
                variant="secondary"
                disabled={!isAdd || !idaux}
                className="w-full cursor-pointer"
                onClick={() => setOpenModulo(true)}
              >
                {tipo === "1" ? "Remisión" : "Pedidos"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-x-2">
            <div className="col-span-12 md:col-span-10 lg:col-span-9">
              <Label htmlFor="diraux">
                Dirección <span className="text-red-500">*</span>
              </Label>
              <Input
                id="diraux"
                disabled={!isAdd}
                placeholder="Ingrese dirección"
                {...register("diraux")}
                error={!!errors.diraux}
              />
            </div>

            {/* Fecha */}
            <div className="col-span-6 md:col-span-2">
              <Label htmlFor="fchdoc">Fecha</Label>
              <InputDate
                id="fchdoc"
                {...register("fchdoc")}
                error={!!formState.errors.fchdoc}
                hint={formState.errors.fchdoc?.message}
                disabled={!isAdd}
              />
            </div>
          </div>

          {/* Última fila */}
          <div className="col-span-12 grid grid-cols-12 gap-x-2">
            <div className="col-span-12 md:col-span-3">
              <Label htmlFor="id_ven">
                Vendedor <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="id_ven"
                control={control}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value?.toString() ?? ""}
                    onValueChange={(value) => {
                      const num = parseInt(value, 10);
                      if (!Number.isFinite(num)) return;

                      setValue("id_ven", num);
                    }}
                    disabled={!isAdd}
                  >
                    <SelectTrigger
                      id="id_ven"
                      error={!!errors.id_ven}
                      className="data-[placeholder]:!normal-case"
                    >
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataVendedor.map((vendedor) => (
                        <SelectItem
                          key={vendedor.id_aux}
                          value={vendedor.id_aux.toString()}
                        >
                          {vendedor.des_aux}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="col-span-12 md:col-span-3">
              <Label htmlFor="for_pago">
                Forma de pago <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="for_pago"
                control={control}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value?.toString() ?? ""}
                    disabled={!isAdd}
                    onValueChange={(value) => {
                      const num = parseInt(value, 10);
                      if (!Number.isFinite(num)) return;

                      setValue("for_pago", num);
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
                      {dataFormaDePago.map((formaDePago) => (
                        <SelectItem
                          key={formaDePago.for_pago}
                          value={formaDePago.for_pago.toString()}
                        >
                          {formaDePago.forma_pago}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="col-span-6 md:col-span-1">
              <Label htmlFor="diavto">Días vto.</Label>
              <InputNumber
                id="diavto"
                {...register("diavto")}
                disabled={!isAdd}
              />
            </div>

            {/* Fecha */}
            <div className="col-span-6 md:col-span-2">
              <Label htmlFor="fchvto">Fecha vto.</Label>
              <InputDate
                id="fchvto"
                {...register("fchvto")}
                error={!!formState.errors.fchvto}
                hint={formState.errors.fchvto?.message}
                disabled={!isAdd}
              />
            </div>

            <div className="col-span-6 md:col-span-2 md:col-start-10">
              <Label htmlFor="codmon">
                Moneda <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="codmon"
                control={control}
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                    disabled={!isAdd}
                  >
                    <SelectTrigger id="codmon" className="min-w-0">
                      <SelectValue placeholder="Seleccione" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataMonedas.map((moneda) => (
                        <SelectItem key={moneda.codmon} value={moneda.codmon}>
                          {moneda.descrip}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="col-span-6 md:col-span-1">
              <Label htmlFor="tpocmb">T. Cambio</Label>
              <InputNumber id="tpocmb" disabled {...register("tpocmb")} />
            </div>
          </div>

          <div className="space-y-1">
            <ArticulosActions
              disableAdd={!isAdd}
              onAdd={() => setOpenArticulos(true)}
              onDelete={handleEliminarArticulo}
              onView={handleVisualizarDetalle}
              disableView={!selectedDetalle.length}
              disableDelete={!selectedDetalle.length}
            />

            {detalles?.length > 0 ? (
              <DataTable
                columns={columnsDetalles}
                disable={!isAdd}
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
