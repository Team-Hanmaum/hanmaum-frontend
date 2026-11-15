import { Notice } from "@/components/feedback";
import { CareFieldList } from "@/features/careitem/ui/CareFieldList";
import {
  displayCareValue,
  fieldLabels,
  flattenCareValues,
  readCareText,
} from "@/features/careitem/model/careReadView";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
import type { ChangeRequestEntry } from "../api/changeRequestTypes";

export function ChangeRequestValues({
  entry,
  members,
  title,
}: {
  entry: ChangeRequestEntry;
  members?: SpaceMember[];
  title: string;
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
  const requested = flattenCareValues(values);
  const keys = Object.keys(fieldLabels).filter((key) =>
    Object.hasOwn(requested, key),
  );
  if (applied || entry.action === "CREATE_ITEM")
    return (
      <CareFieldList
        values={values}
        keys={keys.filter(
          (key) => key !== "title" || readCareText(requested.title) !== title,
        )}
        members={members}
      />
    );

  const current = flattenCareValues(entry.currentValues);
  return (
    <dl className="divide-y divide-hm-divider-default">
      {keys.map((key) => (
        <div
          key={key}
          className="grid grid-cols-2 gap-x-hm-12 gap-y-hm-4 py-hm-8"
        >
          <dt className="col-span-2 text-hm-caption-default font-bold">
            {fieldLabels[key]}
          </dt>
          <dd className="min-w-0 text-hm-body-small wrap-anywhere whitespace-pre-wrap text-hm-text-secondary">
            <span className="block text-hm-caption-default">현재</span>
            {displayCareValue(key, current[key], members)}
          </dd>
          <dd className="min-w-0 text-hm-body-emphasis wrap-anywhere whitespace-pre-wrap text-hm-text-brand">
            <span className="block text-hm-caption-default">요청</span>
            {displayCareValue(key, requested[key], members)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
