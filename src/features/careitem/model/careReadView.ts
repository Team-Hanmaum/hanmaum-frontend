import { isObject } from "@/lib/api/responseValidators";
import type { CareValues, ItemType, SourceAuthor } from "../api/careReadTypes";
export const itemLabels: Record<ItemType, string> = {
  SCHEDULE: "일정",
  TASK: "할 일",
  QUESTION: "질문",
  OBSERVATION: "관찰",
  GUIDANCE: "안내",
};
export const fieldLabels: Record<string, string> = {
  itemType: "항목 종류",
  title: "제목",
  description: "내용",
  scheduledDate: "날짜",
  scheduledTime: "시간",
  location: "장소",
  dueDate: "기한",
  assigneeMembershipId: "담당자",
  status: "상태",
  confirmedAnswer: "확정 답변",
  answerText: "답변",
  answer: "답변",
  basis: "어떻게 확인했나요?",
  observedDate: "관찰 날짜",
  observedTimeText: "관찰 시각",
  sourceName: "안내 출처",
  receivedDate: "안내 날짜",
};
const statuses: Record<string, string> = {
  SCHEDULED: "예정",
  COMPLETED: "완료",
  CANCELED: "취소",
  CANCELLED: "취소",
  NOT_STARTED: "미시작",
  TODO: "미시작",
  PENDING: "미시작",
  IN_PROGRESS: "진행 중",
  UNCONFIRMED: "미확인",
  CONFIRMED: "확인됨",
  RECORDED: "기록됨",
};
export const authorName = (author: SourceAuthor) =>
  author.withdrawn
    ? "탈퇴한 사용자"
    : author.displayName?.trim() || "이름 미설정";
export const formatServerTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
export function flattenCareValues(values: CareValues | null): CareValues {
  if (!values) return {};
  const { fields, ...flat } = values;
  return { ...flat, ...(isObject(fields) ? fields : {}) };
}
export function displayCareValue(
  key: string,
  value: unknown,
  members: readonly { membershipId: string; displayName: string | null }[] = [],
) {
  if (key === "assigneeMembershipId")
    return typeof value === "string" && value
      ? members.find((m) => m.membershipId === value)?.displayName ||
          "참여 정보 확인 필요"
      : "미지정";
  if (value === null || value === undefined || value === "") return "미정";
  if (typeof value !== "string") return "표시할 수 없는 값";
  if (key === "itemType" && Object.hasOwn(itemLabels, value))
    return itemLabels[value as ItemType];
  return key === "status" ? (statuses[value] ?? value) : value;
}
