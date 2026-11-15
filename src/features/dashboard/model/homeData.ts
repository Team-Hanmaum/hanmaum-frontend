import type {
  SpaceDetail,
  SpaceMember,
} from "@/features/carespace/api/spaceDetailTypes";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import type { RecordListResponse } from "@/features/record/api/recordReadTypes";
import type { DashboardResponse, DashboardItem } from "../api/dashboardTypes";
import type { HomeView } from "./homeViewTypes";
import { homePreviewLimits as limits } from "./homePreviewLimits";
import { scheduleDayOffset } from "@/features/careitem/model/scheduleDayOffset";

const formattedTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
const textField = (item: DashboardItem, key: string, fallback: string) =>
  typeof item.fields[key] === "string" && item.fields[key]
    ? (item.fields[key] as string)
    : fallback;
const title = (item: DashboardItem) =>
  item.title?.trim() || "제목 없는 돌봄 항목";

export function toSpaceView(
  space: SpaceDetail,
  members: SpaceMember[],
): CareSpaceView {
  return {
    id: space.spaceId,
    subjectLabel: space.subjectLabel,
    role: space.role === "OWNER" ? "owner" : "member",
    empty: false,
    members: members.map((member) => ({
      id: member.membershipId,
      name: member.displayName?.trim() || (member.isMe ? "나" : "이름 미설정"),
      profileImageUrl: member.profileImageUrl,
      role: member.role === "OWNER" ? "owner" : "member",
      self: member.isMe,
    })),
  };
}
export function toHomeView(
  data: DashboardResponse,
  records: RecordListResponse,
): HomeView {
  const now = new Date();
  return {
    // The dashboard contract does not include combined proposal/request counts.
    totalCounts: {
      recentNews: records.hasNext ? undefined : records.items.length,
      upcomingSchedules: data.upcomingSchedules.totalCount,
      tasks: data.remainingTasks.totalCount,
      questions: data.unconfirmedQuestions.totalCount,
      recentChanges: data.recentChanges.totalCount,
    },
    recentNews: records.items.slice(0, limits.recentNews).map((record) => {
      const { withdrawn, displayName, profileImageUrl } = record.author;
      const name = withdrawn ? undefined : displayName?.trim();
      return {
        id: record.recordId,
        author: {
          name: withdrawn ? "탈퇴한 사용자" : name || "이름 미설정",
          initial: name ? undefined : "?",
          isMine: record.isMine && !withdrawn,
          profileImageUrl: withdrawn ? null : (profileImageUrl ?? null),
        },
        recordedAtLabel: formattedTime(record.recordedAt),
        body: record.content,
      };
    }),
    upcomingSchedules: data.upcomingSchedules.items
      .slice(0, limits.upcomingSchedules)
      .map((item) => {
        const date = textField(item, "scheduledDate", "날짜 미정");
        return {
          id: item.itemId,
          title: title(item),
          statusLabel: item.needsReconfirmation
            ? "재확인 필요"
            : item.needsConflictReview
              ? "내용 확인 필요"
              : undefined,
          daysUntil: scheduleDayOffset(date, now),
          meta: `${date} · ${textField(item, "scheduledTime", "시간 미정")}`,
          body: textField(item, "location", "장소 미정"),
        };
      }),
    tasks: data.remainingTasks.items.slice(0, limits.tasks).map((item) => ({
      id: item.itemId,
      title: title(item),
      description: `${item.assigneeDisplayName?.trim() || "담당자 미지정"} · ${textField(item, "dueDate", "기한 미정")}`,
    })),
    questions: data.unconfirmedQuestions.items
      .slice(0, limits.questions)
      .map((item) => ({
        id: item.itemId,
        title: title(item),
        description: "아직 확인되지 않은 질문이에요.",
      })),
    recentChanges: data.recentChanges.items
      .slice(0, limits.recentChanges)
      .map((change) => ({
        id: `${change.itemId}:${change.version}`,
        title: change.title?.trim() || "돌봄 정보 변경",
        description: `${change.changedByDisplayName?.trim() || "이름 미설정"} · ${formattedTime(change.changedAt)}`,
      })),
  };
}
export function isEmptyHome(
  data: DashboardResponse,
  records: RecordListResponse,
) {
  return (
    data.upcomingSchedules.totalCount === 0 &&
    data.pastScheduleCount === 0 &&
    data.remainingTasks.totalCount === 0 &&
    data.unconfirmedQuestions.totalCount === 0 &&
    data.recentChanges.totalCount === 0 &&
    records.items.length === 0 &&
    !records.hasNext
  );
}
