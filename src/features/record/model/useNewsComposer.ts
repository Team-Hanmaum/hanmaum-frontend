import { useState } from "react";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useMockAction } from "@/lib/useMockAction";
import { useUnsavedChanges } from "@/lib/useUnsavedChanges";
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
  const [failed, setFailed] = useState(false);
  const { pending, run } = useMockAction();
  const { blocker, allowNavigation } = useUnsavedChanges(Boolean(body));
  function submit(simulateFailure = false) {
    if (!isMockPreviewEnabled || pending) return;
    if (!body.trim()) {
      setError("소식 내용을 입력해 주세요.");
      return;
    }
    setError(undefined);
    setFailed(false);
    run(() => {
      if (simulateFailure) {
        setFailed(true);
        return;
      }
      try {
        const record = mockRecords.create(space, body);
        if (record) allowNavigation(() => onCreated(record.id));
        else {
          setFailed(true);
          setError("소식을 등록하지 못했어요. 공간을 다시 확인해 주세요.");
        }
      } catch {
        setFailed(true);
      }
    });
  }
  return {
    body,
    changeBody(value: string) {
      setBody(value);
      setError(undefined);
    },
    error,
    failed,
    resetFailure() {
      setFailed(false);
      setError(undefined);
    },
    blocker,
    pending,
    canSubmit: isMockPreviewEnabled && Boolean(body.trim()),
    submit,
  };
}
