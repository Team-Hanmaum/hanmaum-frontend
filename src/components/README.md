# 공통 컴포넌트 규격

기존 Figma 토큰·Noto Sans KR을 사용하며 신규 라이브러리 없이 구현. 기본 컨트롤은 `@/components/ui`, 화면 구조는 `@/components/layout`, 안내·오버레이는 `@/components/feedback`에서 가져온다. 도메인 의미가 있는 카드는 `@/features/{domain}/ui`에서 가져오고 페이지에서 조합한다.

## 책임과 API

| 컴포넌트            | 규격                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `BrandSymbol`       | `size="header"`(기본, 높이 28px) 또는 `"login"`(96px). 주변 문구와 의미가 중복될 때 `decorative` 사용                         |
| `Icon`              | 기본 23종 및 색상 변형 포함 49개 SVG. `IconName` 타입으로 이름 제한, 장식 요소로 표시. 원본 크기와 슬롯 규격은 자산 목록 참조 |
| `Button`            | `variant="primary" / "secondary" / "outline" / "destructive"`, `icon`, `disabled`, `loading`, `loadingLabel` 지원             |
| `IconButton`        | `icon`과 접근 가능한 이름 `label` 필수. 44×44px 터치 영역                                                                     |
| `SocialLoginButton` | `provider="google" / "kakao"`, `label`, `disabled`, `loading`. 일반 버튼과 분리한 브랜드 규격                                 |
| `Spinner`           | 장식용 로딩 아이콘. `tone="brand" / "inverse" / "secondary"`. 모션 줄이기 설정 반영                                           |
| `Field`             | `label` 필수, `helper`, `error`, `disabledReason`, `multiline`, 네이티브 input/textarea 속성·ref 지원                         |
| `Header`            | `variant="main"`의 선택적 `space`, `variant="back"`의 `title`·`onBack`, 공통 `actions` 지원                                   |

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

## 확장 컴포넌트 API

| 가져오는 위치           | 컴포넌트          | 규격                                                                                                                                      |
| ----------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `components/ui`         | `Badge`           | 필수 `label`, `tone="neutral" / "brand" / "error"`                                                                                        |
| `components/ui`         | `Avatar`          | 필수 `name`, 선택 `initial`, `emphasis="default" / "self"`, 장식일 때 `decorative`                                                        |
| `components/ui`         | `TextAction`      | 보조 행동 버튼. `tone="default" / "danger"`, 기본·눌림·포커스·비활성                                                                      |
| `components/ui`         | `SelectionRow`    | 필수 `label`, 선택 `description`. 기본 checkbox / `control="radio"`일 때 `name` 필수. 네이티브 input 속성·ref 지원                        |
| `components/ui`         | `TabItem`, `Tabs` | 단일 탭 표시 / 패널과 키보드 탐색 조합. `Tabs`는 `label`, `items`, `value`, `onValueChange` 필수                                          |
| `components/ui`         | `MenuRow`         | 필수 `title`, 선택 `description`, `icon`, `tone="default" / "danger"`, 버튼 속성·ref                                                      |
| `components/ui`         | `Comparison`      | 현재/제안의 `beforeLabel`, `beforeValue`, `afterLabel`, `afterValue` 필수. 값 변경 없음                                                   |
| `components/layout`     | `SectionHeader`   | 필수 `title`, 선택 `action`, `headingLevel`, `children`                                                                                   |
| `components/layout`     | `NavItem`         | 필수 `label`, `icon`, 이동 `href` 또는 `onClick`. 선택 `selected`, `selectedIcon`                                                         |
| `components/layout`     | `BottomNav`       | `active`는 home/care/news/family/all. `destinations` URL 맵 또는 `onNavigate` 콜백                                                        |
| `components/layout`     | `ActionBar`       | `primary`에 필수 label과 Button 속성. 선택 `secondary`에 label과 TextAction 속성                                                          |
| `components/feedback`   | `Notice`          | 필수 `title`, `body`, `tone="info" / "neutral" / "error"`, 선택 `action`                                                                  |
| `components/feedback`   | `EmptyState`      | 필수 `title`, `body`, 선택 `icon`, `action`                                                                                               |
| `components/feedback`   | `ErrorState`      | 필수 `reason="load-error" / "offline" / "no-permission"`, 문구·후속 행동 덮어쓰기 지원                                                    |
| `components/feedback`   | `LoadingState`    | `variant="initial" / "more"`, 선택 `label`. 최초 로딩은 스켈레톤 2개                                                                      |
| `components/feedback`   | `ConfirmDialog`   | 필수 `open`, `onOpenChange`, `title`, `body`, `onConfirm`. `intent="default" / "destructive"`, `busy`, `confirmDisabled`, `feedback` 지원 |
| `components/feedback`   | `BottomSheet`     | 필수 `open`, `onOpenChange`, `title`, `children`. 선택 `description`, `footer`, `busy`, `closeOnBackdrop`                                 |
| `features/carespace/ui` | `FamilyMember`    | 필수 `name`, `role="owner" / "member"`. 본인 여부 `self`는 공간 역할과 별도                                                               |
| `features/carespace/ui` | `FamilyAvatar`    | 필수 `name`, `roleLabel`, 선택 `self`, `initial`                                                                                          |
| `features/careitem/ui`  | `CareCard`        | 필수 `title`, `meta`, `statusLabel`. `state="default" / "needs-check" / "locked"`, 선택 본문·행동                                         |
| `features/record/ui`    | `NewsCard`        | 필수 제목·작성자·본문·상태. analyzing/review/pending/applied/no-change/failed. 선택 `statusMessage`, `onAction`, `actionLabel`            |
| `features/record/ui`    | `Source`          | `state="available"`이면 제목·메타·원문 필수. `"redacted"`이면 원문 관련 props 금지, 원문·메타·행동을 DOM에 렌더링하지 않음                |
| `features/proposal/ui`  | `Proposal`        | 필수 제목·배지·설명·비교 값·선택 상태/콜백. 선택 근거 보기·연결 대상 확인·수정 콜백                                                       |

공통 컨트롤의 값은 부모에서 관리한다. `SelectionRow`는 네이티브 checkbox/radio이므로 Space·방향키·폼 값·disabled 동작을 유지한다. 라벨과 설명을 분리해 접근 가능한 이름에 설명을 중복 포함하지 않는다. `Tabs`의 항목 value는 서로 달라야 하며 활성 값은 부모가 갱신한다. 좌우 방향키와 Home/End가 비활성 항목을 건너뛴다.

`BottomNav`와 `ActionBar`의 `position` 기본값은 `"static"`이다. `"fixed"`일 때 safe area 및 실제 높이만큼 공간을 예약하고, ResizeObserver로 글자 확대에 대응한다. 하단 고정 영역은 화면의 마지막 자식으로 배치하고 두 고정 영역을 동시에 겹치지 않는다. 최대 너비 512px은 현재 모바일 조합 기준이며 전역 제품 breakpoint 정책을 확정한 것은 아니다.

`ConfirmDialog`와 `BottomSheet`는 네이티브 dialog로 배경 접근·스크롤을 막고 Tab 포커스를 내부에서 순환시킨다. Esc/취소 후 호출 요소로 포커스를 돌려준다. 확인창의 최초 포커스는 취소, 시트는 제목이다. `busy`이면 닫기·Esc를 차단하고 확인창 버튼도 비활성화한다. 바텀시트의 children/footer 컨트롤 비활성화는 호출 측 책임이다. 바깥 클릭 닫기는 기본 비활성이다. 외부에서 open을 false로 변경하는 것은 항상 허용한다. 40% 어두운 backdrop은 Figma에 정의되지 않은 오버레이 표시 보완값이며 제품 정책이 아니다.

확인 콜백은 자동 저장·삭제·닫기를 수행하지 않는다. 호출 측에서 요청 시작 시 busy를 설정하고, 성공 시 닫거나 실패 시 feedback을 제공한다. 서버의 권한 검증·중복 요청 방지는 별도 연동 대상이다. `Notice`는 정적 카드마다 중복 안내하지 않도록 기본 live region이 없고, 즉시 읽어야 하는 오류는 호출 측에서 `role="alert"`를 전달한다.

상태 이름은 UI 표현용이며 BE enum/DTO로 확정한 값이 아니다. 카드는 데이터를 조회하거나 권한을 결정하지 않는다. 구성원의 승인 요청과 소유자의 최종 반영은 별도의 행동이며, 제안을 선택해도 현재 돌봄 정보는 바뀌지 않는다. 삭제된 원문 및 파생 내용의 서버 제거·클라이언트 캐시 무효화는 REC-11 연동에서 처리해야 한다.

```tsx
import { SelectionRow } from "@/components/ui";
import { BottomNav, ActionBar } from "@/components/layout";
import { ConfirmDialog } from "@/components/feedback";
import { CareCard } from "@/features/careitem/ui";

<SelectionRow label="이 제안 선택" checked={selected} onChange={(e) => setSelected(e.target.checked)} />
<CareCard title={item.title} meta={item.meta} statusLabel={item.statusLabel} />
<ActionBar primary={{ label: "승인 요청", onClick: requestApproval, loading: requesting }} />
<BottomNav active="care" destinations={pageUrls} />
<ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="계속 진행할까요?" body={confirmation} busy={saving} onConfirm={save} />
```

## 조합과 확인

- `features/auth/ui/SocialLoginOptions.tsx`: 카카오 → Google 버튼 순서, 로딩 중 다른 공급자 비활성 처리. 인증 API 호출 없음.
- `pages/login/LoginPage.tsx`: 헤더·로고·안내·소셜 선택 영역 조합. 너비에 맞춰 확장하며 중앙 정렬, 작은 높이에서는 세로 스크롤 허용. 큰 화면의 읽기 영역은 임시 최대 512px이며 전역 제품 레이아웃 정책은 아님.
- `App.tsx`: 루트 Outlet과 페이지 제목·본문 포커스·스크롤 복원 처리.
- `pages/login/useLoginPreview.ts`: 개발 환경에서만 1초 로딩 후 안내 화면으로 이동. 중복 클릭 방지와 화면 이탈 시 타이머 취소 처리. 실제 인증·계정 생성·저장 없음.
- `components/layout/PageLayout.tsx`, `DetailLayout.tsx`: 공통 화면 틀과 뒤로가기 헤더 조합. 공간별 탭 연결은 `routes/layouts/TabLayout.tsx`에서 처리하며 [라우팅·레이아웃 규격](../routes/README.md) 참조.
- `pages/component-preview/ComponentPreviewPage.tsx`: 개발 전용 상태 비교. 업무 권한이나 검증 정책과 무관한 예시 값 사용.

로그인 위의 Mock 알림은 Figma 제품 화면에 포함되지 않는 확인용 영역이다. Figma 화면 프레임의 바깥 테두리·모서리는 브라우저 전체 화면에 적용하지 않는다. 본문의 780px 고정 높이 대신 남은 화면 높이와 콘텐츠 높이를 사용한다.

직접 확인할 항목:

1. `/`에서 시작하기 또는 이미 계정이 있어요 → `/login` 이동. 개발 환경에서 두 소셜 버튼을 각각 클릭해 로딩·다른 버튼 비활성·`/onboarding/guide` 이동 확인. 실제 인증 요청 및 외부 이동 없음 확인. 프로덕션에서는 소셜 버튼 비활성 및 Mock 이동 차단 확인.
2. Tab 순서와 포커스 링, Enter·Space 동작 확인. 비활성·로딩 버튼은 동작하지 않는지 확인.
3. `/_dev/components`에서 일반 버튼 4종, 소셜 버튼 2종, 아이콘 버튼 상태 비교. 기존 `/?preview=components` 주소도 같은 화면으로 이동. 마우스 올림·누름으로 실제 상태 확인.
4. 입력 후 오류·비활성 체크박스 전환, 값 유지와 설명 연결 확인. 여러 줄 입력·라벨 클릭·헤더 액션 확인.
5. 320/390/768px 너비, 짧은 화면 높이, 글자 크기 200%, 모션 줄이기 환경 확인.
6. 전체 아이콘 49개 및 체크박스·라디오·탭 상태 전환 확인. 탭의 방향키/Home/End, 비활성 건너뛰기, 활성 패널 연결 확인.
7. 하단 탭 5개 선택 후 고정 옵션 전환. 화면 아래 여백, 긴 문구·글자 확대 후 높이 재측정 확인.
8. 일반/삭제 확인창과 담당자 선택 시트 열기. Tab/Shift+Tab 순환, Esc/취소, 호출 버튼으로 포커스 복귀, 확인 후 로딩 동안 닫기 차단 확인.
9. Source의 원본 삭제 상태로 전환해 원문·메타·원문 버튼의 DOM 제거 확인. Proposal 선택과 ActionBar 콜백은 Mock 안내만 갱신하는지 확인.

## 디자인·기능 출처

2026-10-02~03 Figma MCP로 실제 상세 UI와 [공통 보드 176:3](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=176-3)의 화면·속성 직접 조회. 기존 항목을 포함해 보드의 공통 컴포넌트 31종 및 기본 아이콘 23종 구현. Tabs는 TabItem 조합을 위한 키보드 탐색 컴포넌트.

| 대상             | Figma ID                                                                                                                                                                |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Button           | [178:177](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-177)                                                                                          |
| IconButton       | [178:215](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-215)                                                                                          |
| Google / Kakao   | [401:15428](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=401-15428) / [401:15452](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=401-15452) |
| Field            | [179:171](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=179-171)                                                                                          |
| Header           | [180:147](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-147)                                                                                          |
| 로그인 HM-ON-A02 | [206:749](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=206-749)                                                                                          |

브랜드·아이콘 원본 ID는 [자산 목록](../assets/README.md) 참조. 기능은 공통 handoff의 `FEATURES.md`와 `sources/notion-policy.md`에서 `AUTH-01`(Google·카카오 로그인과 최초 계정 생성) 확인. 이번 구현은 UI 조합 검증 범위이며 `AUTH-01`의 실제 인증 완료를 의미하지 않는다.

추가 공통 컴포넌트의 직접 조회 대상:

| 대상                        | Figma ID                                                                       |
| --------------------------- | ------------------------------------------------------------------------------ |
| 기본 아이콘                 | [177:155](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-155) |
| Badge                       | [177:289](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-289) |
| Avatar                      | [177:298](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-298) |
| TextAction                  | [178:198](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-198) |
| SelectionRow                | [179:249](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=179-249) |
| TabItem / Tabs              | [179:263](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=179-263) |
| NavItem / BottomNav         | [180:148](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| SectionHeader               | [180:359](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-359) |
| MenuRow                     | [180:385](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-385) |
| FamilyMember / FamilyAvatar | [180:386](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-386) |
| CareCard                    | [182:422](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=182-422) |
| NewsCard                    | [182:511](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=182-511) |
| Comparison                  | [183:327](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=183-327) |
| Source                      | [183:352](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=183-352) |
| Proposal                    | [183:415](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=183-415) |
| Notice                      | [182:360](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=182-360) |
| EmptyState                  | [184:373](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=184-373) |
| ErrorState                  | [184:430](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=184-430) |
| LoadingState                | [184:455](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=184-455) |
| ConfirmDialog               | [184:494](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=184-494) |
| BottomSheet                 | [184:499](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=184-499) |
| ActionBar                   | [184:552](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=184-552) |

FamilyAvatar 단독 노드는 `196:500`, NavItem은 `180:168`, BottomNav는 `180:354`, FamilyMember는 `180:406`이다. 위 표의 상위 그룹에서 해당 자식·상태를 함께 조회했다.

기능·정책 참고: `SPACE-07/08`(참여자/권한), `REC-02/10/11`(원본 보존/삭제/파생 내용 정리), `PROP-01/02/05/06`(검토 상태/변경 비교/최종 반영/미적용), `ITEM-01`(확정 항목 목록). 이 구현은 재사용 가능한 UI 규격이며 해당 업무 기능의 구현 완료를 뜻하지 않는다.

## 남은 연동 사항

- BE OAuth 시작 경로(`/oauth2/authorization/google`, `/oauth2/authorization/kakao`)와 콘솔 설정, 콜백·실패 복귀·허용 redirect 경로 합의 및 실인증 검증.
- 세션 확인과 `credentials: 'include'`, `/api/auth/csrf`에서 받은 headerName/token 처리, 로그인·로그아웃 후 CSRF 재발급 연동. 로컬 FE/BE 호스트는 `localhost`로 통일.
- 인증 만료 401과 권한/CSRF 오류 403 구분 및 공개 오류 계약 확인.
- Google 최신 공식 브랜드 가이드와 현재 Figma의 글꼴·색상·G 아트워크 차이 조율. 현 Mock은 요청대로 Figma 원본 유지. 상세 차이는 자산 목록 참조.
- 기본 라우팅·뒤로가기·공간별 탭 연결 완료. 실제 참여 공간 조회·선택 UI와 도메인 권한 연동은 후속 작업. 구성원 요청과 소유자 최종 반영을 자동으로 합치는 동작 없음.
- 공개 도메인 DTO의 표시 상태 매핑, 참여자 권한, 분석 상태·재시도, 제안 요청/최종 반영 경로, 편집 잠금 계약은 BE 확정 후 연결.
- 원본 삭제 시 API 응답의 민감 정보 제거 및 FE 캐시·연결 카드 갱신. `Source`의 redacted 렌더링만으로 전체 삭제 정책을 충족하지 않음.
