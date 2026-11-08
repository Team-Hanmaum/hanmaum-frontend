// 계정·공간별로 캐시를 분리한다. 홈 최근 소식(["records", accountId, spaceId, "home"])도 같은 범위에 속한다.
export const recordKeys = {
  space: (accountId: string | undefined, spaceId: string) =>
    ["records", accountId, spaceId] as const,
  list: (accountId: string | undefined, spaceId: string) =>
    [...recordKeys.space(accountId, spaceId), "list"] as const,
  detail: (accountId: string | undefined, spaceId: string, recordId: string) =>
    [...recordKeys.space(accountId, spaceId), "detail", recordId] as const,
  analysis: (
    accountId: string | undefined,
    spaceId: string,
    recordId: string,
    analysisId: string,
  ) =>
    [
      ...recordKeys.space(accountId, spaceId),
      "analysis",
      recordId,
      analysisId,
    ] as const,
};
