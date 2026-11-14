import { useAppNavigate } from "@/routes/useAppNavigate";
import { useRef, useState } from "react";

import { ActionBar, DetailLayout } from "@/components/layout";
import {
  CareSpaceForm,
  type CareSpaceFormFailure,
} from "@/features/carespace/ui/CareSpaceForm";
import { useCreateCareSpace } from "@/features/carespace/model/useCreateCareSpace";
import type { ApiError } from "@/lib/api";
import { paths, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

const labelRule = "이름 또는 호칭을 줄바꿈 없이 1~30자로 입력해 주세요.";

// BE subjectLabel 계약: 줄바꿈은 trim 전에 거부하고, 앞뒤 공백 제거 후 1~30 code point.
function isValidLabel(raw: string, label: string) {
  return (
    label.length > 0 &&
    Array.from(label).length <= 30 &&
    !/[\r\n\u2028\u2029]/u.test(raw)
  );
}

type CreateFailure =
  | { field: string }
  | { notice: CareSpaceFormFailure | true; resetAttempt?: boolean };

function describeCreateError(error: ApiError): CreateFailure {
  if (error.status === 400 && error.code === "INVALID_REQUEST")
    return { field: labelRule };
  if (error.code === "SPACE_LABEL_DUPLICATED")
    return {
      field:
        "이미 소유한 공간 중 같은 이름이 있어요. 다른 이름이나 호칭을 입력해 주세요.",
    };
  if (error.status === 401 && error.code === "UNAUTHENTICATED")
    return {
      notice: {
        title: "로그인이 필요해요",
        body: "다시 로그인한 뒤 이름 또는 호칭을 다시 입력해 주세요.",
      },
    };
  // 처리 중·타임아웃·응답 유실은 같은 요청 ID로 다시 시도해야 결과가 중복되지 않는다.
  return {
    notice: true,
    resetAttempt: error.code === "IDEMPOTENCY_KEY_REUSED",
  };
}

export function SpaceCreatePage() {
  const navigate = useAppNavigate();
  const onBack = useBackNavigation(paths.onboardingGuide);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const [failure, setFailure] = useState<CareSpaceFormFailure | boolean>(false);
  const create = useCreateCareSpace();
  // 한 생성 시도의 요청 ID. 호칭이 바뀌면 새 시도로 보고 새 ID를 발급한다.
  const attempt = useRef<{ label: string; id: string } | null>(null);
  const pending = create.isPending;
  const failed = failure;

  function submitRemote(label: string) {
    if (attempt.current?.label !== label)
      attempt.current = { label, id: crypto.randomUUID() };
    setFailure(false);
    create.mutate(
      { subjectLabel: label, clientRequestId: attempt.current.id },
      {
        onSuccess: (created) => {
          attempt.current = null;
          void navigate(spacePath(created.spaceId), { replace: true });
        },
        onError: (createError) => {
          const result = describeCreateError(createError);
          if ("field" in result) {
            setError(result.field);
            return;
          }
          if (result.resetAttempt) attempt.current = null;
          setFailure(result.notice);
        },
      },
    );
  }

  function submit() {
    if (pending) return;
    const label = value.trim();
    if (!isValidLabel(value, label)) {
      setError(labelRule);
      return;
    }
    setError(undefined);
    submitRemote(label);
  }

  return (
    <DetailLayout
      title="돌봄 공간 만들기"
      onBack={onBack}
      footer={
        <ActionBar
          position="fixed"
          primary={{
            label: failed ? "다시 시도하기" : "돌봄 공간 만들기",
            type: "submit",
            form: "care-space-form",
            loading: pending,
            loadingLabel: "공간을 준비하고 있어요",
          }}
        />
      }
    >
      <CareSpaceForm
        id="care-space-form"
        value={value}
        onChange={(next) => {
          setValue(next);
          setError(undefined);
        }}
        onSubmit={submit}
        error={error}
        failed={failed}
        disabled={pending}
      />
    </DetailLayout>
  );
}
