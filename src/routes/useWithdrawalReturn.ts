import { useNavigate, useSearchParams } from "react-router";
import { paths } from "./paths";

// 임의의 return URL 대신 정해진 탈퇴 절차만 허용한다.
export function useWithdrawalReturn() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const withdrawing = params.get("returnTo") === "withdrawal";
  return {
    withdrawing,
    withReturn: (path: string) =>
      withdrawing
        ? `${path}${path.includes("?") ? "&" : "?"}returnTo=withdrawal`
        : path,
    returnToWithdrawal: () =>
      void navigate(paths.withdrawal, { replace: true }),
  };
}
