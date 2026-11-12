import type { NewsStatus } from "../ui/NewsCard";
import type {
  RecordAuthor,
  RecordDetail,
  RecordLatestAnalysis,
  RecordSummary,
} from "../api/recordReadTypes";
import type { RecordView } from "./recordViewTypes";

// 실제 소식 응답을 기존 소식 UI의 화면 모델로 변환한다. 원문은 그대로 일반 텍스트로 표시한다.
export function recordAuthorName(author: RecordAuthor, isMine: boolean) {
  if (author.withdrawn) return "탈퇴한 사용자";
  return author.displayName?.trim() || (isMine ? "나" : "이름 미설정");
}

export function toRecordStatus(
  latest: RecordLatestAnalysis | null,
  proposalCount?: number,
): RecordView["analysisStatus"] {
  if (!latest) return "recorded";
  switch (latest.status) {
    case "QUEUED":
    case "RUNNING":
      return "analyzing";
    case "FAILED":
      return "failed";
    case "DISCARDED":
      return "analysis-discarded";
    case "COMPLETED":
      return proposalCount === 0 ? "no-change" : "analysis-completed";
  }
}

export function toRecordView(
  record: RecordSummary | RecordDetail,
  spaceId: string,
): RecordView {
  const proposalCount =
    "proposalIds" in record ? record.proposalIds.length : undefined;
  const status = toRecordStatus(record.latestAnalysis, proposalCount);
  return {
    id: record.recordId,
    spaceId,
    title: "가족 소식",
    body: record.content,
    author: {
      id: record.author.membershipId ?? `withdrawn:${record.recordId}`,
      name: recordAuthorName(record.author, record.isMine),
      self: record.isMine,
    },
    createdAt: Date.parse(record.recordedAt),
    analysisStatus: status,
    proposalSummary:
      status === "analysis-completed" && proposalCount
        ? {
            status: "analysis-completed" satisfies NewsStatus,
            count: proposalCount,
            message: `분석으로 만들어진 제안 ${proposalCount}건이 있어요.`,
          }
        : undefined,
  };
}
