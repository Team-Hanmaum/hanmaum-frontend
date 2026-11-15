import type { CareValues } from "../api/careReadTypes";
import {
  displayCareValue,
  fieldLabels,
  flattenCareValues,
  readCareText,
} from "../model/careReadView";

export function CareFieldList({
  values,
  keys = Object.keys(fieldLabels),
  members,
  emptyText,
}: {
  values: CareValues | null;
  keys?: readonly string[];
  members?: Parameters<typeof displayCareValue>[2];
  emptyText?: string;
}) {
  const fields = flattenCareValues(values);
  const populatedKeys = keys.filter((key) => readCareText(fields[key]));
  if (!populatedKeys.length) {
    return emptyText ? (
      <p className="text-hm-body-small text-hm-text-secondary">{emptyText}</p>
    ) : null;
  }

  return (
    <dl className="divide-y divide-hm-divider-default">
      {populatedKeys.map((key) => (
        <div
          key={key}
          className="grid grid-cols-[5rem_minmax(0,1fr)] items-baseline gap-hm-12 py-hm-8"
        >
          <dt className="text-hm-caption-default text-hm-text-secondary">
            {fieldLabels[key]}
          </dt>
          <dd className="text-hm-body-default wrap-anywhere whitespace-pre-wrap">
            {displayCareValue(key, fields[key], members)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
