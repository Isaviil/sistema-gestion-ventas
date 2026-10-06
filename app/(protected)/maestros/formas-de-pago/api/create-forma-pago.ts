import { axios } from "@/app/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { CreatePaymentMethodRequest, PaymentMethodResponse } from "../types";
import { queryClient } from "@/app/lib/react-query";

export interface CreatePaymentMethodResponse {
  message: string;
  data: PaymentMethodResponse;
}

export const createPaymentMethod = async (
  data: CreatePaymentMethodRequest,
): Promise<CreatePaymentMethodResponse> => {
  const { data: response } = await axios.post<CreatePaymentMethodResponse>(
    "/formas-de-pago",
    data,
  );

  return response;
};

export const useCreateFormaPago = () => {
  return useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["payment-methods"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
  });
};
