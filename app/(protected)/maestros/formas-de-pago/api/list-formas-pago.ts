import { axios } from "@/app/lib/axios";
import { PaymentMethodResponse } from "../types";
import { useQuery } from "@tanstack/react-query";

export const getPaymentMethods = async (): Promise<PaymentMethodResponse[]> => {
  const { data } = await axios.get<PaymentMethodResponse[]>("/formas-de-pago");

  return data;
};

export const usePaymentMethods = () => {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: getPaymentMethods,
    enabled: true,
    retry: 1,
    refetchOnWindowFocus: true,
  });
};
