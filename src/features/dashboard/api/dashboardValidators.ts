import {
  isObject,
  isNullableString,
  isCount,
  isTimestamp,
} from "@/lib/api/responseValidators";
import type {
  DashboardItem,
  DashboardItemSection,
  DashboardChange,
  DashboardResponse,
} from "./dashboardTypes";

function isItem(value: unknown): value is DashboardItem {
  return (
    isObject(value) &&
    typeof value.itemId === "string" &&
    typeof value.itemType === "string" &&
    typeof value.version === "string" &&
    isNullableString(value.title) &&
    isNullableString(value.status) &&
    typeof value.needsReconfirmation === "boolean" &&
    typeof value.needsConflictReview === "boolean" &&
    isObject(value.fields) &&
    isNullableString(value.assigneeDisplayName)
  );
}
function isSection(value: unknown): value is DashboardItemSection {
  return (
    isObject(value) &&
    isCount(value.totalCount) &&
    Array.isArray(value.items) &&
    value.items.every(isItem) &&
    value.items.length <= value.totalCount
  );
}
function isChange(value: unknown): value is DashboardChange {
  return (
    isObject(value) &&
    [
      "itemId",
      "itemType",
      "version",
      "changeKind",
      "changedByMembershipId",
    ].every((key) => typeof value[key] === "string") &&
    isTimestamp(value.changedAt) &&
    isNullableString(value.changedByDisplayName) &&
    isNullableString(value.title)
  );
}
export function isDashboard(value: unknown): value is DashboardResponse {
  return (
    isObject(value) &&
    typeof value.spaceId === "string" &&
    isTimestamp(value.asOf) &&
    isCount(value.pastScheduleCount) &&
    isSection(value.upcomingSchedules) &&
    isSection(value.remainingTasks) &&
    isSection(value.unconfirmedQuestions) &&
    isObject(value.recentChanges) &&
    isCount(value.recentChanges.totalCount) &&
    Array.isArray(value.recentChanges.items) &&
    value.recentChanges.items.every(isChange) &&
    value.recentChanges.items.length <= value.recentChanges.totalCount
  );
}
