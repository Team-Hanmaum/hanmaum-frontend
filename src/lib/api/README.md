# 공통 API와 세션 관리

Axios는 HTTP, TanStack Query는 서버 상태와 메모리 캐시를 담당한다. 2026-11-08 배포 Swagger `https://api.hanmaum.site/v3/api-docs` 기준이다. AI 호출은 BE 워커가 담당하며 FE는 AI에 직접 요청하지 않는다.

## 실행 설정

`.env.example`을 `.env.development.local`로 복사해 로컬 BE 주소를 지정한다. FE와 BE의 호스트를 localhost로 통일하고 FE Origin을 BE CORS에 등록한다. 배포 BE에 연결하려면 `pnpm setup:local`을 사용한다.

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_MOCK_PREVIEW=false
```

- `VITE_API_BASE_URL`은 `/api` 없이 서버 Origin만 지정한다. 미설정·잘못된 주소는 configuration 오류이며 localhost 기본값으로 대체하지 않는다.
- `VITE_*`는 공개 빌드 설정이다. OAuth 비밀키·세션·CSRF 토큰을 넣지 않는다.
- 앱 시작 시 `/api/users/me`로 실제 세션을 확인한다. 미연동 도메인의 메모리 예시와 인증 실행 모드는 별개다.
- `.env.production`은 `https://api.hanmaum.site`, Mock/QA false다. Vercel에 같은 이름의 변수가 있으면 그 값이 우선한다.
- 운영 BE의 기존 허용 Origin은 `https://hanmaum.site`다. 로컬 배포 API 연동은 [개발 환경 설정](../../../docs/local-development.md)을 따르며 BE의 개발 Origin·OAuth 복귀 지원이 필요하다. localhost·Vercel 임시 주소를 임의로 허용하지 않는다. CORS 외에도 Secure/SameSite 쿠키 조건을 맞춰야 한다.

## 책임과 사용 위치

| 위치                                       | 책임                                                 |
| ------------------------------------------ | ---------------------------------------------------- |
| `lib/env.ts`                               | API Origin 검증                                      |
| `lib/api/httpClient.ts`                    | credentials, 15초 타임아웃, `/api/` 경로 제한        |
| `lib/api/apiClient.ts`                     | 공통 응답·204·변경 요청 CSRF 처리                    |
| `lib/api/apiTypes.ts`                      | 공통 응답·요청 옵션·오류·CSRF 타입                   |
| `lib/api/apiValidators.ts`                 | 공통 응답과 CSRF 응답의 런타임 검증                  |
| `lib/api/responseValidators.ts`            | 객체·문자열·건수·시각의 공용 검증 함수               |
| `lib/api/responseData.ts`                  | 공통 요청 후 도메인 검증을 거쳐 data 반환            |
| `lib/api/apiError.ts`                      | 오류 객체와 오류 정규화                              |
| `lib/api/csrf.ts`                          | CSRF 발급 공유·메모리 보관·초기화                    |
| `lib/api/apiSession.ts`                    | 요청 세대·취소·401 통지. 화면 이동에는 의존하지 않음 |
| `features/auth/model/sessionController.ts` | 세션 확인·만료·계정 변경·로그아웃의 단일 상태 관리   |
| `features/auth/ui/SessionProvider.tsx`     | 앱 진입·포커스 복귀·페이지 복원 시 세션 확인         |
| `features/auth/model/useSession.ts`        | 인증 상태를 사용하는 화면의 공통 진입점              |
| `features/{domain}/api/`                   | 경로·DTO·도메인 응답 검증                            |
| `features/{domain}/model/`                 | Query 키·조회·변경 훅                                |

공통 lib는 도메인·페이지·라우터를 import하지 않는다. 도메인 요청은 `@/lib/api`를 사용하며 httpClient 직접 호출로 CSRF·응답 처리를 우회하지 않는다. 로그인 상태는 `useSession`, 내 정보의 독립 조회는 `useMe`, 로그아웃은 세션 컨트롤러에 연결된 `useLogout`을 사용한다.

## 도메인 API 파일 구성

같은 기능의 타입·검증·요청은 동일한 접두사의 파일로 구분한다. 현재 공간 목록/생성은 `careSpace*`, 공간 상세/구성원은 `spaceDetail*`, 홈 현황판은 `dashboard*`, 소식 조회는 `recordRead*`, 내 정보는 `user*`로 구성한다.

```text
features/carespace/
├─ api/
│  ├─ careSpaceTypes.ts        # 요청·응답 DTO
│  ├─ careSpaceValidators.ts   # 응답 data의 순수 검증 함수
│  ├─ careSpaceApi.ts          # 요청과 검증 호출
│  ├─ spaceDetailTypes.ts
│  ├─ spaceDetailValidators.ts
│  └─ spaceDetailApi.ts
└─ model/                     # Query 키·훅·화면용 변환
```

- Types는 type/interface만 정의하고 소비 파일은 `import type`으로 직접 참조한다. Api에서 타입을 다시 export하지 않는다.
- Validators는 Types와 공용 검증 함수를 사용하며 네트워크 요청, React 상태, 캐시를 다루지 않는다. 검증 결과는 형식의 유효성이지 실제 업무 내용의 정확성을 보장하는 것은 아니다.
- Api는 경로·메서드·요청 값·AbortSignal을 전달하고 검증을 통과한 결과를 반환한다. 요청 공간과 응답 공간의 ID 비교도 유지한다.
- DTO를 UI 모델로 바꾸는 작업과 Query 캐시 관리는 model에 둔다. 화면에서는 훅과 변환 결과를 사용한다.
- 204 로그아웃처럼 별도 데이터 타입·검증이 없는 기능은 빈 파일을 만들지 않는다. [저장소 API 파일 규칙](../../../AGENTS.md#api-파일-규칙)을 함께 따른다.

## 응답과 오류

업무 응답은 `success/code/message/data/errors/timestamp` 여섯 필드다. 실패 data는 null, errors는 `{field, reason}[]`다. `apiClient.request<T>`는 `{status, body}`를 반환하며 도메인 함수가 body.data의 런타임 형태도 확인한다. 제네릭 타입만으로 서버 데이터가 검증되지는 않는다.

```ts
// careSpaceApi.ts: 공통 응답 검사 후 data를 도메인 규격으로 검사한다.
import { apiClient, ApiError } from "@/lib/api";
import type { CareSpaceSummary } from "./careSpaceTypes";
import { isCareSpaceListResponse } from "./careSpaceValidators";

export async function getCareSpaces(
  signal?: AbortSignal,
): Promise<CareSpaceSummary[]> {
  const result = await apiClient.request<unknown>("/api/spaces", { signal });
  if (!isCareSpaceListResponse(result.body.data)) {
    throw new ApiError({
      kind: "invalid-response",
      status: result.status,
      message: "참여 공간 목록 응답 형식을 확인할 수 없습니다.",
    });
  }
  return result.body.data.items;
}
```

`readApiData(path, validator, options)`는 위 요청·data 검증을 재사용하는 공통 헬퍼다. 검증 실패 시 일반 응답 오류 문구를 사용한다. 도메인별 오류 문구나 HTTP 상태·메타데이터가 필요하면 위 예시처럼 `apiClient.request<unknown>`과 검증 함수를 직접 조합한다. 타입·검증·요청의 파일 분리 규칙은 두 방식 모두 동일하다.

성공 HTTP 상태도 공통 클라이언트에서 검사한다. `expectedStatus`의 기본값은 200이며 도메인 요청에서 계약상 다른 상태를 명시한다. 허용되지 않은 2xx는 `invalid-response`로 처리해 데이터 형태가 같아도 성공 이동·캐시 갱신을 하지 않는다. 4xx/5xx의 기존 `status/code/errors` 처리와 변경 요청 자동 재시도 금지는 유지한다.

| 요청                                     | 허용 성공 상태                                |
| ---------------------------------------- | --------------------------------------------- |
| 내 정보·공간·가족·홈·소식·분석·초대 조회 | 200 (기본값)                                  |
| 공간·소식·초대 생성                      | `expectedStatus: 201`                         |
| 분석 재시도 접수                         | `expectedStatus: 202` (완료 아님)             |
| 초대 참여                                | `expectedStatus: [200, 201]` (기존/신규 참여) |
| 로그아웃                                 | `requestEmpty`의 204                          |
| 로그인 준비·CSRF 발급                    | 별도 CSRF 응답 검증의 200                     |

- 204는 `requestEmpty`로 처리한다. 로그아웃은 `POST /api/auth/logout`의 본문 없는 204다.
- CSRF는 예외적으로 `GET /api/auth/csrf`의 원시 `{headerName, token}`을 읽는다.
- OAuth는 브라우저 전체 이동 `/oauth2/authorization/google|kakao`다. Axios 요청이 아니다.
- 로그인 버튼을 누르면 먼저 같은 Origin의 Web Lock 안에서 `GET /api/auth/csrf`를 새로 요청해 세션 쿠키 준비를 기다린 뒤 OAuth 주소로 이동한다. 이 준비 토큰은 메모리 캐시에도 보관하지 않으며 로그인 후 첫 변경 요청에서 다시 발급한다. 준비 실패 시 OAuth 이동을 진행하지 않는다.
- ID는 문자열, 공개 버전은 십진 문자열, 시각은 UTC ISO 8601로 유지한다. 202 접수를 업무 완료로 처리하지 않는다.
- `ApiError`는 kind/status/code/message/errors/timestamp를 유지한다. HTTP·network·timeout·cancelled·invalid-response·configuration·unknown을 구분하고 원문·쿠키·토큰·Axios 설정을 오류에 넣지 않는다.
- 401 `UNAUTHENTICATED`만 세션 만료로 연결한다. 403 `FORBIDDEN`은 CSRF와 권한 오류에 공통 사용되므로 로그아웃하거나 변경 요청을 자동 재전송하지 않는다.
- 변경 요청의 403은 CSRF 캐시를 비워 사용자의 다음 명시적 재시도에서 새 토큰을 받는다. 변경은 기본 자동 재시도 없음. 조회만 network/timeout/500/502/503/504에 최대 한 번 재시도한다.
- clientRequestId는 도메인에서 동일 작업의 재시도 동안 유지한다. 409 및 업무 상태 복구도 도메인에서 처리한다.

## 세션 전환과 CSRF

BE의 HttpOnly `HANMAUM_SESSION`을 브라우저가 credentials 요청에 포함한다. FE는 쿠키를 읽거나 JWT/Authorization을 만들지 않는다. CSRF 토큰은 메모리에만 두고 동시 발급을 합친다. 로그인 시작·복귀·로그아웃·만료·계정 변경 시 정리한다.

`resetSessionState`는 전체 API 요청 취소, CSRF 초기화, 진행 Query 취소, 각 Query 초기화, 캐시 삭제 순서로 처리한다. `clear()`만 호출하면 마운트된 구독자에 이전 데이터가 남을 수 있으므로 Query reset을 먼저 한다. 활성 조회를 자동 재요청하는 resetQueries는 사용하지 않는다. 세대가 지난 응답은 취소 오류로 종료하며 계정 변경 시 화면 트리도 userId를 기준으로 다시 마운트한다. 서버에서 이미 처리한 변경까지 롤백한다는 의미는 아니다.

- 최초 확인 중에는 보호 화면을 마운트하지 않는다. 보호 경로에서 401이면 데이터를 정리하고 로그인으로 이동한다. 저장하지 않은 입력은 재로그인 후 다시 입력해야 하며 복귀 URL만 보관한다.
- 탭·창 복귀 시 기존 화면·폼·스크롤을 유지한다. 마지막 확인 후 60초 이내의 단순 복귀는 추가 `/me`를 생략하며 주기적인 타이머는 사용하지 않는다. 같은 시점의 확인 요청은 하나로 합친다.
- 탭을 벗어나면 진행 중인 보호 조회를 취소·복원하고 신원을 미확인으로 표시한다. 이 상태에서 실제 API 요청이 필요하면 60초 이내라도 먼저 `/me`를 확인한다. 확인을 기다리던 요청은 계정이 바뀌면 취소한다. 일반 API의 `session` 기본값은 보호 요청이며 `/me`·로그아웃 같은 인증 전용 경로만 `independent`로 우회한다.
- Query의 기본 `staleTime`은 30초이며 포커스 자동 조회는 비활성화한다. 세션 재확인과 업무 조회가 동시에 실행되는 경쟁을 방지한다. 변경 성공 후 invalidate는 기존대로 적용한다.
- 탭 이탈로 취소된 활성 조회가 있으면 복귀 시 신원을 먼저 확인하고 해당 조회만 재개한다. 실패 후 재시도도 같은 규칙이며, 계정 전환으로 제거된 Query 객체는 재사용하지 않는다.
- 로그인 시작·복귀·로그아웃은 같은 Origin의 다른 탭에 BroadcastChannel과 storage 이벤트로 변경 신호만 전달한다. 계정·쿠키·토큰은 전달하거나 저장하지 않는다. 다른 탭은 신원을 무효화하고 다시 확인한다. 계정 변경 시 캐시와 화면 상태를 초기화한다.
- 최초 로그인 준비는 `prepareOAuthSession`의 Web Locks로 직렬화한다. 다른 탭의 준비 요청이 끝나 세션 쿠키가 저장된 후 다음 탭이 준비·이동하며, 서버의 OAuth state별 복귀 처리와 함께 사용한다. 화면 이탈·컴포넌트 해제 시 대기/요청을 취소하고 20초 내 준비되지 않으면 명시적 재시도를 안내한다. 탭 종료 시 브라우저가 잠금을 해제하므로 영구 잠금이나 localStorage 완료 플래그를 남기지 않는다.
- Web Locks를 지원하지 않거나 사용할 수 없는 브라우저에서는 조율 없이 로그인을 진행하지 않고 오류를 표시한다. HTTPS의 최신 Chrome·Safari·Edge를 사용한다. 잠금은 같은 Origin 범위이므로 운영 FE와 로컬 FE를 서로 다른 탭에서 동시에 **최초** 로그인하는 경우까지 조율하지 않는다. 이 경우 한 주소에서 먼저 로그인한 뒤 다른 주소를 사용하며, Origin 간 조율이 필요하면 BE와 별도 계약을 추가한다.
- `/me`의 네트워크·서버 오류를 비로그인으로 오인하지 않는다. 기존 화면과 입력은 유지하고 작은 재시도 안내를 표시한다. 새 보호 요청은 신원 확인이 성공하기 전까지 전달하지 않는다. 서버에서 이미 처리한 변경을 취소·롤백했다는 뜻은 아니다.
- 로그아웃 403은 실패로 표시하고 세션을 유지한다. 응답 유실은 결과 미확인으로 표시하며 보호 데이터를 가린다. 이후 `/me`로 확인해 401일 때만 로그아웃 완료로 간주한다.
- 회원 탈퇴는 같은 세션 컨트롤러에서 처리하며 `POST /api/users/me/withdrawals`의 204만 완료로 인정한다. 소유 중인 공간이 있으면 이전·삭제를 먼저 진행한다. 응답 유실 시 보호 화면을 가리고 자동 재전송하지 않는다. `/me`의 401은 탈퇴 성공 증명이 아니므로 결과 미확인을 유지한다. 동일 계정의 200 확인 후에만 사용자가 공간 목록을 재확인하고 같은 요청 ID로 명시적으로 재시도할 수 있다. 다른 탭의 명시적 세션 변경은 진행 중인 탈퇴·CSRF·복구 조회를 무효화하고 결과 미확인으로 유지한다.
- 계정 데이터를 localStorage나 Query initialData/placeholderData에 보관하지 않는다. 공간별 Query 키에는 spaceId를 포함한다.

## 로그인 복귀와 적용 범위

`/auth/callback`은 인증 결과를 URL 토큰으로 판단하지 않고 `/api/users/me`로 확인한다. 안전한 내부 복귀 경로를 같은 탭의 sessionStorage에 보관하며, 외부 URL·로그인/콜백 자체·로그아웃 URL은 허용하지 않는다. 프로필·세션·CSRF는 저장하지 않는다.

로그인 후 우선순위는 저장된 복귀 경로 → 공간 한 곳이면 해당 홈 → 0곳 또는 여러 곳이면 공간 선택이다. 공간 조회 실패는 빈 목록으로 대체하지 않고 재시도한다. #48의 useCareSpaces와 DTO를 재사용한다. 초대 주소에는 복귀만 하며 자동 가입하지 않는다.

공간 생성은 #48의 구현을 사용하고, 생성 직후 실제 홈으로 이동한다. 공간 상세·구성원·현황판·최근 소식을 조회하며 새 조회 키에는 accountId와 spaceId를 포함한다. 현황판에 합산 제안/요청 건수가 없어 숫자를 추정하지 않는다. 그 외 미연동 업무 화면은 기존 UI와 메모리 예시를 명시적으로 표시한다. 로그인·공간·홈·가족 조회 캐시와 예시 저장소를 분리하고, 예시 변경은 네트워크 요청이나 실제 Query 무효화를 하지 않는다. 실제 세션 정리 시 예시 저장소도 비운다. API 연동을 완료한 도메인은 실제 DTO/Query로 교체하고 해당 예시 표시를 제거한다.

BE 후속 설정: 성공 FE 복귀 URL을 `https://hanmaum.site/auth/callback`으로 변경해야 한다. 공급자에 등록된 BE callback(`/login/oauth2/code/...`)은 그대로다. 현재 BE의 OAuth 실패는 JSON 응답이며 FE 실패 복귀를 원하면 별도 BE 리다이렉트 계약이 필요하다. [배포 설정](../../../docs/deployment.md)을 함께 확인한다.

## 검증

`pnpm check`와 `pnpm build`를 실행한다. 이번 인증 연결은 임시 로컬 API로 401/403/500, CSRF, 204, 응답 유실, 계정 변경·지연 응답, 공간 0/1/여러 개, 초대 복귀를 검증한다. 실제 공급자 로그인·운영 쿠키/CORS·BE 복귀 설정은 배포 환경에서 별도 확인한다. 테스트 도구 도입과 영구 테스트 파일 추가는 기존 합의대로 보류한다.
