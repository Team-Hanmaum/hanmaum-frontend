import { useParams } from "react-router";
import { CareItemPage } from "./CareItemPage";
import { CareSourcesPage } from "./CareSourcesPage";
import { CareHistoryPage } from "./CareHistoryPage";
import { ConnectedCareItemPage } from "./ConnectedCareItemPage";
import { ConnectedCareSourcesPage } from "./ConnectedCareSourcesPage";
import { ConnectedCareHistoryPage } from "./ConnectedCareHistoryPage";
export function CareItemRoute() {
  return useParams().itemId?.startsWith("mock-") ? (
    <CareItemPage />
  ) : (
    <ConnectedCareItemPage />
  );
}
export function CareSourcesRoute() {
  return useParams().itemId?.startsWith("mock-") ? (
    <CareSourcesPage />
  ) : (
    <ConnectedCareSourcesPage />
  );
}
export function CareHistoryRoute() {
  return useParams().itemId?.startsWith("mock-") ? (
    <CareHistoryPage />
  ) : (
    <ConnectedCareHistoryPage />
  );
}
