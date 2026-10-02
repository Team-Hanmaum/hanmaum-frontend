# 공통 컴포넌트 규격

기존 Figma 토큰·Noto Sans KR을 사용하며 신규 라이브러리 없이 구현. 기본 컴포넌트는 `@/components/ui`, 헤더는 `@/components/layout`에서 가져온다.

## 책임과 API

| 컴포넌트            | 규격                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `BrandSymbol`       | `size="header"`(기본, 높이 28px) 또는 `"login"`(96px). 주변 문구와 의미가 중복될 때 `decorative` 사용                                                  |
| `Icon`              | Figma SVG를 장식 요소로 표시. `google`, `kakao`, `chevron-left`, `chevron-left-disabled`, `chevron-down`, `alert`. 24px 슬롯 내부 Google 아트워크 20px |
| `Button`            | `variant="primary" / "secondary" / "outline" / "destructive"`, `icon`, `disabled`, `loading`, `loadingLabel` 지원                                      |
| `IconButton`        | `icon`과 접근 가능한 이름 `label` 필수. 44×44px 터치 영역                                                                                              |
| `SocialLoginButton` | `provider="google" / "kakao"`, `label`, `disabled`, `loading`. 일반 버튼과 분리한 브랜드 규격                                                          |
| `Spinner`           | 장식용 로딩 아이콘. `tone="brand" / "inverse" / "secondary"`. 모션 줄이기 설정 반영                                                                    |
| `Field`             | `label` 필수, `helper`, `error`, `disabledReason`, `multiline`, 네이티브 input/textarea 속성·ref 지원                                                  |
| `Header`            | `variant="main"`의 선택적 `space`, `variant="back"`의 `title`·`onBack`, 공통 `actions` 지원                                                            |

버튼은 기본 `type="button"`이며 폼 제출 시 `type="submit"`을 지정한다. `loading`은 `aria-busy`와 네이티브 `disabled`를 적용해 중복 클릭을 막는다. 명시적인 `disabled`와 `loading`이 동시에 전달되면 비활성이 우선한다. 비즈니스 요청·권한 판정·라우팅은 호출 측 책임이다.

일반 버튼은 최소 52px, 소셜 버튼은 최소 54px이다. Figma Outline의 세로 padding 14px + line-height 24px + 상하 border 1px은 실제 54px이므로 그대로 유지한다. 문구가 길거나 글자가 확대되면 버튼 높이가 늘어날 수 있다. 기본 색상·hover·pressed·focus·disabled·loading은 실제 CSS 상태로 확인하며 강제 상태 전용 props를 제품 컴포넌트에 추가하지 않는다.

`Field`는 자동 ID로 label을 연결하고, 도움말·오류·비활성 이유를 `aria-describedby`에 연결한다. 호출자가 전달한 설명 ID도 함께 보존한다. 오류는 `aria-invalid`와 오류 아이콘·설명으로 표시한다. 비활성일 때에는 비활성 이유가 우선한다. 입력 검증 정책은 컴포넌트에서 정하지 않는다.

```tsx
<Button loading={saving} onClick={save}>저장</Button>
<IconButton icon="chevron-left" label="뒤로가기" onClick={goBack} />
<Field label="이름" value={name} onChange={(event) => setName(event.target.value)} error={nameError} />
<Field multiline label="설명" helper="추가 설명" />
<Header variant="back" title="화면 제목" onBack={goBack} actions={action} />
```

## 조합과 확인

- `features/auth/ui/SocialLoginOptions.tsx`: 카카오 → Google 버튼 순서, 로딩 중 다른 공급자 비활성 처리. 인증 API 호출 없음.
- `pages/login/LoginPage.tsx`: 헤더·로고·안내·소셜 선택 영역 조합. 너비에 맞춰 확장하며 중앙 정렬, 작은 높이에서는 세로 스크롤 허용. 큰 화면의 읽기 영역은 임시 최대 512px이며 전역 제품 레이아웃 정책은 아님.
- `App.tsx`: 확인용 Mock 알림과 1초 로딩 시뮬레이션. 인증 성공·계정 생성·저장을 가장하지 않음.
- `pages/component-preview/ComponentPreviewPage.tsx`: 개발 전용 상태 비교. 업무 권한이나 검증 정책과 무관한 예시 값 사용.

로그인 위의 Mock 알림은 Figma 제품 화면에 포함되지 않는 확인용 영역이다. Figma 화면 프레임의 바깥 테두리·모서리는 브라우저 전체 화면에 적용하지 않는다. 본문의 780px 고정 높이 대신 남은 화면 높이와 콘텐츠 높이를 사용한다.

직접 확인할 항목:

1. `/`에서 두 소셜 버튼을 각각 클릭해 로딩·다른 버튼 비활성·기본 복귀 확인. 실제 인증 요청 및 외부 이동 없음 확인.
2. Tab 순서와 포커스 링, Enter·Space 동작 확인. 비활성·로딩 버튼은 동작하지 않는지 확인.
3. `/?preview=components`에서 일반 버튼 4종, 소셜 버튼 2종, 아이콘 버튼 상태 비교. 마우스 올림·누름으로 실제 상태 확인.
4. 입력 후 오류·비활성 체크박스 전환, 값 유지와 설명 연결 확인. 여러 줄 입력·라벨 클릭·헤더 액션 확인.
5. 320/390/768px 너비, 짧은 화면 높이, 글자 크기 200%, 모션 줄이기 환경 확인.

## 디자인·기능 출처

2026-10-02 Figma MCP로 실제 상세 UI와 컴포넌트의 화면·속성 직접 조회.

| 대상             | Figma ID                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button           | [178:177](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-177)                                                                                          |
| IconButton       | [178:215](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-215)                                                                                          |
| Google / Kakao   | [401:15428](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=401-15428) / [401:15452](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=401-15452) |
| Field            | [179:171](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=179-171)                                                                                          |
| Header           | [180:147](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-147)                                                                                          |
| 로그인 HM-ON-A02 | [206:749](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=206-749)                                                                                          |

브랜드·아이콘 원본 ID는 [자산 목록](../assets/README.md) 참조. 기능은 공통 handoff의 `FEATURES.md`와 `sources/notion-policy.md`에서 `AUTH-01`(Google·카카오 로그인과 최초 계정 생성) 확인. 이번 구현은 UI 조합 검증 범위이며 `AUTH-01`의 실제 인증 완료를 의미하지 않는다.

## 남은 연동 사항

- BE OAuth 시작 경로(`/oauth2/authorization/google`, `/oauth2/authorization/kakao`)와 콘솔 설정, 콜백·실패 복귀·허용 redirect 경로 합의 및 실인증 검증.
- 세션 확인과 `credentials: 'include'`, `/api/auth/csrf`에서 받은 headerName/token 처리, 로그인·로그아웃 후 CSRF 재발급 연동. 로컬 FE/BE 호스트는 `localhost`로 통일.
- 인증 만료 401과 권한/CSRF 오류 403 구분 및 공개 오류 계약 확인.
- Google 최신 공식 브랜드 가이드와 현재 Figma의 글꼴·색상·G 아트워크 차이 조율. 현 Mock은 요청대로 Figma 원본 유지. 상세 차이는 자산 목록 참조.
- 제품 라우팅, 실제 뒤로가기 대상, 공간 선택 및 도메인 권한 정책은 후속 작업. 구성원 요청과 소유자 최종 반영을 자동으로 합치는 동작 없음.
