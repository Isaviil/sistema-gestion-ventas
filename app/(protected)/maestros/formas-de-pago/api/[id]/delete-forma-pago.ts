import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";

interface DeletePaymentMethodResponse {
  message: string;
}

const deletePaymentMethod = async (
  id: number,
): Promise<DeletePaymentMethodResponse> => {
  const { data: response } = await axios.delete<DeletePaymentMethodResponse>(
    `/formas-de-pago/${id}`,
  );

  return response;
};

export const useDeleteFormaPago = () => {
  return useMutation({
    mutationFn: (id: number) => deletePaymentMethod(id),
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
