import { readApiData } from "@/lib/api/responseData";
import type { ProposalDetail, ProposalStatus } from "./proposalReadTypes";
import { isProposalPage, isProposalDetail } from "./proposalReadValidators";
const base = (spaceId: string) =>
  `/api/spaces/${encodeURIComponent(spaceId)}/proposals` as const;
export function getProposals(
  spaceId: string,
  status: ProposalStatus,
  recordId?: string,
  cursor?: string | null,
  signal?: AbortSignal,
) {
  return readApiData(base(spaceId), isProposalPage, {
    params: {
      status,
      size: 20,
      ...(recordId && { recordId }),
      ...(cursor && { cursor }),
    },
    signal,
  });
}
export function getProposal(
  spaceId: string,
  proposalId: string,
  signal?: AbortSignal,
) {
  return readApiData(
    `${base(spaceId)}/${encodeURIComponent(proposalId)}`,
    (v): v is ProposalDetail =>
      isProposalDetail(v) &&
      v.spaceId === spaceId &&
      v.proposalId === proposalId,
    { signal },
  );
}
