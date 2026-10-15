import { useState } from "react";
import { useNavigate } from "react-router";
import { ActionBar, DetailLayout } from "@/components/layout";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import { CareSpaceForm } from "@/features/carespace/ui/CareSpaceForm";
import { mockCareSpaces } from "@/features/carespace/model/mockCareSpaces";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { useMockAction } from "@/lib/useMockAction";
import { paths, spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

const states = [
  { value: "default", label: "기본" },
  { value: "error", label: "생성 오류" },
] as const;
export function SpaceCreatePage() {
  const navigate = useNavigate();
  const onBack = useBackNavigation(paths.onboardingGuide);
  const [value, setValue] = useState("");
  const [error, setError] = useState<string>();
  const [state, setState] = useMockScreenState(states, "default");
  const { pending, run } = useMockAction();
  function submit() {
    if (!isMockPreviewEnabled || pending) return;
    const label = value.trim();
    // 현재 공개 명세의 subjectLabel 제약만 사용한다. 실제 생성은 후속 API 연동 대상이다.
    if (
      !label ||
      Array.from(label).length > 30 ||
      /[\r\n\u2028\u2029]/u.test(label)
    ) {
      setError("이름 또는 호칭을 줄바꿈 없이 1~30자로 입력해 주세요.");
      return;
    }
    setError(undefined);
    run(() => {
      const space = mockCareSpaces.create(label);
      if (space)
        void navigate(`${spacePath(space.id)}?mockState=created`, {
          replace: true,
        });
    });
  }
  return (
    <DetailLayout
      title="돌봄 공간 만들기"
      onBack={onBack}
      notice={
        <MockStateSelect
          message="화면 확인용 · 실제 생성·동의 기록 없음 · 새로고침 시 초기화"
          value={state}
          options={states}
          onChange={setState}
        />
      }
      footer={
        <ActionBar
          position="fixed"
          primary={{
            label: state === "error" ? "다시 시도하기" : "돌봄 공간 만들기",
            type: "submit",
            form: "care-space-form",
            loading: pending,
            loadingLabel: "공간을 준비하고 있어요",
            disabled: !isMockPreviewEnabled,
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
        failed={state === "error"}
        disabled={pending || !isMockPreviewEnabled}
      />
    </DetailLayout>
  );
}
