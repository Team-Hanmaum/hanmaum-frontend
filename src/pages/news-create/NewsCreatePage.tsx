import { useNavigate, useOutletContext } from "react-router";
import { ActionBar, DetailLayout } from "@/components/layout";
import { MockStateSelect } from "@/components/feedback/MockStateSelect";
import type { CareSpaceView } from "@/features/carespace/model/careSpaceViewTypes";
import { useNewsComposer } from "@/features/record/model/useNewsComposer";
import { newsCreateStates } from "@/features/record/model/newsScreenStates";
import { NewsForm } from "@/features/record/ui/NewsForm";
import { isMockPreviewEnabled } from "@/lib/mockPreview";
import { spacePath } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useMockScreenState } from "@/routes/useMockScreenState";

export function NewsCreatePage() {
  const space = useOutletContext<CareSpaceView>();
  const navigate = useNavigate();
  const onBack = useBackNavigation(spacePath(space.id, "news"));
  const [state, setState] = useMockScreenState(newsCreateStates, "default");
  const { body, changeBody, error, pending, canSubmit, submit } =
    useNewsComposer({
      space,
      onCreated: () =>
        void navigate(spacePath(space.id, "news"), { replace: true }),
    });
  return (
    <DetailLayout
      title="소식 남기기"
      onBack={onBack}
      notice={
        <MockStateSelect
          message="작성 UI 예시 · 실제 저장·분석 없음 · 새로고침 시 초기화"
          value={state}
          options={newsCreateStates}
          onChange={setState}
        />
      }
      footer={
        <ActionBar
          position="fixed"
          primary={{
            label: state === "error" ? "다시 등록하기" : "소식 등록하기",
            type: "submit",
            form: "news-form",
            disabled: !canSubmit,
            loading: pending,
            loadingLabel: "소식을 등록하고 있어요",
          }}
        />
      }
    >
      <NewsForm
        id="news-form"
        space={space}
        body={body}
        onChange={changeBody}
        onSubmit={submit}
        error={error}
        failed={state === "error"}
        disabled={pending || !isMockPreviewEnabled}
      />
    </DetailLayout>
  );
}
