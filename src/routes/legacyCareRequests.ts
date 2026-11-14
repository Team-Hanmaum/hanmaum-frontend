import { redirect, type LoaderFunctionArgs } from "react-router";
import { proposalListPath } from "./paths";

// 이전 Mock 요청 주소로 저장한 링크도 실제 가족 요청 목록으로 안내한다.
export function redirectLegacyCareRequests({
  params,
  request,
}: LoaderFunctionArgs) {
  if (!params.careSpaceId) throw new Response(null, { status: 404 });
  const source = new URL(request.url);
  const target = new URL(
    proposalListPath(params.careSpaceId, "requests"),
    source,
  );
  const statuses = new Map([
    ["requested", "PENDING"],
    ["applied", "APPLIED"],
    ["rejected", "DECLINED"],
  ]);
  target.searchParams.set(
    "requestStatus",
    statuses.get(source.searchParams.get("status") ?? "") ?? "PENDING",
  );
  if (source.searchParams.get("returnTo") === "withdrawal")
    target.searchParams.set("returnTo", "withdrawal");
  return redirect(`${target.pathname}${target.search}${source.hash}`);
}
