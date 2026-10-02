# 공통 스타일 사용 규격

기준: 2026-10-02에 직접 조회한 [Figma 상세 UI](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=172-2)의 로컬 변수 94개와 텍스트 스타일 12개.

## 파일 책임

- `tokens.css`: Figma 변수의 CSS 이름·값·별칭 원본. Primitives 18개, Color 42개, Layout 34개.
- `theme.css`: CSS 토큰을 Tailwind v4 유틸리티에 연결하는 어댑터.
- `typography.css`: Noto Sans KR 폰트 스택과 이름 기반 텍스트 스타일.
- `../index.css`: 스타일 및 폰트 로딩, 기본 본문 스타일 적용.

Figma 설명 카드 `176:7`의 “84개” 문구는 과거 수치이며 현재 변수 테이블은 소셜 토큰을 포함한 94개다. 값 변경 시 실제 변수 테이블과 별칭 관계를 다시 확인한다.

## 토큰 사용

화면과 컴포넌트는 의미별 Color 토큰을 우선 사용한다. 같은 색이더라도 텍스트·아이콘·행동·입력·피드백의 역할을 합치지 않는다. Primitives는 의미별 토큰의 원본으로 유지한다.

| 용도             | 사용 예                                                       |
| ---------------- | ------------------------------------------------------------- |
| 배경             | `bg-hm-bg-page`, `bg-hm-bg-surface`                           |
| 텍스트           | `text-hm-text-primary`, `text-hm-text-secondary`              |
| 행동             | `bg-hm-action-primary`, `active:bg-hm-action-primary-pressed` |
| 오류             | `text-hm-feedback-error-text`, `bg-hm-feedback-error-bg`      |
| 소셜 색상        | `bg-hm-social-kakao-background`, `text-hm-social-google-text` |
| 간격             | `p-hm-16`, `gap-hm-8`                                         |
| 반경             | `rounded-hm-10`, `rounded-hm-full`                            |
| 최소 터치 영역   | `min-h-hm-touch-min`, `min-w-hm-touch-min`                    |
| 기본 컨트롤 높이 | `h-hm-control`                                                |
| 테두리 두께      | `border-hm-default` (1px), `border-hm-focus` (2px)            |
| 테두리 색상      | `border-hm-border-default`, `border-hm-input-border-error`    |

`hm` 간격·반경·크기는 Figma의 px 값을 사용한다. 예를 들어 `p-hm-16`은 16px이다. Tailwind 기본 `p-16`은 기존 척도를 그대로 유지하며 서로 다른 값이다. `rounded-hm-full`도 Figma 원본인 999px을 보존한다.

소셜 원본의 `--social-*`, `--color-social-*` 이름은 유지한다. Tailwind에서는 `--color-hm-social-*`로 연결해 일반 토큰과 동일한 `hm` 규칙을 사용한다.

일반 CSS에서도 원본 변수를 직접 사용할 수 있다.

```css
.example {
  color: var(--hm-color-text-primary);
  padding: var(--hm-spacing-16);
}
```

## 타이포그래피

텍스트 클래스 하나로 크기·행 높이·굵기·자간을 함께 적용한다. Noto Sans KR은 전역 기본 폰트이며 `font-sans`도 같은 폰트를 사용한다. HTML 제목 태그의 의미와 시각 스타일은 별도로 선택한다.

| Figma 스타일          | Tailwind 클래스               | 크기 / 행 높이 | 굵기 |
| --------------------- | ----------------------------- | -------------- | ---- |
| `Title/Page`          | `text-hm-title-page`          | 26 / 38px      | 700  |
| `Title/Hero`          | `text-hm-title-hero`          | 22 / 32px      | 700  |
| `Heading/Section`     | `text-hm-heading-section`     | 18 / 28px      | 700  |
| `Body/Default`        | `text-hm-body-default`        | 16 / 26px      | 400  |
| `Body/Reading`        | `text-hm-body-reading`        | 16 / 28px      | 400  |
| `Body/Emphasis`       | `text-hm-body-emphasis`       | 16 / 26px      | 500  |
| `Body/Small`          | `text-hm-body-small`          | 14 / 24px      | 400  |
| `Label/Button`        | `text-hm-label-button`        | 16 / 24px      | 700  |
| `Caption/Default`     | `text-hm-caption-default`     | 13 / 22px      | 400  |
| `Label/Badge`         | `text-hm-label-badge`         | 12 / 18px      | 500  |
| `Navigation/Default`  | `text-hm-navigation-default`  | 12 / 18px      | 400  |
| `Navigation/Selected` | `text-hm-navigation-selected` | 12 / 18px      | 700  |

표의 px 값은 기본 루트 크기 16px 기준이다. 구현에서는 브라우저 기본 글자 크기 설정에 따라 확대되도록 rem을 사용하며 루트 글자 크기를 고정하지 않는다. 자간은 모든 스타일에서 0이다. 기본 본문은 `Body/Default`다. 행 높이·굵기를 임의로 덮어쓰기보다 목적에 맞는 텍스트 스타일을 선택한다.

```tsx
<section className="rounded-hm-14 bg-hm-bg-surface p-hm-20">
  <h2 className="text-hm-heading-section text-hm-text-primary">돌봄 소식</h2>
  <p className="mt-hm-8 text-hm-body-reading text-hm-text-secondary">
    가족이 함께 확인할 내용을 적어주세요.
  </p>
</section>
```

## 폰트 제공

`@fontsource-variable/noto-sans-kr@5.3.0`을 통해 WOFF2 폰트를 앱과 함께 제공한다. 패키지의 CSS family 이름은 `Noto Sans KR Variable`이며 Figma의 Noto Sans KR에 대응한다.

- 디자인에서 사용하는 굵기: 400 / 500 / 700
- `font-display: swap`: 로딩 중 시스템 폰트로 본문 표시
- `unicode-range`: 브라우저에서 필요한 문자 범위만 요청
- 패키지 라이선스: OFL-1.1. 원문을 `public/licenses/noto-sans-kr-OFL.txt`에 보존하며 빌드 시 폰트와 함께 배포한다.
- 기존 React·Vite·Tailwind 버전 및 기본 유틸리티 유지

## 적용 범위

현재 Figma에 있는 Light 모드만 제공한다. 화면을 390px 고정 폭으로 제한하지 않는다. 컨트롤 토큰 52px과 소셜 버튼의 실제 높이 54px은 구분하며, 소셜 버튼 규격은 후속 컴포넌트 작업에서 적용한다.

기존 App의 UI PREVIEW는 초기 데모로 남아 있으며 제품 UI나 토큰 확인 화면이 아니다. 실제 로고·아이콘·공통 컴포넌트·로그인 대표 화면은 별도 작업이다. 토큰 구현에는 BE 연동 의존성이 없다.
