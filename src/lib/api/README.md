# 공통 API와 서버 상태 관리

Axios는 HTTP 통신, TanStack Query는 조회·변경의 상태와 메모리 캐시를 담당한다. 기준은 2026-10-11 BE Swagger `/v3/api-docs`와 BE의 `docs/api-conventions.md`다. 오래된 handoff의 `fieldErrors`와 성공 응답 미정 설명은 현재 계약에 적용하지 않는다.

## 설정과 적용 범위

루트 `.env.example`을 `.env.local`로 복사하고 개발 서버를 재시작한다. `VITE_API_BASE_URL`에는 `http://localhost:8080`처럼 서버 주소만 넣고 `/api`는 붙이지 않는다. 로컬 FE는 `http://localhost:5173`, BE는 `http://localhost:8080`으로 호스트를 통일한다. FE 포트가 바뀌면 BE CORS 허용 Origin도 별도로 맞춰야 한다.

```dotenv
VITE_API_BASE_URL=http://localhost:8080
VITE_ENABLE_MOCK_PREVIEW=true
```

- `VITE_*`는 브라우저에 공개되는 빌드 설정이다. 비밀키·세션·CSRF 토큰을 넣지 않는다.
- API 주소는 요청 시 검증한다. 미설정 상태에서도 기존 Mock 화면은 열리지만 실제 API 호출은 `configuration` 오류로 종료한다. 운영용 localhost 기본값은 두지 않는다.
- `QueryProvider` 연결만으로 요청이 발생하지 않는다. 현재 페이지는 실제 인증 API를 호출하지 않으며 기존 Mock 이동을 유지한다.
- `useMe`는 Mock 모드에서 비활성화하고 수동 `refetch`도 실제 요청을 막는다. `useLogout`도 Mock 모드에서는 실제 로그아웃을 요청하지 않는다.
- 저수준 API 함수는 Mock 응답을 만들지 않는다. 개발자가 `getMe`, `logout`, `apiClient`를 직접 호출하면 설정한 서버에 실제 요청한다. MSW·데이터 Mock 환경은 후속 #12 범위다.
- 실제 인증 화면 연결 시 Mock 설정을 끄고 세션·권한 처리와 함께 사용한다. 이 설정을 끄는 것만으로 기존 로그인 버튼이 실제 OAuth로 바뀌지는 않는다. 배포 환경 설정은 루트 README와 `docs/deployment.md`를 따른다.

## 파일 책임

| 위치                       | 책임                                                              |
| -------------------------- | ----------------------------------------------------------------- |
| `lib/env.ts`               | API 서버 주소 검증                                                |
| `lib/api/httpClient.ts`    | 쿠키를 포함하는 Axios 인스턴스, 기본 15초 타임아웃, API 경로 제한 |
| `lib/api/apiClient.ts`     | CSRF를 포함한 업무 요청, 공통 JSON 응답과 204 처리                |
| `lib/api/apiTypes.ts`      | 공통 응답·필드 오류·요청 옵션 타입과 공통 응답 형태 확인          |
| `lib/api/apiError.ts`      | HTTP·네트워크·타임아웃·취소 등 공통 오류                          |
| `lib/api/csrf.ts`          | CSRF 발급 공유, 메모리 보관, 세션 변경 후 초기화                  |
| `lib/query/`               | QueryClient 및 React Provider                                     |
| `features/{domain}/api/`   | 해당 도메인의 경로·요청·응답 타입과 API 함수                      |
| `features/{domain}/model/` | 조회 키·조회/변경 훅·캐시 갱신·업무 상태                          |

도메인은 `@/lib/api`의 공개 함수와 타입을 사용한다. `httpClient`를 직접 사용하면 CSRF·응답 처리를 우회하므로 도메인에서 가져오지 않는다. 공통 `lib`는 `features`, `pages`, 라우터에 의존하지 않는다.

## 응답과 요청

업무 JSON 응답은 `ApiResponse<T>`이며 `success`, `code`, `message`, `data`, `errors`, `timestamp`를 가진다. 오류의 `data`는 null, 필드 오류가 없으면 `errors: []`다. 필드 오류는 `{ field, reason }`이며 중첩 경로도 문자열 그대로 보존한다.

`apiClient.request<T>`는 `{ status, body }`를 반환한다. `body`는 공통 성공 응답이고 도메인 함수에서 필요한 `body.data`를 꺼낸다. HTTP 상태와 `code`를 없애지 않으므로 201 생성과 202 접수를 구분할 수 있다. 202 접수나 분석 조회의 `success: true`를 실제 업무 완료·분석 성공으로 처리하지 않는다.

실제 구현된 내 정보 조회의 사용 예:

```ts
import { getMe } from "@/features/user/api/userApi";

const profile = await getMe();
// profile: { userId, displayName: string | null, providers }
```

도메인 API 함수에서는 다음 형태를 사용한다.

```ts
import { apiClient } from "@/lib/api";
import type { MyProfile } from "@/features/user/api/userTypes";

const result = await apiClient.request<MyProfile>("/api/users/me", {
  signal: abortController.signal,
});
const profile = result.body.data;
```

위 예시의 `abortController`는 호출부가 만든 `AbortController`다. 공통 클라이언트는 여섯 필드의 형태를 확인하며 제네릭 `T` 자체가 도메인 데이터의 런타임 검증을 대신하지 않는다. 실제 `getMe`는 nullable 표시 이름과 소셜 제공자를 포함한 내 정보 형태도 확인한다.

- 요청 옵션: `method`, `params`, `body`, `signal`, `timeoutMs`. GET이 기본이며 변경 요청은 POST·PUT·PATCH·DELETE로 지정한다.
- 서비스 ID는 문자열, 공개 버전은 십진 정수 문자열, 시각은 UTC ISO 8601 문자열로 유지한다. 버전을 숫자로 변환하거나 응답의 모든 시각을 자동 변환하지 않는다.
- 목록 DTO는 명세대로 `data.items`를 사용한다. 페이지네이션 필드는 도메인 명세에 있을 때만 추가한다.
- 204 API는 `requestEmpty`를 사용한다. JSON 응답을 기대하는 `request<T>`에서 204를 성공 데이터로 간주하지 않는다.
- CSRF의 `{ headerName, token }`은 `getCsrfToken`으로 처리한다. OAuth 시작은 브라우저 이동이므로 `apiClient`로 호출하지 않는다.
- 공통 요청은 설정된 서버의 `/api/` 하위 경로로 제한한다. 외부 URL이나 BE↔AI 내부 API를 전달하지 않는다.

## 세션과 CSRF

`HANMAUM_SESSION`은 HttpOnly 쿠키이며 Axios의 `withCredentials: true`로 브라우저가 전송한다. FE는 세션 쿠키를 읽거나 JWT·Authorization 헤더를 만들지 않는다.

변경 요청 전 `GET /api/auth/csrf`의 `headerName`·`token`을 확보한다. 토큰은 메모리에만 보관하고 동시 발급을 한 요청으로 합친다. `resetCsrfToken`은 발급 중 요청도 취소하며 이전 발급 결과가 다시 캐시에 들어가지 않도록 한다. 개별 업무 요청 취소는 다른 요청이 공유하는 CSRF 발급을 취소하지 않으며, 취소된 업무 요청은 CSRF 발급 후에도 전송하지 않는다.

로그인·로그아웃 후에는 이전 토큰을 초기화하고 다음 변경 요청에서 새 토큰을 발급한다. `useLogout`은 204 성공 후 `resetSessionState`로 진행 중인 조회를 취소하고 Query 캐시와 CSRF를 정리한다. 401 `UNAUTHENTICATED`도 로컬 세션 정리 대상으로 처리하지만, 403·타임아웃·네트워크 오류는 로그아웃 성공으로 바꾸지 않는다.

캐시 삭제 전 각 조회를 초기 상태로 되돌려 마운트된 구독자에도 결과 변경을 알린다. `clear()`만 호출하면 구독자가 이전 데이터를 유지할 수 있으므로 사용하지 않는다. 활성 조회를 자동 재요청하는 `resetQueries()`도 사용하지 않는다. 조회의 `initialData`는 초기화 시 복원되므로 계정에 종속된 데이터를 `initialData`로 보관하거나 이전 계정 데이터를 `placeholderData`로 전달하지 않는다.

```ts
import { useQueryClient } from "@tanstack/react-query";
import { resetSessionState } from "@/features/auth/model/resetSessionState";

// 인증 흐름의 훅/컴포넌트 안에서 사용
const queryClient = useQueryClient();
await resetSessionState(queryClient);
```

실제 로그인 복귀·사용자 전환·세션 만료를 처리하는 인증 흐름도 위 함수를 호출한 뒤 본인 정보를 다시 확인해야 한다. 이 연결 지점은 준비했지만, 전역 세션 가드·로그인 화면 연결·다른 탭의 로그인 변화 감지는 이번 범위에 없다. 함수 호출 자체는 서버 로그인/로그아웃이나 화면 이동을 수행하지 않으며 진행 중인 변경 요청을 서버에서 취소하지도 않는다.

## 오류와 재시도

`ApiError`의 `kind`는 `http`, `network`, `timeout`, `cancelled`, `invalid-response`, `configuration`, `unknown`이다. BE 응답이 있으면 실제 HTTP `status`, 공개 `code`, 안전한 `message`, 필드별 `errors`, 응답 `timestamp`를 유지한다. 클라이언트 오류에 임의의 BE 오류 코드를 붙이지 않는다. 비정상 HTML이나 Axios 요청 설정·쿠키·토큰·원문을 오류 객체에 보관하지 않는다.

- HTTP 상태와 `code`로 분기한다. 메시지 문자열로 정책을 판단하지 않는다.
- 401과 403을 일괄 로그인 이동으로 처리하지 않는다. 403 `FORBIDDEN`은 권한 부족과 CSRF 실패에 공통 사용되므로 원인을 단정하지 않는다.
- 공통 클라이언트는 자동 재전송을 하지 않는다. Query 조회만 네트워크·타임아웃·500/502/503/504에 최대 한 번 재시도한다. 취소·설정·응답 형식·4xx 오류는 재시도하지 않는다.
- Mutation 재시도는 기본적으로 끈다. 응답 유실·타임아웃은 서버 작업 실패를 뜻하지 않는다.
- `clientRequestId`가 필요한 API에서는 도메인이 한 사용자 작업의 UUID를 유지한다. 같은 작업 재전송에는 같은 ID와 내용을 사용하고, 사용자가 내용을 바꿔 새 작업을 시작할 때 새 ID를 만든다. 공통 인터셉터에서 매번 새 ID를 발급하지 않는다.
- 409 `REQUEST_IN_PROGRESS`는 최종 실패가 아니다. 버전 충돌·잠금·삭제 영향·구성원 요청·소유자 최종 반영의 처리와 재시도 시점은 해당 도메인 명세를 따른다.

## 조회 키와 캐시

`main.tsx`에서 하나의 `QueryProvider`를 연결한다. 기본 `staleTime`은 0이며 오래된 조회는 마운트·창 포커스 복귀·재연결 시 갱신한다. 장기 보관·영구 캐시·localStorage 저장은 추가하지 않는다. 도메인의 갱신 요구가 정해지면 그 조회에서 옵션을 조정한다.

- 내 정보 키는 `userKeys.me()`를 사용한다. Query의 `signal`을 Axios까지 전달한다.
- 공간별 키에는 반드시 `spaceId`를 넣고, 검색·필터 등 요청 결과에 영향을 주는 값도 포함한다. 예: `["carespace", spaceId, "members"]`.
- 다른 공간으로 이동할 때 이전 공간의 데이터를 `placeholderData`로 보여주지 않는다. 공간 ID는 권한 증명이 아니며 BE 응답을 확인한다.
- 성공한 변경은 영향받은 공간·목록의 키를 갱신한다. 삭제된 원문·탈퇴한 공간·접근 권한이 사라진 데이터는 해당 기능에서 관련 캐시를 제거하고 화면에서도 즉시 감춘다.
- 로그인·계정 변경·로그아웃 시 `resetSessionState`를 호출해 같은 키에 이전 사용자 데이터가 남지 않도록 한다. API 인터셉터가 모든 401에서 화면을 이동하거나 Query 캐시를 임의로 조작하지 않는다.
- 화면 로딩·빈 상태·오류는 조회 훅의 상태로 조합한다. Mock 모드의 비활성 조회는 로딩 중인 실제 인증으로 해석하지 않는다.

## 후속 연결과 검증

배포 BE 주소, 허용 Origin과 credential CORS, HTTPS·SameSite 쿠키 조건을 실제 배포 조합에 맞춰 확인한다. `withCredentials`만으로 브라우저 쿠키 정책이 해결되지는 않는다. OAuth 성공 FE 복귀 주소·실패 화면·초대 링크 로그인 후 복귀와 세션/권한 가드는 해당 화면 구현에서 연결한다.

테스트 코드와 테스트 도구 도입은 보류한다. 변경 시 `pnpm check`·`pnpm build`, 브라우저 Network 탭과 필요한 로컬 API 수동 호출로 확인한다. 오류 본문·CSRF·쿠키 값을 검증 문서나 로그에 기록하지 않는다. 사용자 계정으로 생성·참여·삭제를 검증하는 작업은 별도로 범위를 정한다.
