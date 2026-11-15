import { Comparison } from "@/components/ui";
import { careSpaceName } from "../model/careSpaceViewTypes";

export function SpaceInfoComparison({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  return (
    <Comparison
      beforeLabel="현재 공간 이름"
      beforeValue={careSpaceName({ subjectLabel: before })}
      afterLabel="변경 후"
      afterValue={careSpaceName({ subjectLabel: after })}
    />
  );
}
