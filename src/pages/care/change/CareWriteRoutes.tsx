import { useExampleReview } from "@/routes/useExampleReview";
import { CareChangePage } from "./CareChangePage";
import { ConnectedCareCreatePage } from "./ConnectedCareCreatePage";

export function CareCreateRoute() {
  return useExampleReview() ? <CareChangePage /> : <ConnectedCareCreatePage />;
}
