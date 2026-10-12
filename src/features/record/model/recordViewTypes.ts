import type { NewsStatus } from "../ui/NewsCard";

export type RecordAnalysisStatus = Extract<
  NewsStatus,
  "analyzing" | "review" | "no-change" | "failed" | "applied"
>;

// 화면 모델이며 BE DTO가 아니다. 원문은 분석·제안 표시와 별도로 유지한다.
export type RecordView = {
  id: string;
  spaceId: string;
  title: string;
  body: string;
  author: { id: string; name: string; self: boolean };
  createdAt: number;
  analysisStatus: RecordAnalysisStatus;
  proposal?: {
    typeLabel: string;
    title: string;
    beforeLabel: string;
    beforeValue: string;
    afterLabel: string;
    afterValue: string;
    meta: string;
  };
};
