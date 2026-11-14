import { ActionBar, DetailLayout } from "@/components/layout";
import { UnsavedChangesDialog } from "@/components/feedback/UnsavedChangesDialog";
import { toSpaceView } from "@/features/dashboard/model/homeData";
import { useRecordComposer } from "@/features/record/model/useRecordComposer";
import { NewsForm } from "@/features/record/ui/NewsForm";
import { TextAction } from "@/components/ui";
import { newsDetailPath, spacePath } from "@/routes/paths";
import { useAppNavigate } from "@/routes/useAppNavigate";
import { useBackNavigation } from "@/routes/useBackNavigation";
import { useSpaceContext } from "@/routes/useSpaceContext";
import { useWithdrawalReturn } from "@/routes/useWithdrawalReturn";

export function NewsCreatePage() {
  const { withdrawing, withReturn, returnToWithdrawal } = useWithdrawalReturn();
  const { space } = useSpaceContext();
  const navigate = useAppNavigate();
  const onBack = useBackNavigation(
    withReturn(spacePath(space.spaceId, "news")),
  );
  const composer = useRecordComposer({
    spaceId: space.spaceId,
    onCreated: (id) =>
      void navigate(withReturn(newsDetailPath(space.spaceId, id)), {
        replace: true,
      }),
  });
  return (
    <DetailLayout
      title="소식 남기기"
      onBack={onBack}
      footer={
        <ActionBar
          position="fixed"
          primary={{
            label: composer.failure ? "다시 등록하기" : "소식 등록하기",
            type: "submit",
            form: "news-form",
            disabled: !composer.canSubmit,
            loading: composer.pending,
            loadingLabel: "소식을 등록하고 있어요",
          }}
        />
      }
    >
      {withdrawing && (
        <TextAction onClick={returnToWithdrawal}>
          탈퇴 절차로 돌아가기
        </TextAction>
      )}
      <NewsForm
        id="news-form"
        space={toSpaceView(space, [])}
        body={composer.body}
        onChange={composer.changeBody}
        onSubmit={composer.submit}
        error={composer.error}
        failed={composer.failure}
        disabled={composer.pending}
      />
      <UnsavedChangesDialog
        open={composer.blocker.state === "blocked"}
        onStay={() => composer.blocker.reset?.()}
        onLeave={() => composer.blocker.proceed?.()}
        title="작성 중인 소식에서 나갈까요?"
        body="아직 등록하지 않은 내용은 사라져요."
        confirmLabel="작성하지 않고 나가기"
        cancelLabel="계속 작성하기"
      />
    </DetailLayout>
  );
}
