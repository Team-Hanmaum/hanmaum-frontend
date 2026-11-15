import { useState } from "react";
import { DetailLayout } from "@/components/layout";
import { FixedBottomArea } from "@/components/layout/FixedBottomArea";
import { Notice } from "@/components/feedback";
import { Button } from "@/components/ui";
import { useSession } from "@/features/auth/model/useSession";
import { useLogout } from "@/features/auth/model/useLogout";
import { paths } from "@/routes/paths";
import { useBackNavigation } from "@/routes/useBackNavigation";

export function LogoutPage() {
  const session = useSession();
  const mutation = useLogout();
  const onBack = useBackNavigation(paths.account);
  const [checking, setChecking] = useState(false);
  const unknown = session.status === "logout-unknown";
  const pending = mutation.isPending || checking;
  return (
    <DetailLayout
      title="로그아웃"
      onBack={pending || unknown ? () => {} : onBack}
      footer={
        <FixedBottomArea position="fixed">
          <div className="grid grid-cols-2 gap-hm-12 bg-hm-bg-surface px-hm-20 pt-hm-16 pb-[calc(var(--hm-spacing-24)+env(safe-area-inset-bottom))]">
            {!unknown && (
              <Button
                variant="outline"
                disabled={pending}
                onClick={onBack}
              >
                뒤로가기
              </Button>
            )}
            <Button
              className={unknown ? "col-span-2" : undefined}
              loading={pending}
              onClick={() => {
                if (unknown) {
                  setChecking(true);
                  void session.check().finally(() => setChecking(false));
                } else mutation.mutate();
              }}
            >
              {unknown ? "로그아웃 상태 확인" : "로그아웃"}
            </Button>
          </div>
        </FixedBottomArea>
      }
    >
      <h1 className="text-hm-title-page">
        {unknown ? "로그아웃 상태를 확인하지 못했어요" : "로그아웃할까요?"}
      </h1>
      <Notice
        title={
          unknown
            ? "이전 돌봄 화면은 가려두었어요"
            : "계정과 돌봄 기록은 유지돼요"
        }
        body={
          unknown
            ? "응답을 받지 못해 결과를 확인해야 해요. 연결 상태를 확인한 뒤 아래 버튼을 눌러 주세요."
            : "다시 로그인하면 참여 중인 공간을 확인할 수 있어요."
        }
      />
      {mutation.error && !unknown && (
        <Notice
          tone="error"
          role="alert"
          title="로그아웃하지 못했어요"
          body={mutation.error.message}
        />
      )}
    </DetailLayout>
  );
}
