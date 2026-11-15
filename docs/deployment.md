# 배포

| 구분             | 주소                               |
| ---------------- | ---------------------------------- |
| 운영 FE          | https://hanmaum.site               |
| 운영 API         | https://api.hanmaum.site           |
| 로그인 성공 복귀 | https://hanmaum.site/auth/callback |

## CI와 배포

| 시점                      | 실행                                                                                |
| ------------------------- | ----------------------------------------------------------------------------------- |
| PR 생성·새 커밋·다시 열기 | GitHub Actions **Lint and build**: 의존성 설치 → `pnpm check` → `pnpm build`        |
| 작업 브랜치 push          | Vercel Git 연동으로 Preview 배포                                                    |
| `dev` push·PR 머지        | GitHub Actions에서 검사 → `vercel build --prod` → `vercel deploy --prebuilt --prod` |

- 워크플로우: [ci.yml](../.github/workflows/ci.yml), [deploy.yml](../.github/workflows/deploy.yml).
- PR 검사는 base와 무관하게 실행한다. base만 바꾸면 실행되지 않으므로 새 커밋 push 또는 PR 다시 열기로 재검사한다.
- 같은 PR의 이전 검사 실행은 취소하고 최신 커밋을 검사한다. 필수 검사·승인 조건은 GitHub Rulesets에서 관리한다.
- [vercel.json](../vercel.json)은 SPA rewrite와 `dev`의 Git 자동 배포 제외를 설정한다. Production은 Actions로 배포하며 검사·빌드가 실패하면 배포하지 않는다.

## 환경 설정

Node.js **24.x**, pnpm **10.18.2**, Vercel 프로젝트의 Production Branch는 **dev**, 빌드 명령은 `pnpm build`, 출력 폴더는 `dist`를 사용한다.

| 설정 위치              | 이름                                 | 값·용도                            |
| ---------------------- | ------------------------------------ | ---------------------------------- |
| Vercel                 | `VITE_API_BASE_URL`                  | `https://api.hanmaum.site`         |
| Vercel                 | `VITE_ENABLE_QA_TOOLS`               | Production은 `false`               |
| Vercel                 | `VITE_KAKAO_JAVASCRIPT_KEY`          | 카카오톡 공유용 공개 JavaScript 키 |
| Vercel                 | `ENABLE_EXPERIMENTAL_COREPACK`       | `1` — 프로젝트의 pnpm 버전 사용    |
| GitHub Actions Secrets | `VERCEL_TOKEN`                       | Vercel 배포 토큰                   |
| GitHub Actions Secrets | `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | 연결한 Vercel 프로젝트 식별자      |

Vercel 환경 변수는 저장소의 `.env.production`보다 우선하며 변경 후 재빌드가 필요하다. `VITE_` 값은 브라우저에 공개되므로 OAuth 비밀 키·배포 토큰을 넣지 않는다. Actions는 `vercel pull`로 Production 설정을 가져온다.

## 로그인·API 연결

- BE CORS는 정확한 FE Origin과 credentials 요청을 허용해야 한다. 운영 로그인 성공 복귀 주소는 위 `/auth/callback`을 사용한다.
- 공급자 콜백은 BE의 `/login/oauth2/code/google`·`/login/oauth2/code/kakao`이며 FE 콜백과 구분한다.
- 로컬 FE의 HTTPS·OAuth 복귀 설정은 [로컬 개발](local-development.md)을 따른다. Preview에서 실제 API를 사용하려면 해당 Origin과 복귀 경로도 BE에서 지원해야 한다.
- 세션·CSRF·응답 처리는 [공통 API 규격](../src/lib/api/README.md)을 따른다. 현재 OAuth 실패는 BE의 JSON 오류 응답이다.

## 카카오톡 공유

1. 카카오디벨로퍼스의 한마음 앱에서 **JavaScript 키**를 확인한다. 로컬 `.env.development.local`과 Vercel에 `VITE_KAKAO_JAVASCRIPT_KEY`를 설정한다.
2. **JavaScript SDK 도메인**에 `https://hanmaum.site`, `https://local.hanmaum.site:5173`을 등록한다.
3. **제품 링크 관리 → 웹 도메인**에 `https://hanmaum.site`을 등록한다. 공유 링크는 `https://hanmaum.site/share/{token}`을 사용한다.
4. 로컬은 개발 서버 재시작, 배포 환경은 재빌드 후 확인한다. 로컬 수신 화면을 확인할 때는 발급된 링크의 Origin만 로컬 FE 주소로 바꾼다.

키나 SDK를 사용할 수 없으면 링크 복사를 제공한다. 공유 카드에는 항목 유형·변경 여부·링크만 전달하며, 카카오톡 실행·복귀를 전송 완료로 표시하지 않는다.

## 배포 후 확인

- Google·카카오 로그인 → FE 콜백 → 공간 선택·홈, 로그아웃·재로그인
- 실제 공간의 상세 URL 직접 접속·새로고침, 잘못된 주소의 404
- 로고·폰트·버튼 스타일과 공유 링크 조회
- Production의 `/_dev/components` 404 및 QA 도구 비노출
- Android·iOS의 [PWA 설치와 실행](pwa.md)
