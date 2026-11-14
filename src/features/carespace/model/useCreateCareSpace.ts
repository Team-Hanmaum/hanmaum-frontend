import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { createCareSpace } from "../api/careSpaceApi";
import type {
  CreateCareSpaceRequest,
  CreatedCareSpace,
} from "../api/careSpaceTypes";
import { careSpaceKeys } from "./careSpaceKeys";

export function useCreateCareSpace() {
  const queryClient = useQueryClient();

  return useMutation<CreatedCareSpace, ApiError, CreateCareSpaceRequest>({
    mutationKey: [...careSpaceKeys.all, "create"],
    mutationFn: (request) => {
      return createCareSpace(request);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: careSpaceKeys.list() }),
  });
}
