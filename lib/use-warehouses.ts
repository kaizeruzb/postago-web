import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface WarehouseItem {
  id: string;
  country: string;
  city: string;
  address: string;
}

export function useWarehouses() {
  const { data, isLoading } = useQuery({
    queryKey: ["warehouses-public"],
    queryFn: () => api<{ warehouses: WarehouseItem[] }>("/api/tariffs/warehouses"),
    staleTime: 5 * 60 * 1000,
  });
  return { warehouses: data?.warehouses || [], isLoading };
}
