import { useState } from "react";
import { BottomSheet } from "@/components/feedback";
import { Field, Button, MenuRow, TextAction } from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import {
  formatCareDate,
  formatCareTime,
} from "@/features/careitem/model/careItemFields";
import {
  fieldLabels,
  displayCareValue,
} from "@/features/careitem/model/careReadView";
import type { SpaceMember } from "@/features/carespace/api/spaceDetailTypes";
import type { ProposalDetail } from "../api/proposalReadTypes";
import type { ProposalDraft } from "../model/proposalDraft";
import { draftKeys } from "../model/proposalDraft";
export function ProposalValuesForm({
  proposal,
  draft,
  onChange,
  onTime,
  members,
}: {
  proposal: ProposalDetail;
  draft: ProposalDraft;
  onChange: (key: string, value: string | null) => void;
  onTime: () => void;
  members: SpaceMember[];
}) {
  const [dateField, setDateField] = useState<string | null>(null);
  const [dateSelection, setDateSelection] = useState("");

  return (
    <div className="flex flex-col gap-hm-16">
      {draftKeys(proposal).map((key) => {
        const value =
          typeof draft.values[key] === "string" ? draft.values[key] : "";
        if (
          ["scheduledDate", "dueDate", "observedDate", "receivedDate"].includes(
            key,
          )
        )
          return (
            <section
              key={key}
              className="flex flex-col gap-hm-8"
            >
              <h2 className="text-hm-body-emphasis">{fieldLabels[key]}</h2>
              <MenuRow
                icon="care-brand"
                className="min-h-hm-touch-min! border border-hm-border-default py-hm-8"
                title={value ? formatCareDate(value) : "날짜 선택"}
                aria-label={`${fieldLabels[key]} 선택${value ? ` · ${formatCareDate(value)}` : ""}`}
                onClick={() => {
                  setDateSelection(value);
                  setDateField(key);
                }}
              />
            </section>
          );
        if (key === "scheduledTime")
          return (
            <section
              key={key}
              className="flex flex-col gap-hm-8"
            >
              <h2 className="text-hm-body-emphasis">시간</h2>
              <MenuRow
                icon="clock-brand"
                className="min-h-hm-touch-min! border border-hm-border-default py-hm-8"
                title={value ? formatCareTime(value) : "시간 선택"}
                aria-label={`시간 선택${value ? ` · ${formatCareTime(value)}` : ""}`}
                onClick={onTime}
              />
              {value && (
                <TextAction
                  className="self-start"
                  onClick={() => onChange(key, null)}
                >
                  시간 미정으로 변경
                </TextAction>
              )}
            </section>
          );
        if (key === "assigneeMembershipId")
          return (
            <label
              key={key}
              className="flex flex-col gap-hm-8"
            >
              담당자
              <select
                className="hm-field-control"
                value={value}
                onChange={(e) => onChange(key, e.target.value || null)}
              >
                <option value="">미지정</option>
                {value && !members.some((m) => m.membershipId === value) && (
                  <option value={value}>담당자 확인 필요</option>
                )}
                {members.map((m) => (
                  <option
                    key={m.membershipId}
                    value={m.membershipId}
                  >
                    {m.displayName || "이름 미설정"}
                  </option>
                ))}
              </select>
            </label>
          );
        if (key === "status") {
          const original = draft.before.status;
          const options =
            proposal.itemType === "SCHEDULE"
              ? original === "COMPLETED" || original === "CANCELED"
                ? [original]
                : ["SCHEDULED", "COMPLETED", "CANCELED"]
              : original === "COMPLETED"
                ? ["COMPLETED", "IN_PROGRESS"]
                : original === "IN_PROGRESS"
                  ? ["IN_PROGRESS", "COMPLETED"]
                  : ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];
          return (
            <label
              key={key}
              className="flex flex-col gap-hm-8"
            >
              상태
              <select
                className="hm-field-control"
                value={value}
                onChange={(e) => onChange(key, e.target.value)}
              >
                {options.map((s) => (
                  <option
                    key={s}
                    value={s}
                  >
                    {displayCareValue("status", s)}
                  </option>
                ))}
              </select>
            </label>
          );
        }
        return key === "description" || key === "confirmedAnswer" ? (
          <Field
            key={key}
            multiline
            rows={3}
            label={fieldLabels[key]}
            value={value}
            onChange={(e) => onChange(key, e.target.value || null)}
            maxLength={10000}
          />
        ) : (
          <Field
            key={key}
            label={fieldLabels[key] ?? key}
            value={value}
            onChange={(e) => onChange(key, e.target.value || null)}
            required={key === "title"}
            maxLength={10000}
          />
        );
      })}
      <BottomSheet
        open={dateField !== null}
        onOpenChange={(open) => {
          if (!open) setDateField(null);
        }}
        title={dateField ? fieldLabels[dateField] : "날짜 선택"}
        footer={
          <div className="grid grid-cols-2 gap-hm-8">
            <Button
              variant="outline"
              onClick={() => setDateField(null)}
            >
              취소
            </Button>
            <Button
              onClick={() => {
                if (dateField) onChange(dateField, dateSelection || null);
                setDateField(null);
              }}
            >
              선택 완료
            </Button>
          </div>
        }
      >
        <DatePicker
          value={dateSelection}
          onChange={setDateSelection}
        />
        {dateSelection && (
          <TextAction
            className="self-start"
            onClick={() => setDateSelection("")}
          >
            날짜 미정으로 변경
          </TextAction>
        )}
      </BottomSheet>
    </div>
  );
}
