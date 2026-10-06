import { QueryClient, DefaultOptions } from "@tanstack/react-query";

const queryConfig: DefaultOptions = {
  queries: {
    // useErrorBoundary: true, // Removed as it is not a valid property
    refetchOnWindowFocus: false,
    retry: false,
  },
};

export const queryClient = new QueryClient({ defaultOptions: queryConfig });
