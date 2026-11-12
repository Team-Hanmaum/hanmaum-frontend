import { useExampleReview as useExample } from "@/routes/useExampleReview";
import { ProposalListPage as ExampleListPage } from "./ProposalListPage";
import { ConnectedProposalListPage } from "./ConnectedProposalListPage";
import { ProposalReviewPage as ExampleReviewPage } from "./ProposalReviewPage";
import { ConnectedProposalReviewPage } from "./ConnectedProposalReviewPage";
import { ProposalEvidencePage as ExampleEvidencePage } from "./ProposalEvidencePage";
import { ConnectedProposalEvidencePage } from "./ConnectedProposalEvidencePage";
import { ProposalEditPage as ExampleEditPage } from "./ProposalEditPage";
import { ConnectedProposalEditPage } from "./ConnectedProposalEditPage";
import { ProposalTargetPage as ExampleTargetPage } from "./ProposalTargetPage";
import { ConnectedProposalTargetPage } from "./ConnectedProposalTargetPage";
import { ProposalConfirmPage as ExampleConfirmPage } from "./ProposalConfirmPage";
import { ConnectedProposalConfirmPage } from "./ConnectedProposalConfirmPage";
import { ProposalResultPage as ExampleResultPage } from "./ProposalResultPage";
import { ConnectedProposalResultPage } from "./ConnectedProposalResultPage";
import { ProposalRequestPage as ExampleRequestPage } from "./ProposalRequestPage";
import { ConnectedProposalRequestPage } from "./ConnectedProposalRequestPage";
export function ProposalListRoute() {
  return useExample() ? <ExampleListPage /> : <ConnectedProposalListPage />;
}
export function ProposalReviewRoute() {
  return useExample() ? <ExampleReviewPage /> : <ConnectedProposalReviewPage />;
}
export function ProposalEvidenceRoute() {
  return useExample() ? (
    <ExampleEvidencePage />
  ) : (
    <ConnectedProposalEvidencePage />
  );
}
export function ProposalEditRoute() {
  return useExample() ? <ExampleEditPage /> : <ConnectedProposalEditPage />;
}
export function ProposalTargetRoute() {
  return useExample() ? <ExampleTargetPage /> : <ConnectedProposalTargetPage />;
}
export function ProposalConfirmRoute() {
  return useExample() ? (
    <ExampleConfirmPage />
  ) : (
    <ConnectedProposalConfirmPage />
  );
}
export function ProposalResultRoute() {
  return useExample() ? <ExampleResultPage /> : <ConnectedProposalResultPage />;
}
export function ProposalRequestRoute() {
  return useExample() ? (
    <ExampleRequestPage />
  ) : (
    <ConnectedProposalRequestPage />
  );
}
