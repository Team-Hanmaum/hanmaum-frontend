import { useExampleReview } from "@/routes/useExampleReview";
import { CareChangePage } from "./CareChangePage";
import { ConnectedCareCreatePage } from "./ConnectedCareCreatePage";
import { ConnectedCareEditPage } from "./ConnectedCareEditPage";
import { ConnectedCareManagePage } from "../ConnectedCareManagePage";
import { CareManagePage } from "../CareManagePage";

export function CareCreateRoute() {
  return useExampleReview() ? <CareChangePage /> : <ConnectedCareCreatePage />;
}
export function CareEditRoute() {
  return useExampleReview() ? <CareChangePage /> : <ConnectedCareEditPage />;
}
export function CareManageRoute() {
  return useExampleReview() ? <CareManagePage /> : <ConnectedCareManagePage />;
}
