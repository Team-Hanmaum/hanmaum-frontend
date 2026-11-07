import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
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
      if (isMockPreviewEnabled) {
        throw new ApiError({
          kind: "configuration",
          message: "Mock 미리보기에서는 실제 공간을 만들지 않습니다.",
        });
      }
      return createCareSpace(request);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: careSpaceKeys.list() }),
  });
}
