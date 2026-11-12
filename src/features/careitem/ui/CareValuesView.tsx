import { Comparison } from "@/components/ui";
import {
  displayCareValue,
  fieldLabels,
  flattenCareValues,
} from "../model/careReadView";
import type { CareValues } from "../api/careReadTypes";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
export function CareValuesView({
  values,
  before,
  members = [],
  keys,
  beforeLabel = "현재 내용",
  afterLabel = "반영할 내용",
}: {
  values: CareValues | null;
  before?: CareValues | null;
  members?: SpaceMember[];
  keys?: string[];
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const current = flattenCareValues(values);
  const previous = flattenCareValues(before ?? null);
  const fields = (keys ?? Object.keys(fieldLabels)).filter(
    (key) => key in current || key in previous,
  );
  return (
    <div className="flex w-full min-w-0 flex-col gap-hm-16">
      {fields.map((key) => (
        <div key={key}>
          <p className="mb-hm-8 text-hm-caption-default text-hm-text-secondary">
            {fieldLabels[key] ?? key}
          </p>
          {before !== undefined ? (
            <Comparison
              beforeLabel={beforeLabel}
              afterLabel={afterLabel}
              beforeValue={displayCareValue(key, previous[key], members)}
              afterValue={displayCareValue(key, current[key], members)}
            />
          ) : (
            <p className="text-hm-body-default wrap-anywhere whitespace-pre-wrap">
              {displayCareValue(key, current[key], members)}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
