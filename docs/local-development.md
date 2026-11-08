# 로컬 FE → 배포 BE 연동

로컬 코드를 수정하고 실제 API의 저장·조회 결과를 확인한 뒤 PR을 작성하기 위한 개발 환경이다. Node.js **24.x**, pnpm **10.18.2**를 사용한다.

| 실행 위치         | FE 접속 주소                      | API                        |
| ----------------- | --------------------------------- | -------------------------- |
| 개인 PC의 Vite    | `https://local.hanmaum.site:5173` | `https://api.hanmaum.site` |
| Vercel Production | `https://hanmaum.site`            | `https://api.hanmaum.site` |

개발 도메인은 각 PC의 `127.0.0.1`을 가리킨다. 공용 DNS 등록이나 Vercel 배포는 필요 없다. 팀원마다 자기 코드가 표시되며 API·DB는 공유한다. 실제 데이터가 변경되므로 테스트 계정·공간을 사용한다. `SameSite=Lax` 쿠키를 유지하기 위해 FE도 같은 사이트의 **HTTPS** 주소로 실행한다. CORS는 별도로 정확한 Origin을 허용해야 한다.

**BE 선행 조건:** 현재 확인한 BE는 로그인 성공 주소가 하나로 고정되어 있다. 아래 [BE 전달 사항](#be-전달-사항)을 반영해야 로컬 로그인과 인증 API를 끝까지 사용할 수 있다. FE 설정 성공은 BE 배포 완료를 뜻하지 않는다.

## 최초 1회 준비

먼저 레포에서 `pnpm install --frozen-lockfile`을 실행한다. `git pull`·`pnpm install`은 hosts나 인증서 신뢰를 자동으로 변경하지 않는다.

### Windows

스크립트는 PATH에 없는 경우에도 같은 사용자의 WinGet 설치 위치에서 mkcert를 찾는다. hosts 권한 오류는 실제 관리자 여부를 구분해서 안내한다.

1. 일반 PowerShell에서 mkcert 설치:

   ```powershell
   winget install --id FiloSottile.mkcert --exact --source winget
   ```

2. 터미널을 닫고 **같은 Windows 계정의 PowerShell을 관리자 권한으로 실행**한다. 프로젝트 폴더로 이동하고 Node 버전을 확인한다. fnm을 사용하는 경우 `fnm use 24`로 전환한다.

   ```powershell
   cd C:\dev\Hanmaum\hanmaum-frontend
   node --version
   pnpm setup:local
   ```

3. 개발 CA를 신뢰할지 확인하는 시스템 창이 표시되면 설정 내용을 확인하고 승인한다. 브라우저를 재시작한다.

이후 개발 서버는 **일반 권한 터미널**에서 실행한다. 다른 관리자 계정으로 설정하면 CA가 다른 사용자에게 생성될 수 있으므로 같은 계정을 사용한다. WinGet을 쓸 수 없으면 [mkcert 공식 설치 안내](https://github.com/FiloSottile/mkcert#installation)의 Chocolatey/Scoop 방법을 사용할 수 있다.

### macOS

```sh
brew install mkcert
# Firefox를 사용하는 경우
brew install nss
pnpm setup:local
```

**스크립트 전체를 sudo로 실행하지 않는다.** mkcert의 CA 설치 및 `/etc/hosts`에 한 줄을 추가하는 단계에서 필요한 권한을 요청한다. 개인 사용자 소유의 인증서·환경 파일을 유지한다.

### Linux

배포판에 맞는 mkcert가 필요하다. Ubuntu/Debian의 설치 예시:

```sh
sudo apt install mkcert
# Firefox 등 NSS 저장소를 사용하는 브라우저를 위한 선택 설치
sudo apt install libnss3-tools
pnpm setup:local
```

패키지가 제공되지 않는 배포판은 [mkcert 공식 Linux 안내](https://github.com/FiloSottile/mkcert#linux)를 따른다. macOS와 동일하게 전체 스크립트에 sudo를 붙이지 않는다. WSL에서는 Windows 브라우저와 Linux의 hosts·인증서 저장소가 다르므로 이 절차가 자동 공유되지 않는다. Windows 브라우저로 개발하는 팀원은 Windows 환경에서 설정·실행하는 것을 기준으로 한다.

macOS·Linux에서 NSS 도구가 없으면 mkcert는 NSS 설치를 건너뛰고 시스템 인증서 저장소 설정을 진행한다. NSS 저장소가 필요한 브라우저에서 신뢰 오류가 나면 위 선택 패키지를 설치하고 `pnpm setup:local`을 다시 실행한다. NSS 도구가 설치된 상태에서 발생하는 실제 설치 오류는 숨기지 않는다.

## 스크립트가 설정하는 항목

`pnpm setup:local`은 다음 순서로 실행된다.

1. Node 24·mkcert 설치, hosts 충돌·쓰기 권한 확인.
2. `mkcert -install`로 브라우저용 개발 CA 설치. 관련 없는 Java 인증서 저장소는 변경하지 않음.
3. `.certs/local.hanmaum.site.pem`과 개인 키 발급. 정상 인증서는 재사용하고 만료 7일 전·도메인 불일치·CA 변경 시 재발급.
4. hosts에 아래 항목이 없을 때만 추가. 기존 다른 항목·주석 보존, 동일 도메인이 다른 IP이면 중단.

   ```text
   127.0.0.1 local.hanmaum.site # Hanmaum local FE
   ```

5. `.env.development.local`의 아래 네 값을 설정. 다른 키는 보존하고 기존 파일이 변경되면 `.certs/env.before-*`로 백업. 같은 폴더의 임시 파일에 작성·동기화를 마친 뒤 rename으로 교체하므로 작성 중 실패해도 기존 파일을 먼저 비우지 않음. 교체 직전 다른 편집이 감지되면 최신 내용으로 다시 병합하고, 변경이 계속되면 중단.

   ```dotenv
   HANMAUM_LOCAL_HTTPS=true
   VITE_API_BASE_URL=https://api.hanmaum.site
   VITE_ENABLE_MOCK_PREVIEW=false
   VITE_ENABLE_QA_TOOLS=true
   ```

hosts 수정 전 백업도 `.certs/hosts.before-*`에 저장한다. 원본 전체 복원은 그 이후 다른 프로그램이 추가한 항목을 지울 수 있으므로 자동으로 수행하지 않는다. 도중 실패하면 출력된 문제를 해결한 뒤 같은 명령을 다시 실행한다.

같은 체크아웃에서는 `.certs/setup.lock`으로 설정을 한 번에 하나만 실행한다. 인증서·개인 키 발급과 환경 파일 갱신이 끝날 때까지 잠금을 유지하며, 두 번째 실행은 파일을 덮어쓰지 않고 중단한다. `--check`는 잠금을 생성하지 않는다.

**setup.lock 복구:** 정상 완료나 오류 종료 시 잠금은 해제된다. 강제 종료·재부팅 후 잠금이 남았다면 먼저 실행 중인 `pnpm setup:local` 및 mkcert 프로세스가 없는지 확인한다. 잠금 파일의 숫자는 설정 Node 프로세스의 PID다. 관련 프로세스가 모두 종료된 것을 확인한 뒤 `.certs/setup.lock`만 삭제하고 재실행한다. `.env.setup-*.local` 임시 파일이 남았다면 같은 확인 후 삭제할 수 있다. 설정 중에는 환경 파일을 동시에 편집하지 않는다. 잠금은 설정 스크립트끼리만 공유되며 외부 편집기를 잠그지는 않는다.

`.certs/`와 `*.local`은 Git에서 제외된다. 인증서 개인 키, mkcert의 `rootCA-key.pem`, 개인 환경 파일을 팀원에게 전달하거나 커밋하지 않는다. 각 PC에서 자체 인증서를 만든다. 기존 `pnpm install`의 Husky 설정은 유지한다.

## 매일 실행

```sh
pnpm dev
```

**`https://local.hanmaum.site:5173`을 브라우저에서 연다.** Vite 기본 출력의 `https://127.0.0.1:5173` 주소 대신 위 도메인을 사용한다. 인증서는 개발 도메인용이며 `localhost`·IP용이 아니다. 터미널 첫 줄에도 개발 주소를 표시한다.

개발 서버는 `127.0.0.1`에만 바인딩한다. HMR로 수정 내용이 바로 반영된다. `strictPort`를 사용하므로 5173이 사용 중이면 5174로 바꾸지 않고 오류를 표시한다. CORS·콜백 Origin이 고정되어 있기 때문이다. 기존 서버를 종료한 뒤 다시 실행한다.

파일을 변경하지 않는 상태 점검:

```sh
pnpm setup:local --check
```

이 명령은 mkcert·hosts·DNS·인증서/개인 키·개발 환경 파일을 검사한다. 브라우저 신뢰 저장소와 BE CORS·OAuth 성공까지 검증하는 명령은 아니다. 스크립트와 dev 서버에는 의존성을 추가하지 않으며 Node 24의 TypeScript 실행을 사용한다.

## 운영 빌드와 기존 개발 방식

- 로컬 인증서 읽기와 HTTPS 서버 설정은 `serve` + `development`에만 적용한다. `pnpm build`, `pnpm preview`, Vercel 빌드에는 로컬 인증서가 필요 없다.
- `.env.development.local`은 개발 모드에서만 읽는다. 기존 `.env.local`은 모든 모드에 영향을 주므로 개발 전용 값을 그 파일에 추가하지 않는다. 셸에 미리 설정한 환경 변수는 파일보다 우선하므로 예상과 다르면 확인한다.
- `.env.production`과 Vercel Production의 API·Mock/QA 설정은 그대로 유지한다. Production에서는 로컬 OAuth 복귀 표시도 추가하지 않는다.
- 기존 HTTP localhost + 로컬 BE 방식은 `.env.development.local`의 `HANMAUM_LOCAL_HTTPS=false`, `VITE_API_BASE_URL=http://localhost:8080`, `VITE_ENABLE_MOCK_PREVIEW=false`로 변경하고 Vite를 다시 실행한다.
- 현재는 기본 Mock 시드와 활성화 옵션을 제거했다. VITE_ENABLE_MOCK_PREVIEW=true로 변경해도 실제 API 흐름을 사용한다. 공통 UI만 확인하려면 로컬 /_dev/components를 사용한다.

## BE 전달 사항

아래는 **BE에 추가 반영이 필요한 FE 측 계약 제안**이다. 이 이슈에서 BE 코드를 수정하거나 배포하지 않는다.

1. 기존 운영 Origin을 유지하면서 CORS에 아래 정확한 Origin 추가:

   ```text
   https://hanmaum.site
   https://local.hanmaum.site:5173
   ```

   `allowCredentials=true`, GET/POST/PUT/PATCH/DELETE/OPTIONS, Content-Type·X-CSRF-TOKEN 허용 유지. 와일드카드 Origin이나 `http://localhost` 추가로 대체하지 않는다.

2. 로컬 FE는 개발 모드에서 정확한 로컬 Origin으로 접속하고 배포 BE를 사용할 때만 다음 주소로 브라우저를 이동:

   ```text
   https://api.hanmaum.site/oauth2/authorization/google?frontend=local
   https://api.hanmaum.site/oauth2/authorization/kakao?frontend=local
   ```

   운영 FE는 기존 주소를 그대로 사용하며 쿼리를 추가하지 않음.

3. BE에서 `frontend=local`을 **고정된 허용 대상 선택자**로 처리:

   | 로그인 시작      | 성공 복귀 주소                                  |
   | ---------------- | ----------------------------------------------- |
   | `frontend` 없음  | 기존 `https://hanmaum.site/auth/callback`       |
   | `frontend=local` | `https://local.hanmaum.site:5173/auth/callback` |
   | 그 외 값         | 요청 거절, 임의 URL 리다이렉트 금지             |

   이 값을 해당 OAuth authorization request/state와 연결해 서버 측에 보관하고 성공 처리까지 전달한다. 공급자에 전달하거나 callback의 임의 쿼리/Referer로 복귀 주소를 결정하지 않는다. 여러 탭의 운영·로컬 로그인 요청이 섞이지 않도록 요청별로 구분하고 성공·실패 후 정리한다. 기존 `LOGIN_SUCCESS_URL`을 로컬 주소로 일괄 변경하지 않는다.

4. Google·카카오 콘솔에 등록한 BE callback 유지:

   ```text
   https://api.hanmaum.site/login/oauth2/code/google
   https://api.hanmaum.site/login/oauth2/code/kakao
   ```

5. `HANMAUM_SESSION`의 HttpOnly·Secure·SameSite=Lax·BE 호스트 범위를 유지. FE JavaScript에 세션 쿠키를 노출하지 않음. CSRF 발급·변경 요청 헤더·로그아웃 204 계약도 유지. OAuth 실패는 현재 BE의 401 JSON 응답 계약 유지.

위 선택자 이름을 변경해야 한다면 FE `getOAuthLoginUrl.ts`와 BE 계약을 함께 변경한다. 아직 BE가 반영되지 않았으면 로컬 로그인도 운영 콜백으로 돌아올 수 있다.

## 실제 연동 확인

BE 반영 후 로컬 브라우저에서 Google·카카오 각각 로그인 → **로컬** `/auth/callback` 복귀 → `/api/users/me`·공간 목록 성공 → 테스트 공간 생성(CSRF + 세션) → 로그아웃 204 → 재로그인을 확인한다. 소식 등 후속 API도 이 환경에서 검증한다.

운영 주소에서 시작한 로그인은 계속 **운영** 콜백으로 돌아오는지 함께 확인한다. 로컬과 운영 FE가 동일한 BE 세션을 공유하므로 한쪽에서 계정을 바꾸거나 로그아웃하면 다른 쪽 세션에도 영향을 준다.

## 문제 해결·설정 해제

| 현상                       | 확인할 내용                                                                                     |
| -------------------------- | ----------------------------------------------------------------------------------------------- |
| mkcert를 찾지 못함         | 설치 후 터미널 재시작, PATH, `mkcert -version`                                                  |
| Node 버전 오류             | `node --version`으로 24.x 확인, 관리자 터미널에서도 fnm 등 버전 선택                            |
| hosts 권한 오류            | Windows는 같은 계정의 관리자 PowerShell, macOS/Linux는 sudo 허용 여부                           |
| 다른 IP·UTF-16 hosts       | 직접 파일을 확인해 해당 호스트 한 줄만 정리. 자동 전체 덮어쓰기 없음                            |
| DNS 실패                   | hosts 항목 확인 및 브라우저 재시작. Windows는 필요 시 `ipconfig /flushdns`                      |
| 인증서 경고                | `pnpm setup:local` 재실행, 같은 계정 CA인지 확인, 브라우저 재시작. 경고 무시·TLS 검증 해제 금지 |
| 5173 사용 중               | 기존 개발 서버 종료. 임의 포트 변경 금지                                                        |
| CORS 오류                  | BE에 `https://local.hanmaum.site:5173` 정확히 허용되었는지 확인                                 |
| 로그인 후 운영으로 이동    | BE의 `frontend=local` 처리·요청별 복귀 대상 보존 여부 확인                                      |
| GET은 성공하나 변경은 실패 | 쿠키 포함 여부, CSRF 발급/헤더, 권한 확인. 변경 요청 자동 재전송 없음                           |

hosts 파일은 Windows `%SystemRoot%\System32\drivers\etc\hosts`, macOS/Linux `/etc/hosts`에 있다. 수동 설정이 필요하면 관리자 권한으로 위 `127.0.0.1 local.hanmaum.site` 한 줄을 추가한다.

설정을 해제하려면 개발 서버를 종료하고 `.env.development.local`의 `HANMAUM_LOCAL_HTTPS=false`로 변경한다. 더 사용하지 않는다면 hosts의 `# Hanmaum local FE` 항목과 해당 프로젝트 `.certs` 파일을 정리한다. `mkcert -uninstall`은 이 프로젝트뿐 아니라 같은 CA를 쓰는 다른 프로젝트에도 영향을 주므로, 그 CA를 더 이상 사용하지 않을 때만 직접 실행한다.

참고: [Vite HTTPS 설정](https://vite.dev/config/server-options#server-https), [Vite 환경 변수 우선순위](https://vite.dev/guide/env-and-mode#env-files), [mkcert](https://github.com/FiloSottile/mkcert).
