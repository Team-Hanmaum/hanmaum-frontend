import { Notice } from "@/components/feedback";
import { CareValuesView } from "@/features/careitem/ui/CareValuesView";
import {
  fieldLabels,
  flattenCareValues,
} from "@/features/careitem/model/careReadView";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
import type { ChangeRequestEntry } from "../api/changeRequestTypes";

export function ChangeRequestValues({
  entry,
  members,
}: {
  entry: ChangeRequestEntry;
  members?: SpaceMember[];
}) {
  if (entry.status === "INVALIDATED" || entry.redactedFields.length)
    return (
      <Notice
        title="제거된 내용은 표시하지 않아요"
        body="요청을 처리할 수 없거나 일부 내용이 제거됐어요. 최신 제안을 다시 확인해 주세요."
      />
    );
  if (entry.action === "LINK_EVIDENCE")
    return (
      <p className="text-hm-body-default">
        현재 내용은 유지하고 소식 근거만 연결하는 요청이에요.
      </p>
    );
  if (entry.action === "DELETE_ITEM")
    return <p className="text-hm-body-default">돌봄 항목 삭제 요청이에요.</p>;
  const applied = entry.status === "APPLIED";
  const values = applied
    ? (entry.decision?.appliedValues ?? null)
    : entry.requestedValues;
  // 요청값은 전체 항목이 아닌 변경분이다. 생략한 필드를 '미정'으로 비교하지 않는다.
  const keys = Object.keys(flattenCareValues(values)).filter(
    (key) => key in fieldLabels,
  );
  return (
    <CareValuesView
      before={
        applied || entry.action === "CREATE_ITEM"
          ? undefined
          : entry.currentValues
      }
      values={values}
      keys={keys}
      members={members}
      afterLabel={applied ? "반영된 내용" : "요청한 내용"}
    />
  );
}
