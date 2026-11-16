import type { CareListResponse } from "@/features/careitem/api/careReadTypes";
import { unfinishedFamilyTasks } from "../model/familyTasks";

export function FamilyDepartureImpact({
  data,
  membershipId,
  self = false,
}: {
  data: CareListResponse;
  membershipId: string;
  self?: boolean;
}) {
  const tasks = unfinishedFamilyTasks(data, membershipId);
  return (
    <section className="flex flex-col gap-hm-8">
      <h2 className="text-hm-body-emphasis">참여 종료 후</h2>
      <dl className="divide-y divide-hm-divider-default rounded-hm-16 bg-hm-bg-surface">
        <div className="flex flex-col gap-hm-4 px-hm-16 py-hm-12">
          <dt className="text-hm-body-emphasis">접근 권한</dt>
          <dd className="text-hm-body-small text-hm-text-secondary">
            소식·돌봄 항목 조회와 변경, 기존 공유 링크 접근이 종료돼요.
          </dd>
        </div>
        <div className="flex flex-col gap-hm-4 px-hm-16 py-hm-12">
          <dt className="text-hm-body-emphasis">맡은 미완료 할 일</dt>
          <dd className="text-hm-body-small wrap-anywhere text-hm-text-secondary">
            {tasks.length ? (
              <>
                <p>
                  현재 {tasks.length}개예요. 처리 시점에 미완료인 할 일의
                  담당자가 미지정으로 바뀌어요.
                </p>
                <ul className="mt-hm-4 list-inside list-disc">
                  {tasks.map((item) => (
                    <li key={item.itemId}>
                      {item.needsReconfirmation
                        ? "내용 재확인이 필요한 할 일"
                        : item.title || "제목 확인 필요"}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              "현재 맡은 미완료 할 일이 없어요."
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-hm-4 px-hm-16 py-hm-12">
          <dt className="text-hm-body-emphasis">남는 기록</dt>
          <dd className="text-hm-body-small text-hm-text-secondary">
            {self ? "내가 남긴" : "작성한"} 소식, 완료된 할 일의 상태와 기존
            변경 이력은 가족에게 남아요.
          </dd>
        </div>
      </dl>
    </section>
  );
}
