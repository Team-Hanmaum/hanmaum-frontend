# 라우팅과 페이지 레이아웃

React Router Data 모드를 사용한다. URL과 레이아웃은 `Router.tsx`, 경로 생성은 `paths.ts`에서 관리한다. 업무 경로는 실제 API 페이지에 직접 연결하며, API 연동 구분용 Connected 접두사와 Mock/실제 화면 선택용 Routes 파일은 사용하지 않는다.

## 인증·공간·상태 경계

- `SessionProvider`와 `SessionBoundary`가 세션을 관리한다. 공개 진입 경로와 인증된 업무 경로를 구분하고 계정이 바뀌면 이전 요청·캐시·화면 상태를 정리한다. 탭 복귀 중에는 기존 화면과 입력을 유지하고 보호 요청의 계정 검증은 공통 API 계층에서 수행한다.
- `/auth/callback`은 내 정보를 확인하고 저장된 내부 복귀 주소를 우선한다. 복귀 주소가 없으면 참여 공간 한 곳은 홈, 0곳 또는 여러 곳은 공간 목록으로 이동한다. 조회 실패를 빈 공간 목록으로 처리하지 않는다.
- `SpaceSessionLayout` → `SpaceLayout`이 공간 접근을 확인하고 `useSpaceContext`로 실제 공간 상세를 전달한다. 공간이 바뀌면 Outlet key로 화면 상태를 초기화한다.
- 가족 관리 경로는 나가기·삭제 후에도 결과와 같은 요청 재확인을 유지하도록 `SpaceSessionLayout`에서 별도로 분기한다. 각 가족 관리 화면과 API가 실제 역할·접근 권한을 확인한다.
- `TabLayout`은 다섯 탭의 헤더·공간 전환·하단 액션과 탭을 조합한다. `RecordRouteLayout`은 공간/소식 ID, `ReviewLayout`은 공간 ID를 기준으로 상태 경계를 유지한다. Mock 선택기를 없앤 뒤에도 이 경계는 필요하다.
- 공개 `InvitationPage`는 토큰과 계정 ID가 바뀌면 참여 실패·요청 ID를 초기화한다. 단순 페이지 이름 변경 때 이 key를 제거하지 않는다.

## 주요 경로

아래 공간 내부 경로의 접두사는 `/spaces/:careSpaceId`다. 경로 그룹·정적 경로 우선순위·화면 제목·활성 탭 정보는 Router에서 유지한다.

| 경로                                                                               | 화면·동작                                    |
| ---------------------------------------------------------------------------------- | -------------------------------------------- |
| `/`, `/login`, `/auth/callback`                                                    | 랜딩, OAuth 진입, 세션 확인과 로그인 복귀    |
| `/onboarding/guide`, `/spaces`, `/spaces/new`                                      | 시작 안내, 참여 공간 목록, 공간 생성         |
| `/invitations/:invitationToken`                                                    | 로그인 후 초대 확인·참여                     |
| `/share/:token`                                                                    | 로그인·참여 권한 확인 후 공유 항목 조회      |
| `/account`, `/account/logout`                                                      | 내 계정, 로그아웃                            |
| `/account/withdraw`, `/account/withdraw/news`, `/account/withdraw/complete`        | 탈퇴 확인, 소식 정리, 완료                   |
| `home`, `care`, `news`, `family`, `all`                                            | 홈·돌봄·소식·가족·전체 탭                    |
| `invite`                                                                           | 초대 링크 발급·복사·공유                     |
| `news/new`, `news/:recordId`                                                       | 소식 작성, 원문·분석 상태                    |
| `news/:recordId/delete`, `news/deletions/:deletionId`                              | 삭제 영향 확인·삭제·결과                     |
| `proposals`, `news/:recordId/proposals`                                            | 전체/소식별 제안, 가족 요청 목록과 검토      |
| `proposals/:proposalId/edit`, `target`, `evidence`                                 | 제안 편집 초안, 연결 후보, 근거 비교         |
| `proposals/confirm`, `proposals/results/:resultId`, `proposal-requests/:requestId` | 최종 확인, 결정 결과, 요청 검토·승인/미적용  |
| `care/new/:kind`                                                                   | 일정·할 일·질문 직접 추가 또는 승인 요청     |
| `care/items/:itemId` 및 `manage`                                                   | 항목 상세와 관리 메뉴                        |
| 항목의 `edit`, `assignee`, `status`, `answer`, `delete`                            | 내용·담당자·상태·답변·삭제 처리              |
| 항목의 `sources`, `history/:historyId?`, `reconfirm`, `share`                      | 근거, 변경 이력, 근거 재확인, 공유 링크 발급 |
| `family/members`, `family/members/:memberId/remove`                                | 구성원 관리·내보내기                         |
| `family/transfer`, `family/transfer/:memberId`, `family/leave`, `family/delete`    | 소유권 이전, 나가기, 공간 삭제               |
| `info`, `info/edit`, `info/requests`, `info/requests/:requestId`                   | 공간 정보 조회·수정·구성원 요청·소유자 처리  |
| `/_dev/components`                                                                 | 로컬 개발 전용 표현 컴포넌트 전시            |

공간 루트는 홈으로 이동한다. 없는 주소는 404, 화면 오류는 공통 RouteErrorPage를 사용한다. 정적 호스팅의 SPA rewrite는 기존 Vercel 설정을 유지한다. 공간 ID만으로 참여 권한을 판단하지 않는다.

## 이전 주소와 예시 데이터

- 업무용 Mock 저장소·예시 시드·미연동 안내와 예시 결과 화면은 제거했다. 예전 공간·항목·소식 등의 `mock-` 식별자는 루트 loader에서 404로 처리하며 실제 업무 조회에 사용하지 않는다. 초대·공유의 불투명 토큰은 이 접두사 검사 대상이 아니다.
- `care/requests`와 `care/requests/:changeId`는 실제 가족 요청 목록 `proposals?status=requests`로 보낸다. 기존 requested/applied/rejected는 PENDING/APPLIED/DECLINED 필터로 연결한다. 이전 개별 Mock 변경 ID나 항목 필터를 실제 요청 ID로 해석하지 않는다. 탈퇴 복귀 표시와 해시는 유지한다.
- 항목 기반 `care/items/:itemId/shared` 주소는 기존대로 보호된 항목 상세로 보낸다. 실제 공유 조회는 `/share/:token`이다.
- 랜딩의 사용 예시와 로컬 컴포넌트 전시의 예시 값은 유지한다. 전시 경로와 코드는 Production 빌드에 포함하지 않는다.
- `VITE_ENABLE_QA_TOOLS=true` 환경의 `qa=1`·같은 탭 유지·QA 종료는 유지한다. 업무 데이터를 가짜 값으로 바꾸는 상태 선택기는 없다. Production은 QA false다.

## 데이터·입력·이동 유지

- 업무 데이터는 각 도메인 model의 Query 훅에서 가져온다. Types·Validators·Api 분리 및 세션·CSRF 처리는 [공통 API 규격](../lib/api/README.md)을 따른다. 빈 목록·로딩·오류는 실제 응답 상태로 표시한다.
- 돌봄 목록은 `type`과 `status` 필터 및 서버 커서·정렬을 사용한다. 일부 페이지만 받은 뒤 FE 정렬로 전체 순서를 대체하지 않는다. 상세 직접 진입 후 목록 이동은 항목 유형을 유지한다.
- 소식 목록은 본문 3줄 미리보기와 실제 서버 커서 더 보기를 사용한다. 조회 크기는 `recordPageSize`(현재 20)이며 예전 Mock의 `shown` 쿼리 방식은 사용하지 않는다. 더 보기 후 새 카드로 포커스를 이동하고 추가 조회 실패 시 기존 목록을 유지한다.
- 소식 분석은 대기·진행 중에만 상태를 재조회한다. 제안 반영·요청 처리·돌봄 변경·소식 삭제 후 관련 목록·홈·상세 캐시를 갱신한다. 변경 요청의 응답 유실은 같은 clientRequestId와 본문으로 확인하며 임의로 새 작업을 만들지 않는다.
- 제안 편집 초안과 직접 입력은 해당 화면/Query 상태로 유지한다. 이것은 Mock 데이터나 영구 저장이 아니다. 최신 reviewToken·버전·편집 잠금 확인과 이탈 확인을 유지한다.
- 홈 표시 개수는 `homePreviewLimits`에서 관리한다. 가족 3명·최근 소식 1건·일정 2건·할 일 3건·질문 2건·변경 3건이며, 서버 전체 건수와 구분한다.
- `returnTo=withdrawal`은 탈퇴 전 정리 흐름의 하위 화면에도 전달한다. 임의 외부 복귀 URL을 허용하지 않는다.
- `useUnsavedChanges`와 공통 확인창은 작성 중 내부 이동을 확인한다. 새로고침·창 닫기는 브라우저 기본 안내를 사용한다. 401로 재로그인이 필요한 경우 저장하지 않은 입력은 유지된다고 안내하지 않는다.
- `useBackNavigation(fallback)`은 앱 내 이력이 있으면 뒤로가고, 직접 진입 시에는 대체 경로로 이동한다. App의 제목·본문 포커스·ScrollRestoration을 유지한다.
- 시간 선택은 `picker=time`으로 같은 폼을 유지하며 별도 휠 화면을 표시한다. `CareTimeSelection`은 임시 선택과 확인을, `useTimeSelectionScreen`은 이력·제목·복귀 포커스를 담당한다. 확인한 경우만 폼에 반영하고 취소하면 기존 값을 유지한다.

## 공통 레이아웃

PageLayout은 헤더와 상단 safe area를 sticky로 고정한다. 본문은 문서 스크롤을 사용하며 헤더·하단 액션의 높이를 관측해 가려지지 않게 여백을 조절한다. 가족·제안·계정용 레이아웃은 화면별 헤더·하단 액션·선택적 탭을 조합하며 업무 데이터나 예시 저장소를 소유하지 않는다.

## 공통 화면 전환

- 화면 이동은 `useAppNavigate`, 링크는 `AppLink`를 사용한다. 기존 React Router의 `to`·`replace`·`state` 등 옵션을 그대로 전달하며 필요한 경우 `viewTransition: false`로 제외한다. 자동 인증 리다이렉트의 `Navigate`는 즉시 처리한다.
- `Router.tsx`의 구독에서 `routeMotion.ts`와 앱 방문 이력으로 방향을 결정한다. 일반 진입은 오른쪽에서 들어오는 전환, 뒤로가기는 현재 화면이 오른쪽으로 빠지는 전환, 하단 탭 간 일반 이동은 페이드다. 일반 REPLACE와 로그인·계정 종료 진입은 페이드로 처리한다.
- 특정 주소로 돌아가는 버튼은 `navigate(path, { motion: "back" })`을 사용한다. 이력 대신 목록 주소를 PUSH하거나 직접 진입 후 대체 경로로 REPLACE해도 뒤로가기 방향을 유지한다. 이 의도는 출발 위치 key와 함께 전달하여 폼 이탈 확인 후 재개할 때 유지하고, 취소 이후 다른 이동이나 브라우저 앞으로가기에 적용되지 않게 한다. `useBackNavigation`의 대체 경로에도 같은 규칙을 적용한다.
- `useTimeSelectionScreen`은 같은 편집 화면을 유지한 채 `picker=time`을 전환한다. 열기·닫기에는 위아래 전환을 적용한다. 일반 필터·QA 쿼리 변경에는 전환을 적용하지 않는다.
- React Router의 View Transition으로 브라우저가 이전 화면의 스냅샷을 유지한다. 이전 React 페이지를 복제하거나 라우트 key로 폼을 재마운트하지 않는다. 기존 `ScrollRestoration`, 입력 유지·이탈 확인, 본문/시간 버튼 포커스 처리를 유지한다.
- View Transition 미지원 브라우저는 즉시 이동한다. `prefers-reduced-motion: reduce`에서는 페이지·모달·안내 효과를 끈다. 공통 CSS는 `styles/motion.css`, 모달은 `components/feedback/modal.css`에서 관리한다.
- 루트 전환은 한 화면을 불투명하게 유지해 바탕이 비치는 깜빡임을 방지한다. 탭 페이드는 이전 화면 위로 새 화면만 120ms 동안 나타나며, 300ms 슬라이드·시간 선택 전환에서는 화면 전체의 투명도를 바꾸지 않는다.
- 설치 안내는 `App`에서 허용한 화면에서만 자동으로 표시하며 `components/pwa`와 `lib/pwa`는 업무 도메인·라우터에 의존하지 않는다.

환경 설정과 검증 절차는 [로컬 HTTPS 개발](../../docs/local-development.md), [배포 문서](../../docs/deployment.md)를 참고한다.
