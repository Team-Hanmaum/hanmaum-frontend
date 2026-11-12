import type { CareListResponse } from "@/features/careitem/api/careReadTypes";
import { unfinishedFamilyTasks } from "../model/familyTasks";
import { FamilyInfoCard } from "./FamilyInfoCard";

export function ConnectedFamilyDepartureImpact({
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
    <>
      <FamilyInfoCard title={self ? "내 접근 권한" : "접근 권한"}>
        소식·돌봄 항목 조회와 변경, 기존 공유 링크 접근이 종료돼요.
      </FamilyInfoCard>
      <FamilyInfoCard
        title={self ? "내가 맡은 미완료 할 일" : "미완료 담당 할 일"}
      >
        {tasks.length ? (
          <>
            <ul className="list-inside list-disc">
              {tasks.map((item) => (
                <li key={item.itemId}>
                  {item.needsReconfirmation
                    ? "내용 재확인이 필요한 할 일"
                    : item.title || "제목 확인 필요"}
                </li>
              ))}
            </ul>
            <p>현재 확인한 {tasks.length}개가 담당자 미지정으로 바뀌어요.</p>
          </>
        ) : (
          "현재 확인한 미완료 담당 할 일이 없어요."
        )}
        <p className="mt-hm-8 text-hm-caption-default text-hm-text-secondary">
          처리 시점의 미완료 담당 할 일에 적용돼요.
        </p>
      </FamilyInfoCard>
      <FamilyInfoCard title={self ? "남는 공동 기록" : "남는 기록"}>
        {self ? "내가 남긴" : "작성한"} 소식, 완료된 할 일의 상태와 기존 변경
        이력은 가족에게 남아요.
      </FamilyInfoCard>
    </>
  );
}
