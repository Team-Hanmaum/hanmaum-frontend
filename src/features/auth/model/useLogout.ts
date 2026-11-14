import { useMutation } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { useSession } from "./useSession";

export function useLogout() {
  const session = useSession();

  return useMutation<void, ApiError, void>({
    mutationKey: ["auth", "logout"],
    mutationFn: () => {
      return session.signOut();
    },
  });
}
