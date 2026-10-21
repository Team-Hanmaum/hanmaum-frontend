import { BottomSheet, Notice } from "@/components/feedback";
import { BrandSymbol, Button, TextAction } from "@/components/ui";
import type { useInstallPrompt } from "@/lib/pwa/useInstallPrompt";

const steps = {
  ios: [
    "Safari에서 이 사이트를 열어 주세요.",
    "브라우저의 공유 메뉴를 열고 ‘홈 화면에 추가’를 선택해 주세요.",
    "‘웹 앱으로 열기’가 보이면 켜고 ‘추가’를 눌러 주세요.",
  ],
  android: [
    "Chrome 또는 Samsung Internet에서 이 사이트를 열어 주세요.",
    "브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해 주세요.",
    "설치 또는 추가를 누르면 홈 화면에서 한마음을 열 수 있어요.",
  ],
  desktop: [
    "Chrome 또는 Edge에서 이 사이트를 열어 주세요.",
    "주소창의 설치 아이콘이나 브라우저 메뉴의 앱 설치 항목을 선택해 주세요.",
  ],
};

export function PwaInstallSheet({
  open,
  guide,
  canInstall,
  busy,
  error,
  dismiss,
  install,
}: ReturnType<typeof useInstallPrompt>) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={(next) => {
        if (!next) dismiss();
      }}
      title="한마음을 홈 화면에 추가해요"
      description="홈 화면에서 한마음을 바로 열고 가족의 돌봄을 이어가세요."
      busy={busy}
      footer={
        <div className="flex flex-col gap-hm-8">
          {canInstall && (
            <Button
              loading={busy}
              onClick={() => void install()}
            >
              한마음 설치하기
            </Button>
          )}
          <Button
            variant={canInstall ? "secondary" : "primary"}
            disabled={busy}
            onClick={() => dismiss()}
          >
            {canInstall ? "나중에 할게요" : "확인했어요"}
          </Button>
          <TextAction
            disabled={busy}
            onClick={() => dismiss(true)}
          >
            다시 보지 않기
          </TextAction>
        </div>
      }
    >
      <div className="flex justify-center">
        <BrandSymbol
          size="login"
          decorative
        />
      </div>
      {error && (
        <Notice
          role="alert"
          tone="error"
          title="브라우저 메뉴에서 설치해 주세요"
          body={error}
        />
      )}
      {!canInstall && (
        <ol className="list-decimal space-y-3 pl-hm-20 text-hm-body-small text-hm-text-secondary">
          {steps[guide].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      )}
      <p className="text-hm-caption-default text-hm-text-secondary">
        브라우저와 기기에 따라 메뉴 이름이 달라질 수 있어요. 한마음 사용에는
        인터넷 연결이 필요해요.
      </p>
    </BottomSheet>
  );
}
