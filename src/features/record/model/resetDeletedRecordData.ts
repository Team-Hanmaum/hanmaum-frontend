import type { QueryClient } from "@tanstack/react-query";

// invalidate만 하면 재조회 실패·비활성 화면에 삭제된 원문과 파생 값이 남는다.
// 진행 조회를 취소하고 구독 중인 화면에도 빈 상태를 게시한 뒤 새 응답만 받는다.
export async function resetDeletedRecordData(
  client: QueryClient,
  account: string | undefined,
  space: string,
) {
  const prefixes = new Set([
    "records",
    "proposals",
    "change-requests",
    "care-items",
    "dashboard",
    "review-drafts",
  ]);
  const filters = {
    predicate: (query: { queryKey: readonly unknown[] }) =>
      prefixes.has(String(query.queryKey[0])) &&
      query.queryKey[1] === account &&
      query.queryKey[2] === space,
  };
  await client.cancelQueries(filters);
  for (const query of client.getQueryCache().findAll(filters)) query.reset();
  await client.invalidateQueries(filters);
}
