import type { CareListResponse } from "@/features/careitem/api/careReadTypes";

export function unfinishedFamilyTasks(
  data: CareListResponse,
  membershipId: string,
) {
  const items = [...data.items, ...data.reconfirmationItems];
  return items.filter(
    (item, index) =>
      items.findIndex((entry) => entry.itemId === item.itemId) === index &&
      item.itemType === "TASK" &&
      (item.status === "NOT_STARTED" || item.status === "IN_PROGRESS") &&
      item.fields?.assigneeMembershipId === membershipId,
  );
}
