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

## 최초 배포에서 실행한 검증

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

## 후속 변경: 배포 환경의 Mock 화면 이동

2026-10-04 사용자 요청으로 실제 휴대폰에서도 로그인 이후 화면을 확인할 수 있도록 배포용 Mock 이동을 허용했다. 위 최초 배포 기록의 버튼 비활성 정책을 대체하며 실제 인증·업무 데이터는 계속 미연동 상태다. 구현 커밋은 `d471718`이다.

- `.env.production`의 `VITE_ENABLE_MOCK_PREVIEW=true`와 `src/lib/mockPreview.ts`의 공통 판별 추가
- 로그인 → 시작 전 안내 → Mock 공간 둘러보기 → 공간 선택 → 다섯 탭 연결
- 실제 로그인·계정 생성·동의·공간 생성이 없다는 Mock 안내 유지
- 설정을 `false`로 바꾸면 로그인 버튼·핸들러 이동 차단 및 Mock 공간 링크 제외
- 공통 컴포넌트 갤러리와 갤러리 쿼리 이동은 계속 개발 모드 전용

### 로컬 검증 결과

| 항목               | 결과                                                                              |
| ------------------ | --------------------------------------------------------------------------------- |
| `pnpm check`       | ESLint·Prettier·TypeScript 통과                                                   |
| `pnpm build`       | 기본 Mock 활성 프로덕션 번들 빌드 통과                                            |
| Mock 비활성 빌드   | 프로세스 환경 변수 `VITE_ENABLE_MOCK_PREVIEW=false` 및 별도 출력 경로로 빌드 통과 |
| Google·카카오 버튼 | 두 제공사 각각 안내 화면 이동, 대기 중 두 버튼 비활성 확인                        |
| 키보드             | Google 버튼의 Enter 입력으로 이동 확인                                            |
| 후속 흐름          | 안내 시트 → Mock 공간 선택 → 예시 공간 1 → 다섯 탭 이동 확인                      |
| 모바일 너비        | 브라우저 320×740 및 390×844에서 확인, 로그인·안내·탭 화면의 가로 넘침 없음        |
| Mock 비활성 동작   | 로그인 버튼 비활성, 안내 시트와 공간 선택의 Mock 링크 제외 확인                   |
| 개발용 화면        | Mock 활성 프로덕션 번들의 `/_dev/components`에서 앱 404 확인                      |
| 콘솔               | 활성·비활성 빌드의 검증 중 error 없음                                             |
| 실제 인증·저장     | 변경 코드에 OAuth/API 요청·세션·쿠키·토큰·동의 기록 생성 없음 확인                |

검증에는 로컬 프로덕션 미리보기 서버를 사용했다. 브라우저의 모바일 너비 검증이며 실제 휴대폰 기기 테스트 완료를 의미하지 않는다. 기존 화면·컴포넌트의 스타일은 유지했고 새 Figma 조회는 하지 않았다. 관련 기존 화면은 HM-ON-A01·A02·A03, 기능 ID는 AUTH-01·02 및 SPACE-01·02·11이며 실제 기능 구현 완료는 아니다.

Mock 비활성 검증은 PowerShell에서 다음과 같이 재현한다. 별도 테스트 출력 경로는 Git에 포함하지 않는다.

```powershell
$env:VITE_ENABLE_MOCK_PREVIEW = 'false'
pnpm exec vite build --outDir dist/mock-disabled
Remove-Item Env:VITE_ENABLE_MOCK_PREVIEW
pnpm preview --outDir dist/mock-disabled --port 4174
```

Vercel Preview와 대표 Production 주소의 반영 여부는 해당 배포의 소스 커밋으로 확인한다. PR #15의 `dev` 머지는 팀 승인 절차를 따른다. BE 연동 시 Mock 설정 비활성화와 실제 OAuth·세션 쿠키·CSRF·공간 참여 권한 확인이 필요하다.
