import type { Query, QueryClient, QueryFilters } from "@tanstack/react-query";
import { careSpaceKeys } from "./careSpaceKeys";

const scoped = new Set([
  "carespace",
  "records",
  "record-deletions",
  "care-items",
  "proposals",
  "change-requests",
  "dashboard",
  "review-drafts",
]);
function spaceFilter(account: string | undefined, space: string) {
  return {
    predicate: (query: {
      queryKey: readonly unknown[];
      state: { data: unknown };
    }) =>
      (scoped.has(String(query.queryKey[0])) &&
        query.queryKey[1] === account &&
        query.queryKey[2] === space) ||
      (query.queryKey[0] === "invitation" &&
        query.queryKey[1] === account &&
        typeof query.state.data === "object" &&
        query.state.data !== null &&
        "spaceId" in query.state.data &&
        query.state.data.spaceId === space),
  };
}

// 취소 이후 세션이 바뀌어 같은 키로 새 Query가 생겨도 이전 작업의 대상에 넣지 않는다.
function captureQueries(client: QueryClient, filters: QueryFilters) {
  const queries = new Set(client.getQueryCache().findAll(filters));
  return { predicate: (query: Query) => queries.has(query) };
}

// 최초 성공 결과로 현재 역할을 덮어쓰지 않고 서버의 최신 상태를 조회한다.
export function refreshFamilyData(
  client: QueryClient,
  account: string | undefined,
  space: string,
) {
  const filters = captureQueries(client, spaceFilter(account, space));
  const list = captureQueries(client, { queryKey: careSpaceKeys.list() });
  void client.cancelQueries(filters).then(() => {
    void client.invalidateQueries(filters);
    void client.invalidateQueries(list);
  });
}

// 재참여 후 옛 나가기 요청이 성공할 수도 있으므로 목록에서 ID를 임의 삭제하지 않는다.
export function endFamilyAccess(
  client: QueryClient,
  account: string | undefined,
  space: string,
) {
  const filters = captureQueries(client, spaceFilter(account, space));
  const list = captureQueries(client, { queryKey: careSpaceKeys.list() });
  void Promise.all([
    client.cancelQueries(filters),
    client.cancelQueries(list),
  ]).then(() => {
    for (const query of client.getQueryCache().findAll(filters)) query.reset();
    client.removeQueries(filters);
    for (const query of client.getQueryCache().findAll(list)) query.reset();
    void client.invalidateQueries(list);
  });
}
