# 라우팅과 페이지 레이아웃

React Router Data 모드 사용. `Router.tsx`에서 컴포넌트 밖에 라우터를 한 번 생성하고, `main.tsx`에서 `RouterProvider`를 렌더링한다. [공식 설치 가이드](https://reactrouter.com/start/data/installation) 기준.

## 경로 등록

- 공통 URL은 `paths.ts`, 공간별 URL은 `spacePath(careSpaceId, tab)` 사용. ID는 URL 세그먼트로 인코딩하며 BE의 ID 형식을 임의로 제한하지 않는다.
- `/spaces/:careSpaceId`는 해당 공간의 `/home`으로 이동한다.
- 공간별 다섯 메인 페이지는 `TabLayout` 아래에 등록하고 `handle`에 `title`, `tab` 지정. 선택 탭은 URL에 매칭된 라우트에서 도출하며 별도 전역 상태를 두지 않는다.
- 상세·작성 페이지는 같은 공간 경로 아래에서 `TabLayout`의 형제 라우트로 추가한다. 하단 탭과 상세 액션 바를 중복 표시하지 않는다.
- `App.tsx`는 제목·본문 포커스·스크롤 복원 담당. 갤러리까지 모바일 너비로 제한하지 않는다.
- 새 페이지에는 `h1`을 둔다. `PageLayout`의 `main`은 경로 전환 시 포커스 목적지다.

## 표현과 라우팅의 경계

- `components/layout/PageLayout.tsx`: 최대 너비 512px를 유지하는 유동 폭, 최소 화면 높이, 안전 영역, 헤더·본문·푸터·안내 슬롯.
- `components/layout/DetailLayout.tsx`: 뒤로가기 헤더 조합. 이동 동작은 호출부에서 전달.
- `routes/layouts/TabLayout.tsx`: 공간 ID와 현재 탭을 읽고 Header·Outlet·BottomNav 조합.
- `BottomNav`/`NavItem`의 `renderLink`로 React Router `Link` 주입. 기존 기본 링크·버튼 API 유지. 일반 클릭은 SPA 이동, 새 탭 열기 같은 링크 기본 동작은 보존.
- `ActionBar`/`BottomNav`의 `position="fixed"`는 실제 높이만큼 본문 뒤에 공간을 확보한다. `PageLayout`은 푸터가 없을 때만 하단 안전 영역을 추가한다.

## 뒤로가기

`useBackNavigation(fallback)`은 현재 앱 실행 중에 관측한 방문 이력이 있을 때 `navigate(-1)`을 사용한다. 직접 주소 진입·새로고침 후에는 전달한 기본 경로로 `replace` 이동한다. 브라우저 전체 이력 길이로 외부 사이트 복귀를 추정하거나 쿼리의 임의 URL을 신뢰하지 않는다. 목록의 검색 조건과 스크롤 위치는 앱 내부 이력으로 복귀할 때 보존한다.

## 아직 연결하지 않은 기능

랜딩(`/`) → 로그인(`/login`) → 기록 전 안내(`/onboarding/guide`) 흐름 중 소셜 로그인 이동은 `import.meta.env.DEV`에서만 동작한다. `pages/login/useLoginPreview.ts`는 로딩·중복 클릭 방지·화면 이탈 시 타이머 취소만 담당하며 인증 상태를 생성하지 않는다. 프로덕션에서는 버튼을 비활성화하고 핸들러에서도 이동을 차단한다. BE 연결 시 실제 OAuth·세션 확인으로 교체하고 가입/참여 상태에 따른 목적지를 연결한다.

안내의 계속 버튼은 다음 공간 생성 화면이 준비 중임을 알리는 시트를 연다. 개발용 Mock 공간 보기 링크는 탭 검증용 우회 경로이며 제품 온보딩 완료를 의미하지 않는다. 동의 확인·증빙·공간 생성 API를 호출하거나 완료 상태를 저장하지 않는다.

`/spaces`와 다섯 탭은 Mock 임시 페이지다. 개발 모드의 두 예시 공간은 경로 전환 검증에만 사용하며 실제 공간 생성·참여를 의미하지 않는다. 헤더의 공간 선택은 현재 임시 선택 페이지로 연결한다. 실제 공간명·드롭다운·권한·세션 가드는 BE 연동과 화면 구현 시 추가한다.

URL의 공간 ID는 접근 권한이 아니다. 실제 데이터를 연결하기 전에 세션·참여 권한 검증이 필요하다. JWT나 localStorage 인증은 사용하지 않으며 세션 쿠키·CSRF 연동은 후속 이슈 범위다.

정적 호스팅 시 등록된 경로의 직접 진입·새로고침을 위해 `index.html` SPA fallback 설정이 필요하다. Vite 개발/미리보기 서버에서 먼저 확인하며 배포 설정은 이번 작업에 포함하지 않는다.

## 디자인·기능 근거

- 최신 Figma 직접 조회: [HM-ON-A01 · 랜딩 206:744](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=206-744), [HM-ON-A02 · 로그인 206:749](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=206-749), [HM-ON-A03 · 정보 안내 206:754](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=206-754).
- 관련 기능: AUTH-01·02(로그인/유지), SPACE-01·02(공간 생성/목록·진입), SPACE-11(부모님 동의 안내). 이번 작업은 화면·라우팅 준비이며 해당 업무 기능 완료를 의미하지 않는다.
- 후속 의존성: 세션·CSRF/OAuth 성공·실패 계약, 참여 공간/권한 조회, 신규·기존 사용자 목적지, 동의 절차와 기록 규격. 공통 handoff의 O02/O05/O06 관련 미정 사항 유지.
