import { useQuery } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { getMe } from "../api/userApi";
import type { MyProfile } from "../api/userTypes";
import { userKeys } from "./userKeys";

export function useMe({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery<MyProfile, ApiError>({
    queryKey: userKeys.me(),
    enabled,
    queryFn: ({ signal }) => {
      return getMe(signal);
    },
  });
}
