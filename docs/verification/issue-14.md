# 이슈 #14 배포 검증

검증일: 2026-10-04. 이슈: [#14](https://github.com/Team-Hanmaum/hanmaum-frontend/issues/14), PR: [#15](https://github.com/Team-Hanmaum/hanmaum-frontend/pull/15).

## 배포 대상

- 계정 범위: Hanmaum (`hanmaum1`)
- 프로젝트: `hanmaum-frontend`
- Git 저장소: `Team-Hanmaum/hanmaum-frontend`
- 첫 배포 커밋: `041d72c4c28cad3dd0ab9b8098ce8c43e0774a1f`
- 브랜치: `chore/14-vercel-deployment`
- 배포 상세: [Vercel Deployment](https://vercel.com/hanmaum1/hanmaum-frontend/HFzzurgBvcS2TY9joERNQsYo4L5T)
- 공개 주소: [hanmaum-frontend.vercel.app](https://hanmaum-frontend.vercel.app/)
- 상태: Production / Ready
- Production Branch: `dev` 저장 완료 확인

## 실행한 검증

| 항목                             | 결과                                                                      |
| -------------------------------- | ------------------------------------------------------------------------- |
| 로컬 `pnpm check`                | ESLint·Prettier·TypeScript 통과                                           |
| 로컬 `pnpm build`                | Node.js 24.21.0에서 Vite 운영 빌드 통과                                   |
| `git diff --check`               | 통과                                                                      |
| `.vercel/project.json` 추적 제외 | `git check-ignore`로 확인                                                 |
| Vercel 원격 빌드                 | Node.js 24.x 설정 및 pnpm 10.18.2 사용, 빌드 성공 확인                    |
| Corepack                         | Preview·Production의 `ENABLE_EXPERIMENTAL_COREPACK` 등록 확인             |
| 공개 HTTP 접근                   | 로그인 세션 없는 요청으로 루트·로그인·온보딩·공간별 다섯 탭 HTML 200 확인 |
| 정적 자산                        | JS·CSS·파비콘 HTTP 200 및 적절한 Content-Type 확인                        |
| 랜딩                             | 로고·한글 화면 표시, 시작하기 버튼의 `/login` 이동 확인                   |
| 직접 진입·새로고침               | `/login`, `/onboarding/guide`, `/spaces/example/home` 브라우저 표시 확인  |
| 로그인 Mock 제한                 | 실제 로그인 미연동 안내 및 Google·카카오 버튼 비활성 확인                 |
| 개발용 화면 제외                 | `/_dev/components`에서 앱의 404 화면 표시 확인                            |
| 잘못된 경로                      | `/not-a-page`에서 앱의 404 화면 표시 확인                                 |
| 런타임 오류                      | 위 브라우저 검증 중 수집된 콘솔 error 없음                                |

SPA fallback 특성상 잘못된 경로와 `/_dev/components`도 HTML 요청은 200이며, 라우터가 앱의 404 화면을 표시한다. 실제 기기별 전체 UI 회귀 테스트나 BE 연동 검증 완료를 의미하지 않는다.

## 변경 범위와 남은 항목

배포 설정·문서만 변경하고 기존 공통 UI·디자인·라우팅 및 Mock 제한을 유지했다. 새 Figma 조회나 기능 정책 확정은 없으며, 기존 화면 근거는 [이슈 #10 검증 기록](issue-10.md) 참조.

PR #15는 팀 승인·머지 절차를 거쳐 `dev`에 반영해야 한다. 현재 Production은 설정이 포함된 작업 브랜치 커밋을 CLI로 배포한 결과이며, PR의 머지를 대신하지 않는다.

실제 로그인, API 주소, CORS, 세션 쿠키·CSRF, OAuth 콜백 및 업무 데이터 권한 검증은 후속 BE 연동 범위다. 별도 도메인 구매·유료 요금제 변경·다른 레포 변경은 수행하지 않았다.
