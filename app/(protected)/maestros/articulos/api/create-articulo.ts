import { queryClient } from "@/app/lib/react-query";
import { useMutation } from "@tanstack/react-query";
import { axios } from "@/app/lib/axios";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { CreateProductRequest, ProductResponse } from "../types";

export interface CreateProductResponse {
  message: string;
  data: ProductResponse;
}

export const createProduct = async (
  data: CreateProductRequest,
): Promise<CreateProductResponse> => {
  const { data: response } = await axios.post<CreateProductResponse>(
    "/articulos",
    data,
  );

  return response;
};

export const useCreateProduct = () => {
  return useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ["products"],
      });

      toast.success(data.message, {
        autoClose: 1600,
      });
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(
        error.response?.data?.message ?? "Error al crear el artículo",
      );
    },
  });
};
