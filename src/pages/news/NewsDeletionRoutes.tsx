import { useExampleReview } from "@/routes/useExampleReview";
import { NewsDeletePage, NewsDeletionResultPage } from "./NewsDeletePage";
import { ConnectedNewsDeletePage } from "./ConnectedNewsDeletePage";
import { ConnectedNewsDeletionResultPage } from "./ConnectedNewsDeletionResultPage";
export function NewsDeleteRoute() {
  return useExampleReview() ? <NewsDeletePage /> : <ConnectedNewsDeletePage />;
}
export function NewsDeletionResultRoute() {
  return useExampleReview() ? (
    <NewsDeletionResultPage />
  ) : (
    <ConnectedNewsDeletionResultPage />
  );
}
