import { queryClient } from "@/app/lib/react-query";
import { CreateProductRequest, ProductResponse } from "../../types";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

interface UpdateProductResponse {
  message: string;
  product: ProductResponse;
}

interface ErrorResponse {
  message: string;
}

export const updateProduct = async (
  id: number,
  data: CreateProductRequest,
): Promise<UpdateProductResponse> => {
  const { data: response } = await axios.put<UpdateProductResponse>(
    `/articulos/${id}`,
    data,
  );

  return response;
};

export const useUpdateProduct = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateProductRequest }) =>
      updateProduct(id, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(
        error.response?.data?.message ?? "Error al actualizar el artículo",
      );
    },
  });
};
