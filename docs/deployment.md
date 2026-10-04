# Vercel 배포

현재 앱은 BE API를 연결하기 전의 UI 미리보기다. Vercel Preview와 Production 모두 `pnpm build`로 만든 프로덕션 번들을 사용한다. 실제 휴대폰에서 로그인 이후 화면을 확인할 수 있도록 `.env.production`의 공개 설정 `VITE_ENABLE_MOCK_PREVIEW=true`로 Mock 화면 이동을 활성화한다. 실제 인증·계정 생성·업무 API 요청은 발생하지 않으며 `/_dev/components`는 계속 로컬 개발 전용이다.

## Mock 화면 이동 설정

`src/lib/mockPreview.ts`의 `isMockPreviewEnabled`를 로그인과 안내·공간 선택 페이지에서 함께 사용한다.

| 실행 환경                                      | 설정                                                | 동작                                            |
| ---------------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| 로컬 `pnpm dev`                                | 환경 변수 없음                                      | Mock 이동 활성화                                |
| Vercel Preview·Production 및 로컬 `pnpm build` | `.env.production`의 `VITE_ENABLE_MOCK_PREVIEW=true` | Mock 이동 활성화                                |
| 모든 환경                                      | `VITE_ENABLE_MOCK_PREVIEW=false`                    | 소셜 버튼·핸들러 이동 차단, Mock 공간 링크 제외 |

확인 경로는 랜딩 → 로그인 → 시작 전 안내 → 안내 확인하고 계속 → Mock 공간 둘러보기 → 예시 공간 1/2 → 홈·돌봄·소식·가족·전체다. 안내 확인은 동의 기록이나 공간 생성 완료가 아니며, 다섯 탭은 현재 공통 레이아웃을 확인하는 임시 화면이다.

Vercel 프로젝트에 같은 환경 변수를 직접 등록하면 저장소의 `.env.production`보다 우선한다. 빌드 시 결정되므로 설정 변경 후 새 배포가 필요하다. 이 파일에는 비밀 값이 아닌 화면 미리보기 설정만 저장하며, `VITE_` 변수에 비밀 키를 넣지 않는다.

실제 인증·업무 데이터 연결 전에는 저장소와 Vercel 환경 변수의 유효 값을 `false`로 맞추고 다시 빌드한다. 이 플래그는 Mock 화면 이동만 제어하며 공간 URL의 접근 권한을 검증하지 않는다. 실제 데이터는 BE의 세션·참여 권한 확인을 연결한 후 사용한다. API 응답 Mock·MSW·도메인 fixture 구성은 별도 이슈 #12 범위다.

## 최초 배포 기록

- 배포 주소: [hanmaum-frontend.vercel.app](https://hanmaum-frontend.vercel.app/)
- Vercel 프로젝트: [Hanmaum / hanmaum-frontend](https://vercel.com/hanmaum1/hanmaum-frontend)
- 최초 배포일: 2026-10-04
- 최초 배포 소스: `chore/14-vercel-deployment`의 `041d72c`
- 방식: 승인된 프로젝트 계정의 CLI로 첫 Production 배포, GitHub 저장소 연결 완료
- 자동 Production 배포 대상: `dev`로 설정 완료
- 설정 반영 PR: [#15](https://github.com/Team-Hanmaum/hanmaum-frontend/pull/15). 최초 배포 시점에는 승인·머지 대기 상태이며, 팀 검토 후 `dev`에 반영하는 절차

첫 배포는 `dev`의 앱 코드에 이 PR의 배포 설정을 더한 커밋을 사용했다. 아직 설정 PR이 반영되지 않은 `dev` 커밋을 다시 배포하면 SPA rewrite가 누락될 수 있으므로, `dev` 자동 배포는 PR #15 반영 후 기준으로 사용한다. [배포 검증 기록](verification/issue-14.md) 참조.

## 프로젝트 설정

| 항목             | 값                                                      |
| ---------------- | ------------------------------------------------------- |
| GitHub 저장소    | `Team-Hanmaum/hanmaum-frontend`                         |
| Root Directory   | 저장소 루트 (`./`)                                      |
| Framework Preset | Vite                                                    |
| Node.js          | `24.x` — `package.json`의 `engines.node` 기준           |
| 패키지 매니저    | `pnpm@10.18.2` — `package.json`의 `packageManager` 기준 |
| Install Command  | 자동 감지 — 아래 Corepack 환경 변수 설정 필요           |
| Build Command    | `pnpm build`                                            |
| Output Directory | `dist`                                                  |
| 초기 배포 기준   | 현재 앱이 포함된 `dev`                                  |

Vercel 프로젝트의 Preview와 Production 환경에 `ENABLE_EXPERIMENTAL_COREPACK=1`을 추가한다. 이 값은 빌드 도구 선택용이며 비밀 값이 아니다. Corepack이 `packageManager`의 pnpm 버전을 사용하도록 하여 로컬·배포 버전을 맞춘다. 저장소의 `pnpm-lock.yaml`을 유지하고 빌드 로그에서 사용 버전을 확인한다.

빌드 명령·출력 경로·SPA rewrite는 루트 `vercel.json`에서 관리한다. Vercel의 Production Branch는 대시보드 설정이며 파일에 포함되지 않는다. 현재 `main`에는 앱 코드가 없으므로 최초 프로젝트 설정 시 `dev`를 기준으로 확인한다. 추후 `main`으로 전환할 때는 앱 코드와 배포 설정이 먼저 반영되어 있어야 한다.

## 연결과 배포 절차

1. 프로젝트를 관리할 Vercel 계정에 로그인한다.
2. `Team-Hanmaum`의 소유자 또는 해당 레포 접근 권한이 있는 멤버의 GitHub 계정을 연결하고, Vercel GitHub App의 대상 레포 접근 권한을 설정한다.
3. 기존 Vercel 프로젝트 유무를 확인한 뒤 저장소를 Import한다. 위 빌드 설정과 Corepack 환경 변수를 확인한다.
4. 배포할 커밋에 `vercel.json`이 포함되어 있는지 확인한다. PR 승인·머지 전 설정은 해당 작업 브랜치의 배포로 검증하며 `dev`나 `main`에 직접 커밋하지 않는다.
5. 빌드 성공 후 배포 URL에서 아래 항목을 검증한다. Git 연결을 통한 자동 배포 기준은 프로젝트의 Production Branch 및 Preview 설정을 확인한다.

CLI를 사용하는 경우에도 먼저 로그인 계정과 프로젝트 소유 범위를 확인한다. 로컬 프로젝트 연결 정보인 `.vercel/`은 Git에 포함하지 않는다. 배포 토큰이나 계정 인증 정보를 저장소에 저장하지 않는다.

## 검증

```sh
pnpm check
pnpm build
```

- `/` 랜딩 표시 및 시작하기 버튼의 `/login` 이동
- `/login`, `/onboarding/guide`, `/spaces/example/home` 직접 접속·새로고침
- 파비콘·로고·폰트·JS·CSS 정적 파일의 정상 응답
- 잘못된 주소에서 앱의 404 화면 표시
- `/_dev/components` 접근 시 앱의 404 화면 표시
- 소셜 로그인 버튼 활성, 두 제공사의 로딩·중복 클릭 차단 및 `/onboarding/guide` 이동
- 안내 시트의 Mock 공간 둘러보기 → 예시 공간 선택 → 다섯 탭 이동
- Mock 안내 유지 및 실제 OAuth/API 요청 미발생
- `VITE_ENABLE_MOCK_PREVIEW=false` 별도 빌드에서 소셜 버튼·핸들러 이동 차단 및 Mock 공간 링크 제외

SPA rewrite는 브라우저가 직접 요청한 페이지 경로에도 `index.html`을 제공한다. 실제 화면과 알 수 없는 경로의 404 표시는 React Router에서 처리하므로 앱의 404 화면과 HTTP 404 상태 코드는 구분한다.

## BE 연동 시 확인할 사항

- 실제 API 주소 및 개발·운영 환경 구분
- 배포 도메인의 CORS 허용, 세션 쿠키 속성과 CSRF 처리 계약
- Google·카카오 OAuth의 콜백 및 성공·실패 후 이동 주소
- 실제 세션·공간 참여 권한 검증과 로그인 버튼 연결
- 개인정보 동의·공간 생성 등 후속 업무 API

현재 배포에는 실제 인증이나 업무 데이터 처리를 추가하지 않는다. API 주소나 OAuth 비밀 키를 임의로 등록하지 않으며 브라우저에 공개되는 `VITE_` 환경 변수에 비밀 값을 넣지 않는다. 사용자 도메인과 OAuth 콘솔 설정은 관련 계약이 정해진 뒤 연결한다.

## 공식 참고

- [Vite SPA 배포](https://vercel.com/docs/frameworks/frontend/vite#using-vite-to-make-spas)
- [Corepack 빌드 설정](https://vercel.com/docs/builds/configure-a-build#corepack)
- [Git 배포와 Production Branch](https://vercel.com/docs/git)
- [GitHub Organization 연결 권한](https://vercel.com/docs/git/vercel-for-github#organization-repositories)
