import useSWR from "swr";
import api from "@/lib/axios";
import type { Attributes } from "@/types/models";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useAttributes() {
  const { data, error, isLoading, mutate } = useSWR<Attributes[]>(
    "/attributes",
    fetcher,
  );
  return { data, error, isLoading, mutate };
}
