import { useState } from "react";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useMockAction } from "@/lib/useMockAction";
import { mockRecords } from "./mockRecords";

export function useNewsComposer({
  space,
  onCreated,
}: {
  space: CareSpaceView;
  onCreated: (id: string) => void;
}) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string>();
  const { pending, run } = useMockAction();
  function submit() {
    if (!isMockPreviewEnabled || pending) return;
    if (!body.trim()) {
      setError("소식 내용을 입력해 주세요.");
      return;
    }
    setError(undefined);
    run(() => {
      const record = mockRecords.create(space, body);
      if (record) onCreated(record.id);
      else setError("소식을 등록하지 못했어요. 공간을 다시 확인해 주세요.");
    });
  }
  return {
    body,
    changeBody(value: string) {
      setBody(value);
      setError(undefined);
    },
    error,
    pending,
    canSubmit: isMockPreviewEnabled && Boolean(body.trim()),
    submit,
  };
}
