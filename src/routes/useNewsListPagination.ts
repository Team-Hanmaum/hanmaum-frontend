import { useLayoutEffect, useRef } from "react";
import { useLocation, useSearchParams } from "react-router";
import {
  newsPageSize,
  readNewsVisibleCount,
} from "@/features/record/model/newsPagination";

export function useNewsListPagination(total: number) {
  const [params, setParams] = useSearchParams();
  const { state } = useLocation();
  const visibleCount = readNewsVisibleCount(params.get("shown"), total);
  const latestParams = useRef(params);

  useLayoutEffect(() => {
    latestParams.current = params;
  }, [params]);

  function showMore() {
    // setSearchParams의 콜백은 연속 호출을 누적하지 않으므로 마지막 요청도 보관한다.
    const next = new URLSearchParams(latestParams.current);
    const currentCount = readNewsVisibleCount(next.get("shown"), total);
    next.set(
      "shown",
      String(
        Math.min(
          currentCount + newsPageSize,
          Math.ceil(total / newsPageSize) * newsPageSize,
        ),
      ),
    );
    // 추가 조회 실패 예시의 재시도는 기존 목록을 유지하며 다음 묶음을 펼친다.
    for (const key of ["qaState", "mockState"])
      if (next.get(key) === "more-error") next.delete(key);
    latestParams.current = next;
    void setParams(
      next,
      // 목록의 현재 이력에 표시 범위를 기록해 상세에서 뒤로 올 때 복원한다.
      { replace: true, preventScrollReset: true, state },
    );
  }

  return { visibleCount, showMore };
}
