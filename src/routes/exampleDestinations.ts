import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import { mockProposals } from "@/features/proposal/model/mockProposals";
import { mockRecords } from "@/features/record/model/mockRecords";
import {
  careItemPath,
  careHistoryPath,
  newsDetailPath,
  spacePath,
} from "./paths";

// Connected home cards remain real. Their explicitly labelled example actions
// open separate sample items until each detail API is connected.
export function exampleNewsPath(spaceId: string) {
  const space = mockCareSpaces
    .getSnapshot()
    .spaces.find((entry) => entry.id === spaceId);
  const records = space ? mockRecords.getForSpace(space) : [];
  const record =
    records.find((entry) => entry.id === "mock-record-1") ?? records[0];
  return record
    ? newsDetailPath(spaceId, record.id)
    : spacePath(spaceId, "news");
}
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
