import {
  careValue,
  describeCareFields,
  emptyCareFields,
} from "@/features/careitem/model/careItemFields";
import type {
  CareItemFields,
  CareItemView,
} from "@/features/careitem/model/careItemViewTypes";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { ProposalView } from "./proposalViewTypes";
import { isConfirmedQuestion } from "@/features/careitem/model/careItemStatus";

export function isConfirmedQuestionChange(
  proposal: ProposalView,
  target: CareItemView | undefined,
): boolean {
  // 근거 연결은 기존 질문과 답변을 바꾸지 않는다.
  return proposal.operation !== "link" && isConfirmedQuestion(target);
}

export function proposalFields(proposal: ProposalView): CareItemFields {
  return (
    proposal.afterFields ?? {
      ...emptyCareFields,
      title: proposal.title,
      content: proposal.afterValue,
    }
  );
}
export function reviseProposal(
  proposal: ProposalView,
  fields: CareItemFields,
  space: CareSpaceView,
): ProposalView {
  return {
    ...proposal,
    afterFields: { ...fields },
    title: fields.title || fields.content,
    afterValue: careValue(proposal.kind, fields),
    context: describeCareFields(proposal.kind, fields, space.members),
    revision: (proposal.revision ?? 0) + 1,
    edited: true,
  };
}
export function retargetProposal(
  proposal: ProposalView,
  target: CareItemView,
  space: CareSpaceView,
): ProposalView {
  const fields = { ...target.fields };
  const proposed = proposalFields(proposal);
  // 제안에 없는 날짜·담당자 등은 새 대상의 현재 값을 유지한다.
  for (const key of Object.keys(fields) as (keyof CareItemFields)[])
    if (
      proposal.operation !== "link" &&
      proposed[key] !== proposal.beforeFields?.[key]
    )
      fields[key] = proposed[key];
  return {
    ...reviseProposal(proposal, fields, space),
    targetId: target.id,
    targetVersion: target.version,
    beforeFields: { ...target.fields },
    beforeValue: target.value,
    edited: proposal.edited,
  };
}
