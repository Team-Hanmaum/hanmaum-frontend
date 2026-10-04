# Vercel 배포

현재 앱은 BE API를 연결하기 전의 UI 미리보기다. Vercel Preview와 Production 모두 `pnpm build`로 만든 프로덕션 번들을 사용한다. 소셜 로그인 버튼, 개발용 로그인 이동, Mock 공간 진입 링크와 `/_dev/components`는 로컬 개발 모드에서만 사용할 수 있다.

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
- 소셜 로그인 버튼 비활성 및 실제 OAuth/API 요청 미발생
- 개발용 Mock 공간 링크 제외

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
