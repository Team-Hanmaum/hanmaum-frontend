# Hanmaum Frontend

## 기본 원칙

- 기존 React/Vite/TypeScript/Tailwind/pnpm 설정을 유지한다.
- Node와 pnpm 버전은 package.json의 engines와 packageManager를 따른다.
- 변경 전에 관련 코드와 Git 상태를 확인하고 기존 작업을 보존한다.
- 요청된 범위에 집중하고, 문서에 없는 제품 정책을 임의로 확정하지 않는다.

## 코드 구조와 명명

- components: 여러 화면에서 재사용하는 공통 표현과 레이아웃
- features: 도메인별 UI, 상태, API 연동 등 업무 기능
- pages: 화면 단위 조합
- routes: 경로 등록, URL 생성, 라우팅 관련 레이아웃
- styles: 공통 토큰과 전역 스타일
- assets: 로고, 아이콘, 이미지
- 공통 components는 features·pages·routes에 직접 의존하지 않고, 필요한 데이터와 동작은 props로 전달받는다.
- 컴포넌트와 페이지 파일은 PascalCase를 사용한다.
- 훅과 유틸 파일은 camelCase, 폴더와 정적 에셋은 kebab-case를 사용한다.
- main.tsx, index.ts 등 기존 진입점과 도구 지정 파일명은 유지한다.

### 페이지 폴더 규칙

- pages의 최상위 폴더는 care, news, proposal, space, family처럼 화면 영역별로 묶는다. landing, login처럼 독립적인 진입 화면은 별도 폴더를 유지한다.
- 같은 영역의 여러 페이지는 하나의 폴더 안에 각각의 `*Page.tsx` 파일로 둔다. 페이지마다 최상위 폴더를 새로 만들지 않는다.
- 하위 폴더는 care/change, care/share처럼 구분되는 흐름이 있을 때 추가한다. 파일 수나 URL 깊이만을 기준으로 폴더를 나누지 않는다.
- 페이지 파일은 화면 조합과 해당 화면의 상태·이동을 담당한다. 여러 화면에서 사용하는 도메인 UI·상태는 features, 범용 UI는 components에 둔다.
- features와 components에서 pages를 import하지 않는다. 공유할 UI가 페이지에 있으면 적절한 도메인 또는 공통 컴포넌트로 추출한다.
- 폴더는 소문자 kebab-case, 페이지 파일은 PascalCase와 Page 접미사를 사용한다. UI·훅·상태 파일이 필요해지는 시점에 해당 폴더를 만들고 빈 폴더를 미리 늘리지 않는다.
- 폴더 경로와 URL은 별개다. URL은 routes에서 명시적으로 등록하며 폴더 이동만으로 기존 URL이나 화면 동작을 바꾸지 않는다.
- 업무 페이지는 실제 API를 사용하는 단일 `*Page.tsx`로 작성한다. API 연동 여부를 구분하는 `Connected` 접두사나 Mock/실제 페이지를 선택하는 `*Routes.tsx` 중계 파일을 추가하지 않는다. 경로 등록과 지연 로딩은 `routes/Router.tsx`에서 관리한다.
- 계정·공간·항목 변경 시 입력과 요청 상태를 초기화하는 key 및 Outlet context 경계는 유지한다. 단순 분기 파일과 상태 경계 역할의 레이아웃을 구분한다.

### API 파일 규칙

- 도메인 API는 `features/{domain}/api/`에 두고 같은 기능 접두사로 `*Types.ts`, `*Validators.ts`, `*Api.ts`를 구분한다. 예: `careSpaceTypes.ts`, `careSpaceValidators.ts`, `careSpaceApi.ts`. 한 도메인이 커지면 `spaceDetail*`, `recordRead*`처럼 기능 단위로 나누며 전역 api 폴더로 모으지 않는다.
- `*Types.ts`에는 요청·응답 DTO의 type/interface만 둔다. HTTP 호출, 런타임 검증, 화면 상태·표시용 타입을 섞지 않는다. 타입은 해당 Types 파일에서 `import type`으로 가져오며 Api 파일에서 다시 export하지 않는다.
- `*Validators.ts`에는 서버 응답을 `unknown`으로 받아 구조·필드·허용 값·nullable 여부 등을 검사하는 순수 함수를 둔다. 네트워크·캐시·화면 이동에 의존하지 않으며 값을 보정하거나 예시 데이터로 대체하지 않는다. 같은 도메인의 검증 함수는 재사용하고 범용 검증은 `lib/api/responseValidators.ts`를 사용한다.
- `*Api.ts`에는 URL·HTTP 메서드·요청 인자·AbortSignal 및 반환 타입을 명시한 요청 함수를 둔다. 공통 API 계층을 통해 응답을 받고 Validators를 호출한 뒤 반환한다. 요청한 공간 ID와 응답 공간 ID의 일치 검사처럼 요청 맥락에 따른 검사도 유지한다.
- `apiClient.request<unknown>`은 공통 응답 구조만 검증하므로 `body.data`는 도메인 Validators로 검사한다. 일반 data 반환에는 `readApiData`를 재사용할 수 있고, HTTP 상태·메타데이터가 필요한 요청은 `apiClient.request`의 결과를 유지한다. 타입 단언이나 제네릭만으로 검증을 대체하지 않으며 검증 실패는 `ApiError`의 `invalid-response`로 처리한다.
- 성공 HTTP 상태는 `apiClient`가 검사한다. 기본값은 200이며 생성 201·분석 접수 202 등은 도메인 Api 파일의 `expectedStatus`로 명시한다. 초대 참여처럼 복수 성공 상태만 계약상 허용되면 `[200, 201]`로 지정한다. `readApiData`도 같은 옵션을 전달하며, 2xx라는 이유만으로 완료 처리하지 않는다. 본문 없는 204에는 `requestEmpty`를 사용한다.
- 공통 계약은 `lib/api/apiTypes.ts`, 공통 응답·CSRF 검증은 `apiValidators.ts`, HTTP·세션·CSRF·오류 처리는 기존 공통 모듈이 담당한다. 도메인에서 Axios/fetch를 직접 호출해 이 처리를 우회하지 않는다. 본문 없는 204는 `requestEmpty`, 공통 응답으로 감싸지지 않는 CSRF 발급은 기존 전용 처리를 유지한다.
- Query 키·조회/변경 훅·캐시 무효화·화면용 데이터 변환은 `features/{domain}/model/`에 둔다. 페이지와 UI에서 DTO 검증이나 API 요청 구현을 중복하지 않는다.
- 신규 연동이나 BE 계약 변경 시 Types·Validators·Api 및 소비 코드를 함께 확인한다. 파일을 분리할 때 기존 검증 조건·오류 문구·세션 동작을 임의로 바꾸지 않는다. 로그아웃처럼 DTO·검증 함수가 필요 없는 경우 빈 Types/Validators 파일을 만들지 않는다.
- 호출 예시와 세션·오류 세부 규칙은 `src/lib/api/README.md`를 따른다.

## UI와 제품 기준

- 최신 Figma 상세 UI를 기준으로 구현한다.
- 기존 공통 컴포넌트, 토큰, Noto Sans KR, 로고와 아이콘을 우선 재사용한다.
- 휴대폰 중심으로 구현하고 화면 너비를 Figma의 390px에 고정하지 않는다.
- 비활성, 로딩, 오류 등 필요한 상태와 키보드 접근성을 확인한다.
- 업무 화면은 실제 API 응답을 사용한다. 빈 목록·로딩·오류는 실제 상태대로 표시하며 예시 데이터, 타이머, 메모리 저장소로 성공이나 결과를 대신하지 않는다. 신규 미연동 기능이 필요하면 준비 상태를 명시하고 Mock 업무 경로를 되살리지 않는다.
- `.env.production`은 실제 API(`https://api.hanmaum.site`)와 QA false를 기본으로 한다. Mock 활성화 환경 변수는 사용하지 않는다. 표현 검증용 예시 데이터는 로컬 전용 `/_dev/components` 안에 두고 업무 화면이나 실제 Query 캐시에 연결하지 않는다. 랜딩의 서비스 사용 예시는 소개 콘텐츠로 유지한다.
- 로그인 상태는 `useSession`과 `SessionBoundary`에서 관리한다. 401 UNAUTHENTICATED는 세션 정리, 403은 권한/CSRF 실패로 구분하며 변경 요청을 자동 재전송하지 않는다. OAuth 복귀는 `/auth/callback`에서 `/me`를 확인하고 저장된 내부 경로 또는 기존 공간 조회 훅으로 이동한다.
- QA 도구는 로컬·배포 모두 기본 숨김이며 `qa=1`로 켜고 같은 탭에서 유지한다. `VITE_ENABLE_QA_TOOLS`가 true인 환경에서만 허용하고 운영 빌드에서는 false로 비활성화한다. QA 종료 동작은 유지하며 실제 응답·권한·업무 상태를 가짜 값으로 바꾸는 선택기를 추가하지 않는다.
- 구성원의 요청과 소유자의 최종 반영을 구분한다.
- 인증은 BE의 세션 쿠키·CSRF 계약을 따르며 임의의 JWT 방식을 도입하지 않는다.

## 이슈와 브랜치

- 코드 변경 작업은 관련 이슈를 확인하고 이슈 단위 브랜치에서 진행한다.
- 관련 이슈가 있으면 재사용하며 같은 작업의 이슈를 중복 생성하지 않는다.
- 단순 질문이나 읽기 전용 조사에는 이슈와 브랜치 생성을 강제하지 않는다.
- 이슈와 PR의 Assignee는 대상 저장소의 GitHub 호스트에 GitHub CLI(gh)로 로그인된 활성 계정으로 설정한다.
- 사용자가 담당자를 별도로 지정한 경우 해당 지시를 따른다.
- 이슈와 PR에 작업 성격에 맞는 Label을 설정한다.
- 기본적으로 최신 dev에서 분기한다.
- 스택 PR 작업에서는 합의한 부모 브랜치에서 분기한다.
- dev와 main에 직접 커밋하거나 푸시하지 않는다.
- 한 이슈와 브랜치에는 하나의 응집된 작업 범위를 담는다.

### 형식과 예시

- 타입: feat, fix, chore, docs, refactor, style
- 아래 이슈 번호 123은 형식 설명을 위한 예시다.
- 이슈 제목: [Type] 작업 내용
  - 예: [Feat] 로그인 UI 구현
  - Label 예: feature
- 브랜치명: type/이슈번호-작업명
  - 예: feat/123-login-ui
  - 작업명은 영어 소문자와 하이픈을 사용한다.

## 커밋

- 의미 있는 작업 단위가 완료되고 해당 변경을 검증한 시점에 커밋한다.
- 전체 이슈가 끝날 때까지 모든 변경을 하나의 커밋으로 미루지 않는다.
- 관련 변경만 스테이징하고 기존 lint-staged와 포맷팅 설정을 따른다.
- 제목은 type: 작업 내용 (#이슈번호) 형식을 사용한다.
- 예: feat: 소셜 로그인 버튼 구현 (#123)
- 본문에는 변경 이유와 주요 구현 내용, 검증 결과를 설명한다.

## Pull Request

- 푸시와 PR 생성은 사용자가 요청한 범위와 시점에 진행한다.
- 일반 PR의 base는 dev, 스택 PR의 base는 합의한 부모 브랜치로 설정한다.
- 별도 요청이 없으면 리뷰 가능한 일반 PR로 생성한다.
- 제목은 Type(#이슈번호): 핵심 작업 내용 형식을 사용한다.
- 예: Feat(#123): 로그인 UI 구현
- 제목과 본문의 설명 문장은 명사형으로 작성한다.
- 저장소 PR 템플릿을 기준으로 관련 이슈, 변경 내용, 검증 결과를 작성한다.
- 스크린샷이 리뷰에 도움이 되는 UI 변경에는 첨부하고, 불필요한 영역은 생략한다.
- 실행하지 않은 검증을 완료로 표시하지 않는다.
- 리뷰어는 사용자가 지정한 경우에 설정한다.
- dev 머지는 팀원 1명 이상의 승인과 저장소의 필수 검사를 충족해야 한다.
- PR 생성 요청만으로 머지까지 진행하지 않는다.

## 검증과 결과 보고

- 변경한 동작에 필요한 검증을 수행한다.
- 코드 변경 완료 시 pnpm check와 pnpm build를 실행한다.
- 문서만 변경한 경우에는 관련 포맷과 내용 검증으로 범위를 조정한다.
- UI 변경은 모바일 화면, 키보드 조작, 필요한 상태별 표시를 확인한다.
- 결과에는 주요 변경, 실행한 검증, 미정 사항과 BE 의존성을 기록한다.
- 검증 결과는 PR 본문과 완료 보고에 정리하며, 이슈별 검증 Markdown과 스크린샷을 저장소에 기본적으로 생성하지 않는다. 별도 기록은 사용자가 요청하거나 복잡한 재현 절차를 지속해서 공유해야 할 때만 작성한다.
- 스크린샷은 UI 리뷰에 필요한 경우에만 PR에 첨부하며, README·공통 규격 문서는 팀원이 알아야 할 실행 방법이나 설정이 바뀔 때 갱신한다.
- Figma 기반 작업은 확인한 화면 또는 컴포넌트 ID를 함께 기록한다.

## 참고 문서

- 문서 위치와 읽는 순서는 ../docs/handoff/README.md에서 확인한다.
- 구조와 공통 규격 작업은 COMMON.md, FE.md, TOKENS.md를 참고한다.
- UI 작업은 FIGMA.md와 해당 Figma 상세 화면을 확인한다.
- 기능과 정책 작업은 FEATURES.md, DECISIONS.md, sources/notion-policy.md의 관련 부분을 확인한다.
- 위 문서명은 ../docs/handoff/ 기준이며 작업에 필요한 부분만 읽는다.
- 현재 레포의 구현과 공통 규격은 README.md, src/components/README.md, src/routes/README.md, src/styles/README.md, src/assets/README.md도 함께 참고한다. 이 경로들은 현재 레포 루트 기준이다.
- 공통 handoff에는 개발 초기 상태가 포함될 수 있으므로, 현재 구현 상태는 실제 코드와 현재 레포 문서로 재확인한다.
