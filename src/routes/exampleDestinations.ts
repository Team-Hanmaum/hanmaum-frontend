import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import { careItemPath, careHistoryPath, spacePath } from "./paths";

// Connected home cards remain real. Their explicitly labelled example actions
// open separate sample items until each detail API is connected.
export function exampleCarePath(
  spaceId: string,
  kind = "schedule",
  history = false,
) {
  const space = mockCareSpaces
    .getSnapshot()
    .spaces.find((entry) => entry.id === spaceId);
  const items = space ? mockProposals.getForSpace(space).items : [];
  const item = items.find((entry) => entry.kind === kind && !entry.deletedAt);
  return item
    ? history
      ? careHistoryPath(spaceId, item.id)
      : careItemPath(spaceId, item.id)
    : spacePath(spaceId, "care");
}
