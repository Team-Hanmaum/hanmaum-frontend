<p align="center">
  <img src="./src/assets/brand/hanmaum-symbol-login.svg" width="96" alt="한마음 로고" />
</p>

<h1 align="center">한마음 · Frontend</h1>

<p align="center">
  <strong>흩어진 소식은 하나로, 돌봄은 한마음으로</strong><br />
  가족이 남긴 소식을 AI가 정리하고, 확인한 일정과 할 일을 함께 관리하는 모바일 웹 서비스입니다.
</p>

<p align="center">
  <a href="https://hanmaum.site">서비스 바로가기</a> ·
  <a href="https://github.com/Team-Hanmaum/hanmaum-frontend">Frontend</a> ·
  <a href="https://github.com/Team-Hanmaum/hanmaum-backend">Backend</a> ·
  <a href="https://github.com/Team-Hanmaum/hanmaum-ai">AI</a>
</p>

---

**목차**

[프로젝트 소개](#프로젝트-소개) · [서비스 흐름](#서비스-흐름) · [시스템 구성](#시스템-구성) · [기술 스택](#기술-스택) · [데이터와 상태 관리](#데이터와-상태-관리) · [폴더 구조](#폴더-구조) · [화면과 라우팅](#화면과-라우팅) · [로컬 실행](#로컬-실행) · [개발 워크플로우](#개발-워크플로우) · [검증과 배포](#검증과-배포)

## 프로젝트 소개

한마음은 가족이 함께 부모님의 돌봄을 이어갈 수 있도록, 흩어진 소식과 확인한 돌봄 정보를 한 공간에 모읍니다. 가족이 남긴 소식을 AI가 분석해 변경 사항을 제안하고, 소유자가 검토한 내용을 일정·할 일·질문 등에 반영합니다.

이 저장소는 모바일 중심의 사용자 화면, 로그인·세션 처리, API 연동, 홈 화면 설치 안내를 담당합니다.

| 주요 기능        | 제공하는 경험                                                        |
| ---------------- | -------------------------------------------------------------------- |
| 함께 돌보는 공간 | Google·카카오 로그인, 공간 생성, 초대 링크로 가족 참여               |
| 소식과 AI 제안   | 소식 작성·분석 상태 확인, 제안 내용·근거 비교와 검토                 |
| 돌봄 관리        | 일정·할 일·질문 등 조회, 직접 추가·수정, 상태 변경과 답변            |
| 확인과 변경 이력 | 소유자의 최종 반영, 구성원의 승인 요청, 원본 삭제 영향과 근거 재확인 |
| 가족·공간 관리   | 구성원 관리, 소유권 이전, 나가기, 공간 정보 수정과 삭제              |
| 공유와 설치      | 돌봄 링크·카카오톡 공유, 권한 확인 후 조회, PWA 홈 화면 설치 안내    |

## 서비스 흐름

```text
로그인 → 공간 생성 또는 초대 참여 → 홈
  └─ 소식 작성 → AI 분석 → 제안·근거 검토
       ├─ 소유자: 최종 반영 또는 미적용
       └─ 구성원: 승인 요청 → 소유자 검토

최종 반영 → 홈·돌봄 목록·상세에서 변경된 정보 확인
```

돌봄 탭에서 직접 내용을 추가·변경할 때도 역할에 따라 최종 반영과 승인 요청을 구분합니다. AI 분석은 BE 워커가 요청하며, FE는 분석 상태와 생성된 제안을 조회합니다.

## 시스템 구성

> **시스템 아키텍처 이미지 추가 예정**
>
> FE·BE·AI와 데이터 저장소의 연결 구조를 이 위치에 배치합니다.

<!-- 이미지 삽입 위치: hanmaum-docs/assets/development/system-architecture.png. 이미지 게시 후 GitHub에서 접근 가능한 주소 또는 이 저장소의 상대 경로로 삽입합니다. -->

| 저장소                                                       | 역할                                                             |
| ------------------------------------------------------------ | ---------------------------------------------------------------- |
| [Frontend](https://github.com/Team-Hanmaum/hanmaum-frontend) | React 모바일 웹, 화면·라우팅·상태 관리, BE API 연동, Vercel 배포 |
| [Backend](https://github.com/Team-Hanmaum/hanmaum-backend)   | 인증·세션·권한, 돌봄 업무 API, 데이터 저장, AI 분석 작업 실행    |
| [AI](https://github.com/Team-Hanmaum/hanmaum-ai)             | 소식 분석과 구조화된 돌봄 제안 생성                              |

FE의 API 요청 대상은 `https://api.hanmaum.site`입니다. AI 서비스와 모델 호출은 BE가 담당합니다.

## 기술 스택

| 영역      | 기술                                                | 사용 목적                                      |
| --------- | --------------------------------------------------- | ---------------------------------------------- |
| UI        | React 19 · TypeScript 6                             | 컴포넌트 기반 화면과 타입 정의                 |
| 빌드      | Vite 8                                              | 개발 서버, 번들링, 환경별 설정                 |
| 라우팅    | React Router 8 · Data 모드                          | 중첩 라우트, 레이아웃, 로그인 복귀와 화면 전환 |
| 서버 상태 | TanStack Query 5                                    | 조회·변경 상태, 커서 목록, 캐시 갱신           |
| HTTP      | Axios                                               | 공통 응답·오류 처리, 세션 쿠키·CSRF 연동       |
| 스타일    | Tailwind CSS 4 · CSS 토큰 · Noto Sans KR            | 공통 디자인과 모바일 레이아웃                  |
| 품질 관리 | ESLint · Prettier · Husky · lint-staged             | 정적 검사, 포맷, 커밋 전 검사                  |
| 실행·배포 | Node.js 24 · pnpm 10.18.2 · GitHub Actions · Vercel | 개발 환경과 PR 검사·배포                       |

설치 기능은 Web App Manifest와 브라우저별 안내로 구성합니다. 현재 서비스 워커·오프라인 데이터 캐시·푸시 알림은 제공하지 않습니다. 자세한 동작은 [PWA 안내](docs/pwa.md)를 참고하세요.

## 데이터와 상태 관리

| 상태           | 관리 위치                        | 기준                                                      |
| -------------- | -------------------------------- | --------------------------------------------------------- |
| 서버 데이터    | 도메인 Query 훅 · TanStack Query | 계정·공간별 키로 조회하고, 변경 성공 후 관련 캐시 갱신    |
| 인증·세션      | `SessionProvider` · `useSession` | BE 세션 확인, 계정 변경·로그아웃 시 이전 요청과 캐시 정리 |
| 폼·화면 상태   | React 상태 · 도메인 훅           | 입력, 모달, 선택 상태를 필요한 화면 범위에서 관리         |
| 제안 검토 초안 | 계정·공간별 Query 캐시           | 검토 중 초안 유지, 서버 확정 데이터·영구 저장과 구분      |
| 탐색 상태      | URL 경로·검색 매개변수           | 목록 필터, 선택 화면, 탈퇴 정리 흐름의 복귀 위치 유지     |

API 코드는 도메인별로 역할을 나눕니다.

```text
pages / features의 UI
  → model: Query 훅 · 캐시 키 · 화면용 데이터 변환
  → api: *Api.ts 요청 함수 + *Validators.ts 응답 검증
  → lib/api: 공통 HTTP · 응답 · 오류 · 세션 · CSRF 처리

*Types.ts: 요청·응답 DTO 정의
```

공통 계층에서 성공 HTTP 상태와 응답 구조를 검사하고, 도메인 검증기가 실제 필드와 허용 값을 확인합니다. 인증은 BE의 HttpOnly 세션 쿠키를 사용하며, 변경 요청에는 공통 계층이 CSRF 토큰을 붙입니다.

탭 복귀 시 기존 화면과 입력을 유지하면서 필요한 세션 확인을 진행합니다. 업무 화면은 실제 API 결과를 사용하고 빈 상태·오류를 그대로 표시합니다. 상세 계약과 캐시 규칙은 [API·세션 규격](src/lib/api/README.md)을 따릅니다.

## 폴더 구조

주요 폴더와 진입 파일을 기준으로 정리했습니다.

```text
hanmaum-frontend/
├── .github/
│   ├── ISSUE_TEMPLATE/         # 이슈 작성 양식
│   ├── workflows/              # PR 검사 · Production 배포
│   └── pull_request_template.md
├── docs/                       # 로컬 환경 · 배포 · PWA · 개발 규칙
├── public/                     # 매니페스트 · 설치 아이콘 · 정적 파일
├── scripts/                    # 로컬 HTTPS 환경 설정
├── src/
│   ├── assets/                 # 로고 · 아이콘 · 이미지
│   ├── components/             # 도메인에 의존하지 않는 공통 UI
│   │   ├── ui/                 # 버튼 · 입력 · 카드
│   │   ├── layout/             # 공통 페이지 구성
│   │   ├── feedback/           # 안내 · 오류 · 모달
│   │   └── pwa/                # 설치 안내 · 설치 상태 배너
│   ├── features/               # 업무 도메인별 기능
│   │   ├── auth/               # 로그인 · 세션 · 로그아웃
│   │   ├── careitem/           # 돌봄 항목 · 근거 · 이력 · 변경
│   │   ├── carespace/          # 공간 · 가족 · 초대 · 소유권
│   │   ├── dashboard/          # 홈 현황판
│   │   ├── proposal/           # AI 제안 · 검토 · 승인 요청
│   │   ├── record/             # 소식 · 분석 상태 · 원본 삭제
│   │   │   ├── api/            # 요청 함수 · DTO · 응답 검증
│   │   │   ├── model/          # Query 훅 · 상태 · 데이터 변환
│   │   │   └── ui/             # 소식 도메인 UI
│   │   ├── sharing/            # 공유 링크 · 카카오톡 공유
│   │   └── user/               # 내 정보 · 회원 탈퇴
│   ├── pages/                  # 화면 영역별 페이지 조합
│   │   ├── account/            # 내 계정 · 로그아웃 · 탈퇴
│   │   ├── all/                # 전체 메뉴
│   │   ├── care/               # 돌봄 목록 · 상세 · 근거 · 이력
│   │   │   ├── change/         # 직접 추가 · 수정 · 상태 · 답변 · 삭제
│   │   │   └── share/          # 공유 발급 · 공유 항목 조회
│   │   ├── component-preview/  # 로컬 개발 전용 UI 전시
│   │   ├── error/              # 404 · 라우트 오류
│   │   ├── family/             # 가족 목록 · 관리
│   │   ├── home/               # 홈 현황
│   │   ├── landing/            # 서비스 소개
│   │   ├── login/              # 로그인 · OAuth 복귀
│   │   ├── news/               # 소식 작성 · 상세 · 삭제
│   │   ├── onboarding/         # 시작 안내
│   │   ├── proposal/           # 제안 검토 · 요청 · 결과
│   │   └── space/              # 공간 선택 · 생성 · 정보 · 초대
│   ├── routes/
│   │   ├── layouts/            # 세션 · 공간 · 탭 등 라우트 경계
│   │   ├── Router.tsx          # 경로 등록 · 페이지 지연 로딩
│   │   └── paths.ts            # URL 생성 함수
│   ├── lib/
│   │   ├── api/                # 공통 API 클라이언트 · 오류 · CSRF
│   │   ├── query/              # QueryClient · Provider
│   │   └── pwa/                # 설치 이벤트 · 브라우저 상태
│   ├── styles/                 # 디자인 토큰 · 전역 스타일 · 전환 효과
│   ├── App.tsx                 # 공통 앱 화면 구성
│   └── main.tsx                # 앱 진입점 · Provider 연결
└── AGENTS.md                   # 코드 작성 · 작업 워크플로우 지침
```

`features`는 필요한 경우 `api / model / ui`로 나누고, `pages`는 관련 화면들을 같은 영역에 모읍니다. 공유 로직은 `features`, 범용 표현은 `components`에 둡니다. 폴더 구조가 URL을 자동으로 결정하지는 않습니다. [페이지·API 작성 규칙](AGENTS.md#코드-구조와-명명)을 참고하세요.

## 화면과 라우팅

공간 내부의 기본 경로는 `/spaces/:careSpaceId`이며, 홈·돌봄·소식·가족·전체의 다섯 탭을 공유합니다.

| 영역      | 주요 URL                                         | 연결되는 화면                          |
| --------- | ------------------------------------------------ | -------------------------------------- |
| 시작·인증 | `/`, `/login`, `/auth/callback`                  | 소개 → 소셜 로그인 → 세션 확인·복귀    |
| 공간      | `/spaces`, `/spaces/new`                         | 참여 공간 선택·생성 → 홈               |
| 초대·공유 | `/invitations/:invitationToken`, `/share/:token` | 로그인·권한 확인 → 참여 또는 항목 조회 |
| 홈        | `/spaces/:careSpaceId/home`                      | 가족·최근 소식·돌봄·변경 현황          |
| 소식·제안 | 공간 경로 아래 `news`, `proposals`               | 작성·분석 → 검토·요청 → 반영 결과      |
| 돌봄      | 공간 경로 아래 `care`                            | 목록·상세 → 추가·변경·근거·이력·공유   |
| 가족·전체 | 공간 경로 아래 `family`, `all`, `info`           | 가족 관리·전체 메뉴·공간 정보          |
| 내 계정   | `/account`                                       | 계정 확인·로그아웃·탈퇴 전 정리        |

`SessionBoundary`가 인증 상태를, `SpaceSessionLayout`·`SpaceLayout`이 공간과 접근 상태를 관리합니다. `TabLayout`은 다섯 탭을 구성하며, 작성·검토 등 하위 화면은 해당 흐름의 레이아웃을 사용합니다. 나가기·삭제 후 완료 화면을 유지하는 가족 관리 경로는 별도로 구성합니다.

로그인 복귀는 저장된 내부 주소를 우선합니다. 복귀 주소가 없으면 참여 공간이 한 곳일 때 홈으로, 0곳 또는 여러 곳일 때 공간 목록으로 이동합니다. 전체 경로와 뒤로가기·입력 유지·화면 전환 규칙은 [라우팅 문서](src/routes/README.md)에 정리했습니다.

## 로컬 실행

**필수 환경: Node.js 24.x · pnpm 10.18.2**

```sh
git clone https://github.com/Team-Hanmaum/hanmaum-frontend.git
cd hanmaum-frontend
pnpm install --frozen-lockfile
```

배포 BE와 연동하려면 [OS별 로컬 HTTPS 설정](docs/local-development.md#최초-1회-준비)에 따라 mkcert를 설치한 뒤, 최초 한 번 다음 명령을 실행합니다. Windows에서는 같은 계정의 관리자 PowerShell이 필요합니다.

```sh
pnpm setup:local
```

이후에는 일반 터미널에서 개발 서버를 실행합니다.

```sh
pnpm dev
```

- FE: [https://local.hanmaum.site:5173](https://local.hanmaum.site:5173)
- API: `https://api.hanmaum.site` — 실제 데이터를 사용하므로 테스트 계정·공간에서 확인합니다.
- `VITE_API_BASE_URL`에는 `/api`를 제외한 서버 주소를 설정합니다. 로컬 BE를 사용할 때는 [.env.example](.env.example)을 참고합니다.
- 카카오톡 공유에는 `VITE_KAKAO_JAVASCRIPT_KEY`와 SDK 도메인 등록이 필요합니다. [설정 방법](docs/deployment.md#카카오톡-돌봄-공유-설정-71)을 참고하세요.

로컬 공통 UI는 `/_dev/components`에서 확인할 수 있습니다. QA 도구는 `VITE_ENABLE_QA_TOOLS=true`인 환경에서 `?qa=1`로 켜며, 같은 탭에서 유지됩니다. QA 종료 또는 `?qa=0`으로 끌 수 있고, Production에서는 비활성화합니다.

## 개발 워크플로우

```text
이슈 생성 → 최신 dev에서 작업 브랜치 생성 → 구현·검증·커밋
  → dev 대상 PR → 코드 리뷰·필수 검사 → 머지 → Production 배포
```

| 항목   | 규칙                                  | 예시                              |
| ------ | ------------------------------------- | --------------------------------- |
| 이슈   | `[Type] 작업 내용` · 담당자·라벨 지정 | `[Feat] 소식 작성 연동`           |
| 브랜치 | `type/이슈번호-영문-작업명`           | `feat/123-record-create`          |
| 커밋   | `type: 작업 내용 (#이슈번호)`         | `feat: 소식 작성 API 연동 (#123)` |
| PR     | `Type(#이슈번호): 핵심 작업 내용`     | `Feat(#123): 소식 작성 API 연동`  |

작업 타입은 `feat`, `fix`, `chore`, `docs`, `refactor`, `style`을 사용합니다. `dev`·`main`에 직접 커밋하지 않고, 검증을 마친 의미 있는 단위로 커밋합니다. PR은 [템플릿](.github/pull_request_template.md)에 관련 이슈·변경 내용·검증 결과를 기록하며, `dev` 머지는 팀원 1명 이상의 승인과 필수 검사를 기준으로 합니다.

스택 PR의 base는 합의한 부모 브랜치를 사용합니다. 상세 협업 규칙은 [AGENTS.md](AGENTS.md), 파일 이름과 CI 운영 방법은 [개발 규칙](docs/development-workflow.md)을 참고하세요.

## 검증과 배포

```sh
pnpm check   # ESLint · Prettier · TypeScript 검사
pnpm build   # 타입 검사 · Production 번들 생성
```

> **CI/CD 이미지 추가 예정**
>
> PR 검사와 `dev` 머지 후 Vercel Production 배포 흐름을 이 위치에 배치합니다.

<!-- 이미지 삽입 위치: hanmaum-docs/assets/development/ci-cd.png. 이미지 게시 후 GitHub에서 접근 가능한 주소 또는 이 저장소의 상대 경로로 삽입합니다. -->

| 시점                      | 실행 내용                                                                      |
| ------------------------- | ------------------------------------------------------------------------------ |
| PR 생성·새 커밋·다시 열기 | GitHub Actions의 **Lint and build**: 의존성 설치 → `pnpm check` → `pnpm build` |
| 작업 브랜치 push          | Vercel Git 연동으로 Preview 배포                                               |
| `dev` push·PR 머지        | GitHub Actions에서 검사 → Vercel Production 빌드 → 빌드 결과 배포              |

Production 주소는 [hanmaum.site](https://hanmaum.site)입니다. `dev`의 Git 자동 배포는 제외해 Actions와의 중복 배포를 방지합니다. Preview에서 실제 인증·API를 확인하려면 BE의 허용 Origin과 로그인 복귀 설정도 맞아야 합니다. 환경 변수·Secrets·배포 절차는 [배포 문서](docs/deployment.md)를 참고하세요.
