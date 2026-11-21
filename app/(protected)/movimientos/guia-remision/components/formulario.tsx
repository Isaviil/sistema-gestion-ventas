"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, FormProvider, Controller, useWatch } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { getLimaDate } from "@/app/utils/dateUtils";
import { Label } from "@/app/components/ui/label";
import Input from "@/app/components/ui/input";
import InputNumber from "@/app/components/ui/input-number";
import Button from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useAlmacenes } from "@/app/(protected)/maestros/almacenes/api/list-almacenes";
import { useVendedores } from "@/app/(protected)/maestros/vendedores/api/list-vendedores";
import { usePaymentMethods } from "@/app/(protected)/maestros/formas-de-pago/api/list-formas-pago";
import { useMoneda } from "@/app/services/useMoneda";
import { useTipoCambio } from "@/app/(protected)/maestros/tipo-de-cambio/api/list-tipos-cambio";
import LoadingSidebar from "@/app/components/loading/LoadingSidebar";
import {
  IGuiaRemisionCabecera,
  IGuiaRemisionCabeceraPorID,
  IGuiaremisionDetalleFormState,
  IGuiaRemisionDetalles,
} from "../types";
import { Formulario } from "@/app/components/ui/formulario";
import { Search } from "lucide-react";
import { useTransportistas } from "@/app/(protected)/maestros/transportistas/api/list-transportistas";
import { useSession } from "next-auth/react";
import { ArticulosActions } from "@/app/components/articulos/articulos-buttons";
import { DataTable } from "@/app/components/ui/datatable/virtual-data-table";
import {
  IDetallePrecios,
  ProductResponse,
} from "@/app/(protected)/maestros/articulos/types";
import { columnsDetalles } from "./columns/columns-detalles";
import { ICustomerResponse } from "@/app/(protected)/maestros/clientes/types";
import DialogAddClientes from "@/app/components/clientes/DialogAddCliente";
import { NoExisteTipoDeCambio } from "@/app/components/ui/common/tipo-cambio-missing";
import DialogAddArticulos from "@/app/components/articulos/DialogAddArticulo";
import { useProducts } from "@/app/(protected)/maestros/articulos/api/list-articulos";
import DialogAddModulo, {
  IDocumentoPorCliente,
  Modulos,
} from "@/app/components/ui/common/dialog-select-modulo";
import { usePedidosPorCliente } from "../../pedidos/api/list-pedidos-by-idclient";
import { toast } from "react-toastify";
import { useCreateGuiaRemision } from "../api/create-remision";
import { DialogAddUbigeo } from "./dialog/dialog-add-ubigeo";
import { mapArticuloToGuiaDetalle } from "../utils/mappers";
import { useAnularGuiaRemision } from "../api/[id]/update-estado-remision";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "joi";
import DialogEditDetalle from "@/app/components/ui/dialog-edit-detalle";
import { useAgregarProducto } from "../hooks/useCalcularPrecio";
import { IPedidoPorCliente } from "../../pedidos/types";
import { IFacturaPorCliente } from "../../facturacion/types";
import { useFacturasPorCliente } from "../../facturacion/api/list-facturas-by-idaux";

const motivos = [
  { codmov: "01", desmov: "Ventas" },
  { codmov: "02", desmov: "Despacho facturas" },
  { codmov: "03", desmov: "Transferencias" },
];

const Validaciones = Joi.object<IGuiaRemisionCabecera>({
  serie: Joi.string().required(),
  codmov: Joi.string().required(),
  codalm: Joi.string().required(),
  fchdoc: Joi.string().required(),
  rucaux: Joi.string().optional().allow("", null),
  ubigeo1: Joi.string().required(),
  ubigeo2: Joi.string().required(),
  peso: Joi.number().required(),
  bultos: Joi.number().required(),
  id_transp: Joi.number().required(),
  id_ven: Joi.number().required(),
  for_pago: Joi.number().required(),
  dirent: Joi.string().required(),
  ptopartida: Joi.string().required(),
  codmon: Joi.string().required(),
  almdes: Joi.string().allow(null, "").optional(),
  almori: Joi.string().allow(null, "").optional(),
  ano: Joi.string().allow(null, "").optional(),
  factura: Joi.string().allow(null, "").optional(),
  fchtras: Joi.string().allow(null, "").optional(),
  flg_incigv: Joi.boolean().optional(),
  glosa: Joi.string().allow(null, "").optional(),
  id_remision: Joi.number().allow(null).optional(),
  id_aux: Joi.number().allow(null).optional(),
  id_chof: Joi.number().allow(null).optional(),
  id_ped: Joi.number().allow(null).optional(),
  id_cpc: Joi.number().allow(null).optional(),
  id_vehi: Joi.number().allow(null).optional(),
  mes: Joi.string().allow(null, "").optional(),
  nomaux: Joi.string().allow(null, "").optional(),
  numero: Joi.string().allow(null, "").optional(),
  pedido: Joi.string().allow(null, "").optional(),
  porigv: Joi.number().optional(),
  tpocmb: Joi.number().optional(),
  usuario: Joi.number().allow(null).optional(),
});

const defaultValues = (): IGuiaRemisionCabecera => ({
  almdes: null,
  almori: null,
  ano: getLimaDate("YYYY") as string,
  bultos: 0,
  codalm: "",
  codmon: "1",
  codmov: "01",
  dirent: "",
  factura: null,
  fchdoc: getLimaDate("YYYY-MM-DD") as string,
  fchtras: getLimaDate("YYYY-MM-DD") as string,
  flg_incigv: true,
  for_pago: null,
  glosa: null,
  id_remision: null,
  id_aux: null,
  id_chof: null,
  id_ped: null,
  id_cpc: null,
  id_transp: null,
  id_vehi: null,
  id_ven: null,
  mes: getLimaDate("MM") as string,
  nomaux: null,
  numero: null,
  pedido: null,
  peso: 0,
  porigv: 18,
  ptopartida: null,
  rucaux: null,
  serie: "B001",
  tpocmb: 0,
  ubigeo1: null,
  ubigeo2: null,
  usuario: null,
});

interface FormularioGuiaRemisionProps {
  isAdd: boolean;
  id_remision?: number;
  remision?: {
    message: string;
    cabecera: IGuiaRemisionCabeceraPorID;
    detalle: IGuiaremisionDetalleFormState[];
  };
}

export default function FormularioGuiaRemision({
  isAdd,
  id_remision,
  remision,
}: FormularioGuiaRemisionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const backToListUrl = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("id");
    params.delete("action");

    const qs = params.toString();
    return qs
      ? `/movimientos/guia-remision?${qs}`
      : "/movimientos/guia-remision/";
  }, [searchParams]);

  const [openArticulos, setOpenArticulos] = useState<boolean>(false);
  const [openClientes, setOpenClientes] = useState<boolean>(false);
  const [openDetalle, setOpenDetalles] = useState<boolean>(false);
  const [openModulo, setOpenModulo] = useState(false);
  const [openUbigeo, setOpenUbigeo] = useState(false);
  const [clearSelectionCounter, setClearSelectionCounter] = useState(0);
  const [detalles, setDetalles] = useState<IGuiaremisionDetalleFormState[]>(
    () => remision?.detalle ?? [],
  );
  const [selectedDetalle, setSelectedDetalle] = useState<
    IGuiaRemisionDetalles[]
  >([]);
  const [ubigeoActual, setUbigeoActual] = useState<
    "ubigeo1" | "ubigeo2" | null
  >(null);

  /*
   *=========================
   *  REACT HOOK FORM
   *  =========================
   */

  const methods = useForm<IGuiaRemisionCabecera>({
    resolver: joiResolver(Validaciones),
    defaultValues: defaultValues(),
    shouldFocusError: true,
    reValidateMode: "onChange",
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = methods;

  /*
   *=========================
   * USEWATCH Y HOOKS
   *=========================
   */

  const codmov = useWatch({
    control,
    name: "codmov",
  });

  const codalm = useWatch({
    control,
    name: "codalm",
  });

  const almdes = useWatch({
    control,
    name: "almdes",
  });

  const idaux = useWatch({
    control,
    name: "id_aux",
  });

  const [ubigeo1, ubigeo2] = useWatch({
    control,
    name: ["ubigeo1", "ubigeo2"],
  });

  const porigv = useWatch({
    control,
    name: "porigv",
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
  const { data: dataTransportista = [], isLoading: isLoadingTransportista } =
    useTransportistas();
  const { data: dataArticulos = [], isLoading: isLoadingArticulos } =
    useProducts();
  const { data: dataPedidos = [], isLoading: isLoadingPedidosPorCliente } =
    usePedidosPorCliente(idaux ?? null);
  const { data: dataFacturas = [], isLoading: isLoadingFacturasPorCliente } =
    useFacturasPorCliente(idaux ?? null);

  const isReady =
    !isLoadingAlmacen &&
    !isLoadingVendedor &&
    !isLoadingFormaDePago &&
    !isLoadingMonedas &&
    !isLoadingTipoCambio &&
    !isLoadingTransportista &&
    !isLoadingArticulos;

  /*
   *=========================
   * MUTACIONES
   *=========================
   */

  const createMutation = useCreateGuiaRemision();
  const anularMutation = useAnularGuiaRemision();
  const isPending = createMutation.isPending || anularMutation.isPending;

  /*
   *=========================
   * CONSTANTES
   *=========================
   */

  const tipoModulo: Record<string, keyof Modulos> = {
    "01": "pedidos",
    "02": "facturas",
    "03": "pedidos",
  };

  const fechaHoy = getLimaDate("YYYYMMDD");
  const tipoCambioHoy = dataTipoCambio.find((tc) => tc.id_tcmb === fechaHoy);

  const isTransferencia = codmov === "03";
  const isAdmin = session?.user?.rol === "ADMIN";
  const ubigeoSeleccionada = ubigeoActual === "ubigeo1" ? ubigeo1 : ubigeo2;
  const showAnular = isAdmin && remision?.cabecera.estado === "INGRESADO";

  const direccionAlmacen = dataAlmacen?.find(
    (x) => x.codalm === Number(codalm),
  )?.diralm;

  const direccionAlmacenDestino = dataAlmacen?.find(
    (x) => x.codalm === Number(almdes),
  )?.diralm;

  const articulosStockActual = useMemo(
    () =>
      dataArticulos.map((articulo) => {
        const cantidad = detalles
          .filter(
            (item) =>
              item.id_art === articulo?.id_art && !item.id_ped && !item.id_cpc,
          )
          .reduce((total, item) => total + item.can_art, 0);

        if (isAdd) {
          return {
            ...articulo,
            stkact: articulo.stkact - cantidad,
          };
        }

        const cantidadOriginal =
          remision?.detalle
            .filter(
              (item) =>
                item.id_art === articulo.id_art && !item.id_ped && !item.id_cpc,
            )
            .reduce((total, item) => total + item.can_art, 0) ?? 0;

        return {
          ...articulo,
          stkact: articulo.stkact - (cantidad - cantidadOriginal),
        };
      }),
    [dataArticulos, detalles, isAdd, remision],
  );

  const isFactura = tipoModulo[codmov] === "facturas";
  const dataModulo = isFactura ? dataFacturas : dataPedidos;
  const isLoadingModulo = isFactura
    ? isLoadingFacturasPorCliente
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
    setValue("dirent", data.dir_legal || "");
    setValue("for_pago", data.for_pago);
    setValue("id_ven", data.id_ven);
  };

  const handleAgregarArticulo = (articulos: ProductResponse[]) => {
    if (!articulos.length) return;

    const nuevosDetalles = articulos.map((articulo, index) =>
      mapArticuloToGuiaDetalle(articulo, index),
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
          (seleccionado) => seleccionado.nroitm === detalle.nroitm,
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

    if (
      remision?.cabecera.id_ped !== null &&
      !nuevosDetalles.some((item) => item.id_ped === remision?.cabecera.id_ped)
    ) {
      setValue("id_ped", null);
      setValue("pedido", null);
      setValue("glosa", null);
    }

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
    setValue("glosa", pedido.glosa);
    setValue("id_ped", pedido.id_ped);
    setValue("pedido", `${year}-${pedido.nrodoc}`);

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
      id_cpc: null,
      id_ped: det.id_ped || null,
      id_umedr: det.id_umedr,
      igv_art: Number(det.igv_art),
      itmcpc: null,
      itmped: det.nroitm,
      nrocpc: null,
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

  const handleCommitFactura = (factura: IFacturaPorCliente) => {
    if (!factura.id_cpc) return;

    setValue("id_ven", factura.id_ven);
    setValue("for_pago", factura.for_pago);
    setValue("codmon", factura.codmon);
    setValue("tpocmb", factura.tpocmb);
    setValue("id_cpc", factura.id_cpc);
    setValue("id_ped", factura.id_ped);
    setValue("factura", factura.num_doc);
    setValue("pedido", factura.nro_ped);

    const nuevosDetalles: IGuiaremisionDetalleFormState[] =
      factura.detalles.map((det, index) => ({
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
        factor: Number(det.factor),
        id_art: det.id_art,
        id_cpc: factura.id_cpc,
        id_ped: factura.id_ped ?? null,
        id_umedr: det.id_umedr,
        igv_art: Number(det.igv_art),
        itmcpc: det.nroitm,
        itmped: null,
        nrocpc: factura.num_doc,
        nroitm: index + 1,
        nroped: null,
        operador: det.operador,
        pdes_art: Number(det.pdes_art),
        pre_art: Number(det.pre_art),
        pu_conigv: Number(det.pu_conigv),
        pu_des: Number(det.pu_des),
        pu_sinigv: Number(det.pu_sinigv),
        subtot_art: Number(det.subtot_art),
        tot_art: Number(det.tot_art),
      }));
    setDetalles(nuevosDetalles);
    toast.success("Factura agregada correctamente", { autoClose: 1600 });
  };

  function esPedido(item: IDocumentoPorCliente): item is IPedidoPorCliente {
    return item.id_ped !== undefined && item.id_ped !== null;
  }

  function esFactura(item: IDocumentoPorCliente): item is IFacturaPorCliente {
    return item.id_cpc !== undefined && item.id_cpc !== null;
  }

  const handleCommitDatosModulo = (element: IDocumentoPorCliente) => {
    const moduloActual = tipoModulo[codmov];

    if (moduloActual === "pedidos" && esPedido(element)) {
      handleCommitPedido(element);
    } else if (moduloActual === "facturas" && esFactura(element)) {
      handleCommitFactura(element);
    }
  };

  const handleCommitUbigeo = (ubigeo: string) => {
    if (ubigeoActual === "ubigeo1") {
      setValue("ubigeo1", ubigeo);
    } else if (ubigeoActual === "ubigeo2") {
      setValue("ubigeo2", ubigeo);
    }
  };

  const handleAnularRemision = () => {
    if (!id_remision) return;
    anularMutation.mutate({ idRemision: id_remision });
  };

  /*
   *=========================
   * SYNC / SINCRONIZACIÓN / Effects
   *=========================
   */

  useEffect(() => {
    if (!codalm) return;
    setValue("almori", codalm);
  }, [codalm, setValue]);

  useEffect(() => {
    if (codmov !== "03" || !direccionAlmacenDestino || !isAdd) return;
    setValue("dirent", direccionAlmacenDestino);
  }, [codmov, direccionAlmacenDestino, setValue, isAdd]);

  useEffect(() => {
    if (isLoadingTipoCambio || !tipoCambioHoy) return;

    setValue("tpocmb", Number(tipoCambioHoy.ofivta));
  }, [tipoCambioHoy, isLoadingTipoCambio, setValue]);

  useEffect(() => {
    if (!isAdd) return;
    if (!session) return;
    setValue("usuario", Number(session?.user.id_usu));
  }, [isAdd, setValue, session]);

  // Autocompletando la dirección de inicio con la del almacén
  useEffect(() => {
    if (!isAdd || !direccionAlmacen) return;
    setValue("ptopartida", direccionAlmacen);
  }, [isAdd, direccionAlmacen, setValue]);

  /*
   *=========================
   * SUBMIT Y AUTOCOMPLETADO
   *=========================
   */
  // loadinitialdata
  useEffect(() => {
    if (!remision) return;
    reset({
      ...defaultValues(),
      ...remision.cabecera,
    });
  }, [remision, reset]);

  const onSubmit = async (data: IGuiaRemisionCabecera) => {
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
      const createdId = res.id_remision;
      if (createdId) {
        router.push(
          `/movimientos/guia-remision/${createdId}?${searchParams.toString()}`,
        );
      } else {
        router.push(`${backToListUrl}`);
      }
    }
  };

  const onError = () => {
    //data: IGuiaRemisionCabeceraFormstate
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
        modulo={tipoModulo[codmov]}
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

      <DialogAddUbigeo
        open={openUbigeo}
        setOpen={setOpenUbigeo}
        ubigeoValue={ubigeoSeleccionada} // RHF con el valor a mostrar
        onConfirm={handleCommitUbigeo}
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
          isRemision={true}
        />
      )}

      <FormProvider {...methods}>
        <Formulario
          title={
            isAdd ? "Nueva Guía de Remisión" : "Consultar Guía de Remisión"
          }
          mostrarTotal={false}
          showAnular={showAnular}
          showSubmit={isAdd}
          onCancel={() => router.push(backToListUrl)}
          isSubmitting={isPending}
          onSave={handleSubmit(onSubmit, onError)}
          onAnular={handleAnularRemision}
          data={remision?.cabecera || undefined}
        >
          <div className="grid grid-cols-12 gap-x-1.5 gap-y-1.5 w-full">
            {/* Primera fila */}
            <div className="col-span-12 grid grid-cols-12 gap-x-2">
              {/* Serie */}
              <div className="col-span-6 md:col-span-1">
                <Label htmlFor="serie">Serie</Label>
                <Input id="serie" {...register("serie")} disabled={!isAdd} />
              </div>

              {/* Número */}
              <div className="col-span-6 md:col-span-2 lg:col-span-1">
                <Label htmlFor="numero">Número</Label>
                <Input id="numero" {...register("numero")} disabled />
              </div>

              {/* Motivo */}
              <div className="col-span-12 md:col-span-3">
                <Label htmlFor="codmov">
                  Motivo <span className="text-red-500">*</span>
                </Label>
                <Controller
                  name="codmov"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      value={field.value?.toString() ?? ""}
                      onValueChange={(value) => {
                        if (!value) return;
                        setValue("codmov", value);
                      }}
                      disabled={!isAdd}
                    >
                      <SelectTrigger id="codmov" className="min-w-0">
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {motivos.map((motivo) => (
                          <SelectItem key={motivo.codmov} value={motivo.codmov}>
                            {motivo.desmov}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Almacén origen */}
              <div className="col-span-12 md:col-span-2">
                <Label htmlFor="codalm">
                  {isTransferencia ? "Alm. origen" : "Almacén"}
                </Label>
                <Controller
                  name="codalm"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      value={field.value ?? ""}
                      disabled={!isAdd}
                      onValueChange={(value) => {
                        if (!value) return;

                        setValue("codalm", value);
                      }}
                    >
                      <SelectTrigger
                        id="codalm"
                        className="min-w-0 data-[placeholder]:!normal-case"
                      >
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataAlmacen.map((almacen) => (
                          <SelectItem
                            key={almacen.aliasalm}
                            value={String(almacen.codalm)}
                          >
                            {almacen.desalm}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Almacén destino */}
              {isTransferencia && (
                <div className="col-span-12 md:col-span-2">
                  <Label htmlFor="almdes">Alm. destino</Label>
                  <Controller
                    name="almdes"
                    control={control}
                    render={({ field }) => (
                      <Select
                        name={field.name}
                        value={field.value ?? ""}
                        disabled={!isAdd}
                        onValueChange={(value) => {
                          if (!value) return;

                          setValue("almdes", value);
                        }}
                      >
                        <SelectTrigger
                          id="almdes"
                          className="min-w-0 data-[placeholder]:!normal-case"
                        >
                          <SelectValue placeholder="Seleccione" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataAlmacen
                            .filter((almacen) => almacen.aliasalm !== codalm)
                            .map((almacen) => (
                              <SelectItem
                                key={almacen.codalm}
                                value={String(almacen.codalm)}
                              >
                                {almacen.desalm}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              {/* Fecha */}
              <div className="col-span-12 md:col-span-2">
                <Label htmlFor="fchdoc">Fecha</Label>
                <Input
                  id="fchdoc"
                  type="date"
                  {...register("fchdoc")}
                  disabled={!isAdd}
                />
              </div>
            </div>

            {/* Segunda fila */}
            {!isTransferencia && (
              <div className="col-span-12 grid grid-cols-12 gap-x-2">
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
                    {codmov === "02" ? "Facturas" : "Pedidos"}
                  </Button>
                </div>
              </div>
            )}

            {/* Punto de partida */}
            <div className="col-span-12 grid grid-cols-12 gap-x-2">
              <div className="col-span-12 md:col-span-8 lg:col-span-9 ">
                <Label htmlFor="ptopartida">
                  Punto de partida <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ptopartida"
                  {...register("ptopartida")}
                  disabled={!isAdd}
                />
              </div>

              <div className="col-span-6 md:col-span-3 lg:col-span-2 ">
                <Label htmlFor="ubigeo1">
                  Ubigeo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="ubigeo1"
                    {...register("ubigeo1")}
                    disabled
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    className="absolute right-0 top-0 h-full px-2.5 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-r-md"
                    onClick={() => {
                      setOpenUbigeo(true);
                      setUbigeoActual("ubigeo1");
                    }}
                    disabled={!isAdd}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="col-span-6 md:col-span-1">
                <Label htmlFor="peso">
                  Peso <span className="text-red-500">*</span>
                </Label>
                <InputNumber
                  id="peso"
                  {...register("peso", { valueAsNumber: true })}
                  disabled={!isAdd}
                />
              </div>
            </div>

            {/* Punto de llegada */}
            <div className="col-span-12 grid grid-cols-12 gap-x-2">
              <div className="col-span-12 md:col-span-8 lg:col-span-9 ">
                <Label htmlFor="dirent">
                  Punto de llegada <span className="text-red-500">*</span>
                </Label>
                <Input id="dirent" {...register("dirent")} disabled={!isAdd} />
              </div>

              <div className="col-span-6 md:col-span-3 lg:col-span-2 ">
                <Label htmlFor="ubigeo2">
                  Ubigeo <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="ubigeo2"
                    {...register("ubigeo2")}
                    disabled
                    className="pr-9"
                  />
                  <Button
                    type="button"
                    className="absolute right-0 top-0 h-full px-2.5 flex items-center justify-center bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 rounded-r-md"
                    onClick={() => {
                      setOpenUbigeo(true);
                      setUbigeoActual("ubigeo2");
                    }}
                    disabled={!isAdd}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="col-span-6 md:col-span-1">
                <Label htmlFor="bultos">
                  Bultos <span className="text-red-500">*</span>
                </Label>
                <InputNumber
                  id="bultos"
                  {...register("bultos", { valueAsNumber: true })}
                  disabled={!isAdd}
                />
              </div>
            </div>

            {/* Transportista */}
            <div className="col-span-12 grid grid-cols-12 gap-x-2">
              <div className="col-span-6 md:col-span-3">
                <Label htmlFor="id_transp">Transportista</Label>
                <Controller
                  name="id_transp"
                  control={control}
                  render={({ field }) => (
                    <Select
                      name={field.name}
                      value={field.value?.toString() ?? ""}
                      disabled={!isAdd}
                      onValueChange={(value) => {
                        const num = parseInt(value, 10);
                        if (!Number.isFinite(num)) return;

                        setValue("id_transp", num);
                      }}
                    >
                      <SelectTrigger
                        id="id_transp"
                        className="min-w-0 data-[placeholder]:!normal-case"
                      >
                        <SelectValue placeholder="Seleccione" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataTransportista?.map((transportista) => (
                          <SelectItem
                            key={transportista.id_chof}
                            value={transportista.id_chof.toString()}
                          >
                            {transportista.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="col-span-6 md:col-span-2">
                <Label htmlFor="fchtras">Fch/Tr.</Label>
                <Input
                  id="fchtras"
                  type="date"
                  {...register("fchtras")}
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

              <div className="col-span-12 md:col-span-4">
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
