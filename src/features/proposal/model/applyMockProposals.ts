import {
  careMeta,
  careValue,
  emptyCareFields,
} from "@/features/careitem/model/careItemFields";
import type { CareItemView } from "@/features/careitem/model/careItemViewTypes";
import type { ProposalActor, ProposalView } from "./proposalViewTypes";

export function applyMockProposals(
  items: readonly CareItemView[],
  proposals: readonly ProposalView[],
  actor: ProposalActor,
  createdAt: number,
): CareItemView[] {
  const next = [...items];
  for (const proposal of proposals) {
    const index = next.findIndex((item) => item.id === proposal.targetId);
    const previous = next[index];
    const fields =
      proposal.operation === "link" && previous
        ? previous.fields
        : (proposal.afterFields ?? {
            ...emptyCareFields,
            title: proposal.title,
            content: proposal.afterValue,
          });
    const item: CareItemView = {
      id: proposal.targetId,
      kind: proposal.kind,
      title: fields.title || fields.content,
      value: careValue(proposal.kind, fields),
      meta: careMeta(proposal.kind, fields),
      fields: { ...fields },
      version: (previous?.version ?? 0) + 1,
      evidence: [
        ...(previous?.evidence ?? []),
        {
          id: `evidence-${proposal.id}`,
          recordId: proposal.recordId,
          author: actor.name,
          createdAt,
          fields: {
            ...(proposal.operation === "link"
              ? (proposal.afterFields ?? fields)
              : fields),
          },
          dependsOnRecordIds:
            proposal.operation === "link"
              ? []
              : [
                  ...new Set(
                    (previous?.evidence ?? [])
                      .flatMap((evidence) => [
                        evidence.recordId,
                        ...(evidence.dependsOnRecordIds ?? []),
                      ])
                      .filter((id): id is string => Boolean(id)),
                  ),
                ],
        },
      ],
    };
    if (index < 0) next.push(item);
    else next[index] = item;
  }
  return next;
}
