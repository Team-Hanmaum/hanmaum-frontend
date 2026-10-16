import { Comparison } from "@/components/ui";
import { FamilyInfoCard } from "./FamilyInfoCard";
export function SpaceInfoComparison({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  return (
    <>
      <FamilyInfoCard title="부모님 이름 또는 호칭">
        <Comparison
          beforeLabel="현재"
          beforeValue={before}
          afterLabel="변경 후"
          afterValue={after}
        />
      </FamilyInfoCard>
      <FamilyInfoCard title="변경 후 공간 이름">
        <p className="text-hm-body-emphasis">{after}의 돌봄</p>
      </FamilyInfoCard>
    </>
  );
}
