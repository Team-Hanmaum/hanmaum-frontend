import type { CareItemView } from "@/features/careitem/model/careItemViewTypes";
import { FamilyInfoCard } from "./FamilyInfoCard";
export function FamilyDepartureImpact({
  tasks,
  self = false,
}: {
  tasks: readonly CareItemView[];
  self?: boolean;
}) {
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
                <li key={item.id}>
                  {item.needsReconfirmation
                    ? "내용 재확인이 필요한 할 일"
                    : item.title}
                </li>
              ))}
            </ul>
            <p>{tasks.length}개가 담당자 미지정으로 바뀌어요.</p>
          </>
        ) : (
          "미완료 담당 할 일이 없어요."
        )}
      </FamilyInfoCard>
      <FamilyInfoCard title={self ? "남는 공동 기록" : "남는 기록"}>
        {self ? "내가 남긴" : "작성한"} 소식, 완료된 할 일의 상태와 기존 변경
        이력은 가족에게 남아요.
      </FamilyInfoCard>
    </>
  );
}
