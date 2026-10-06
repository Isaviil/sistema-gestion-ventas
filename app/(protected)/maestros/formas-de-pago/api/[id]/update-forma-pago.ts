import { queryClient } from "@/app/lib/react-query";
import { CreatePaymentMethodRequest, PaymentMethodResponse } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";

interface UpdatePaymentMethodResponse {
  message: string;
  data: PaymentMethodResponse;
}

export const updatePaymentMethod = async (
  id: number,
  data: CreatePaymentMethodRequest,
): Promise<UpdatePaymentMethodResponse> => {
  const { data: response } = await axios.put<UpdatePaymentMethodResponse>(
    `/formas-de-pago/${id}`,
    data,
  );

  return response;
};

export const useUpdateFormaPago = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: CreatePaymentMethodRequest;
    }) => updatePaymentMethod(id, data),
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
