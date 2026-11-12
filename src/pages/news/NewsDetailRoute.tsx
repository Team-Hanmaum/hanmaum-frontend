import { useParams } from "react-router";
import { isExampleRecordId } from "@/features/record/model/exampleRecords";
import { ConnectedNewsDetailPage } from "./ConnectedNewsDetailPage";
import { NewsDetailPage } from "./NewsDetailPage";

// 미연동 예시 화면이 연 예시 소식은 기존 예시 상세를, 실제 소식은 API 상세를 표시한다.
export function NewsDetailRoute() {
  const { recordId = "" } = useParams();
  return isExampleRecordId(recordId) ? (
    <NewsDetailPage />
  ) : (
    <ConnectedNewsDetailPage />
  );
}
