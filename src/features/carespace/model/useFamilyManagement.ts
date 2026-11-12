import { useParams } from "react-router";
import { ApiError } from "@/lib/api";
import { useSpaceDetail, useSpaceMembers } from "./useSpaceDetail";

// 종료 작업은 상세 조회가 403/404가 되어도 재시도·결과 화면을 유지한다.
// 접근이 끝난 공간의 기존 데이터는 소비 화면에 넘기지 않는다.
export function useFamilyManagement() {
  const { careSpaceId: spaceId = "" } = useParams();
  const detail = useSpaceDetail(spaceId);
  const members = useSpaceMembers(spaceId);
  const accessError = [detail.error, members.error].find(
    (error) =>
      error instanceof ApiError && [403, 404].includes(error.status ?? 0),
  );
  const error = accessError ?? detail.error ?? members.error;
  const denied = !!accessError;
  return {
    spaceId,
    space: denied ? undefined : detail.data,
    members: denied ? undefined : members.data,
    error,
    loading: detail.isPending || members.isPending,
    refreshing: detail.isFetching || members.isFetching,
    async refresh() {
      await Promise.all([detail.refetch(), members.refetch()]);
    },
  };
}
