import { useState, type ReactNode } from "react";
import { Header } from "@/components/layout";
import {
  BrandSymbol,
  Button,
  Field,
  Icon,
  IconButton,
  SocialLoginButton,
} from "@/components/ui";

function Example({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-hm-12 rounded-hm-14 border border-hm-border-default bg-hm-bg-surface p-hm-20">
      <h3 className="text-hm-body-emphasis">{title}</h3>
      {children}
    </div>
  );
}

export default function ComponentPreviewPage() {
  const [message, setMessage] = useState(
    "예시 데이터를 사용하며 저장·인증 요청은 발생하지 않습니다.",
  );
  const [value, setValue] = useState("");
  const [showError, setShowError] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const grid = "grid gap-hm-16 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="mx-auto max-w-6xl px-hm-20 py-hm-32">
      <div className="mb-hm-32 flex flex-col items-start gap-hm-12">
        <p className="text-hm-label-badge text-hm-text-brand">
          Mock · 개발 환경 전용
        </p>
        <h1 className="text-hm-title-page">공통 컴포넌트</h1>
        <p className="text-hm-body-default text-hm-text-secondary">
          기본·비활성·로딩 상태를 비교하고, 마우스 올림·누름·Tab 키로 포커스를
          확인하세요. 각 상태는 실제 HTML 컨트롤입니다.
        </p>
        <a
          href="/"
          className="hm-focus-ring inline-flex min-h-hm-touch-min items-center rounded-hm-5 text-hm-body-emphasis text-hm-text-brand underline underline-offset-4"
        >
          로그인 조합 보기
        </a>
        <p
          role="status"
          aria-atomic="true"
          className="w-full rounded-hm-10 bg-hm-bg-brand-subtle p-hm-12 text-hm-body-small text-hm-text-brand"
        >
          {message}
        </p>
      </div>

      <main className="flex flex-col gap-hm-40">
        <section
          aria-labelledby="brand-heading"
          className="flex flex-col gap-hm-16"
        >
          <h2
            id="brand-heading"
            className="text-hm-heading-section"
          >
            로고·아이콘
          </h2>
          <div className={grid}>
            <Example title="로고 · 헤더 28px / 로그인 96px">
              <div className="flex items-end gap-hm-24">
                <BrandSymbol />
                <BrandSymbol size="login" />
              </div>
            </Example>
            <Example title="Figma 원본 아이콘">
              <div className="flex flex-wrap gap-hm-16">
                {(
                  [
                    "google",
                    "kakao",
                    "chevron-left",
                    "chevron-down",
                    "alert",
                  ] as const
                ).map((name) => (
                  <span
                    key={name}
                    title={name}
                  >
                    <Icon name={name} />
                    <span className="sr-only">{name}</span>
                  </span>
                ))}
              </div>
            </Example>
          </div>
        </section>

        <section
          aria-labelledby="button-heading"
          className="flex flex-col gap-hm-16"
        >
          <h2
            id="button-heading"
            className="text-hm-heading-section"
          >
            일반 버튼
          </h2>
          <div className={grid}>
            {(["primary", "secondary", "outline", "destructive"] as const).map(
              (variant) => (
                <Example
                  key={variant}
                  title={variant}
                >
                  <Button
                    variant={variant}
                    onClick={() =>
                      setMessage(`${variant} 버튼 클릭 확인 · 저장 없음`)
                    }
                  >
                    기본
                  </Button>
                  <Button
                    variant={variant}
                    disabled
                  >
                    비활성
                  </Button>
                  <Button
                    variant={variant}
                    loading
                  >
                    로딩
                  </Button>
                </Example>
              ),
            )}
            <Example title="아이콘 포함">
              <Button
                icon={<Icon name="chevron-down" />}
                variant="outline"
                onClick={() => setMessage("아이콘 포함 버튼 클릭 확인")}
              >
                선택하기
              </Button>
            </Example>
            <Example title="IconButton · 기본 / 비활성">
              <div className="flex gap-hm-16">
                <IconButton
                  icon="chevron-left"
                  label="뒤로가기 예시"
                  onClick={() => setMessage("아이콘 버튼 클릭 확인")}
                />
                <IconButton
                  icon="chevron-left"
                  label="비활성 뒤로가기 예시"
                  disabled
                />
              </div>
            </Example>
          </div>
        </section>

        <section
          aria-labelledby="social-heading"
          className="flex flex-col gap-hm-16"
        >
          <h2
            id="social-heading"
            className="text-hm-heading-section"
          >
            소셜 로그인 버튼
          </h2>
          <div className={grid}>
            {(["kakao", "google"] as const).map((provider) => (
              <Example
                key={provider}
                title={provider}
              >
                <SocialLoginButton
                  provider={provider}
                  onClick={() =>
                    setMessage(
                      `${provider} 버튼 클릭 확인 · 실제 인증 요청 없음`,
                    )
                  }
                />
                <SocialLoginButton
                  provider={provider}
                  loading
                />
                <SocialLoginButton
                  provider={provider}
                  disabled
                />
              </Example>
            ))}
          </div>
        </section>

        <section
          aria-labelledby="field-heading"
          className="flex flex-col gap-hm-16"
        >
          <h2
            id="field-heading"
            className="text-hm-heading-section"
          >
            입력 필드
          </h2>
          <div className={grid}>
            <Example title="한 줄 · 상태 전환">
              <Field
                label="입력 상태 확인"
                placeholder="내용을 입력해 주세요"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                helper="입력·포커스·설명 연결 확인용 예시"
                error={
                  showError
                    ? "오류 표시를 확인하는 예시 문구입니다."
                    : undefined
                }
                disabled={disabled}
                disabledReason="비활성 표시를 확인하는 예시 문구입니다."
              />
              <div className="flex flex-wrap gap-hm-16 text-hm-body-small">
                <label className="flex min-h-hm-touch-min items-center gap-hm-8">
                  <input
                    type="checkbox"
                    checked={showError}
                    onChange={(event) => setShowError(event.target.checked)}
                  />
                  오류 표시
                </label>
                <label className="flex min-h-hm-touch-min items-center gap-hm-8">
                  <input
                    type="checkbox"
                    checked={disabled}
                    onChange={(event) => setDisabled(event.target.checked)}
                  />
                  입력 비활성
                </label>
              </div>
            </Example>
            <Example title="한 줄 · 채움 / 오류 / 비활성">
              <Field
                label="채워진 입력"
                defaultValue="입력 내용 예시"
              />
              <Field
                label="오류 입력"
                defaultValue="입력 내용 예시"
                error="오류 설명 예시입니다."
              />
              <Field
                label="비활성 입력"
                defaultValue="입력 내용 예시"
                disabled
                disabledReason="비활성 설명 예시입니다."
              />
            </Example>
            <Example title="여러 줄 · 비어 있음 / 채움">
              <Field
                multiline
                label="여러 줄 입력"
                placeholder="내용을 입력해 주세요"
                helper="Enter 키로 줄을 바꿀 수 있습니다."
              />
              <Field
                multiline
                label="채워진 여러 줄 입력"
                defaultValue={"첫 번째 줄\n두 번째 줄"}
              />
            </Example>
            <Example title="여러 줄 · 오류 / 비활성">
              <Field
                multiline
                label="여러 줄 오류 입력"
                defaultValue="입력 내용 예시"
                error="오류 설명 예시입니다."
              />
              <Field
                multiline
                label="여러 줄 비활성 입력"
                disabled
                defaultValue="입력 내용 예시"
                disabledReason="비활성 설명 예시입니다."
              />
            </Example>
          </div>
        </section>

        <section
          aria-labelledby="header-heading"
          className="flex flex-col gap-hm-16"
        >
          <h2
            id="header-heading"
            className="text-hm-heading-section"
          >
            헤더
          </h2>
          <p className="text-hm-body-small text-hm-text-secondary">
            공간 이름·제목은 예시입니다. 공간 선택과 뒤로가기는 클릭 상태만
            확인합니다.
          </p>
          <div className="grid gap-hm-16 lg:grid-cols-2">
            <div className="min-w-0 rounded-hm-14 border border-hm-border-default">
              <Header
                variant="main"
                space={{
                  name: "예시 돌봄 공간",
                  onClick: () =>
                    setMessage("공간 선택 클릭 확인 · 실제 공간 전환 없음"),
                }}
              />
            </div>
            <div className="min-w-0 rounded-hm-14 border border-hm-border-default">
              <Header
                variant="back"
                title="로그인"
                onBack={() => setMessage("헤더 뒤로가기 클릭 확인")}
              />
            </div>
            <div className="min-w-0 rounded-hm-14 border border-hm-border-default">
              <Header variant="main" />
            </div>
            <div className="min-w-0 rounded-hm-14 border border-hm-border-default">
              <Header
                variant="back"
                title="제목이 길어질 때 말줄임 확인용 예시"
                onBack={() => setMessage("긴 제목 헤더 뒤로가기 클릭 확인")}
                actions={
                  <IconButton
                    icon="chevron-down"
                    label="헤더 액션 예시"
                    onClick={() => setMessage("헤더 액션 클릭 확인")}
                  />
                }
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
