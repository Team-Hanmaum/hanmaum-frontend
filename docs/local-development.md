# 로컬 개발

Node.js **24.x**, pnpm **10.18.2**를 사용한다. 각 PC에서 실행한 FE가 배포 BE에 연결되므로 테스트 계정·공간에서 확인한다.

| 구분     | 주소                            |
| -------- | ------------------------------- |
| 로컬 FE  | https://local.hanmaum.site:5173 |
| 연결 API | https://api.hanmaum.site        |

## 최초 1회 준비

1. 프로젝트에서 `pnpm install --frozen-lockfile`을 실행한다.
2. OS에 맞게 mkcert를 설치한다.

   | OS            | 설치 명령                                                        |
   | ------------- | ---------------------------------------------------------------- |
   | Windows       | `winget install --id FiloSottile.mkcert --exact --source winget` |
   | macOS         | `brew install mkcert`                                            |
   | Ubuntu·Debian | `sudo apt install mkcert`                                        |

   다른 Linux 배포판은 [mkcert 설치 안내](https://github.com/FiloSottile/mkcert#linux)를 따른다. Firefox를 사용한다면 macOS는 `brew install nss`, Ubuntu·Debian은 `sudo apt install libnss3-tools`도 실행한다.

3. 프로젝트 폴더에서 다음 명령을 실행한다.

   ```sh
   pnpm setup:local
   ```

   Windows는 **같은 계정의 관리자 PowerShell**에서 실행한다. macOS·Linux는 일반 터미널에서 실행하고 hosts·인증서 설정 단계의 권한 요청을 승인한다. 스크립트 전체에 `sudo`를 붙이지 않는다.

4. 인증서 신뢰 설정을 마친 뒤 브라우저를 재시작한다. 이후 개발 서버는 일반 터미널에서 실행한다.

팀원마다 각 PC에서 한 번 설정해야 하며 `git pull`·`pnpm install`만으로 hosts와 인증서가 준비되지는 않는다. Windows 브라우저를 사용하는 경우 WSL이 아닌 Windows에서 설정한다.

## 실행과 설정 확인

```sh
pnpm dev                  # 개발 서버
pnpm setup:local --check  # hosts·DNS·인증서·환경 파일 점검
```

브라우저에서 **https://local.hanmaum.site:5173**을 연다. `localhost`나 IP 주소는 인증서 대상이 아니다. 포트는 5173으로 고정되어 있으며 사용 중이면 다른 개발 서버를 종료한다.

설정 스크립트는 hosts에 개발 도메인을 추가하고 `.certs/`에 인증서를 생성하며 `.env.development.local`에 아래 값을 반영한다. 다른 환경 변수는 보존한다.

```dotenv
HANMAUM_LOCAL_HTTPS=true
VITE_API_BASE_URL=https://api.hanmaum.site
VITE_ENABLE_QA_TOOLS=true
```

- 카카오톡 공유용 키는 [배포 문서](deployment.md#카카오톡-공유)에 따라 추가한다.
- `.certs/`와 개인 환경 파일은 Git에서 제외한다. 인증서 개인 키와 mkcert CA 개인 키를 공유하지 않는다.
- 설정 전 백업은 `.certs/`에 보관한다. `--check`는 브라우저의 인증서 신뢰나 BE 로그인 성공까지 검사하지 않는다.
- 개발 환경 파일·인증서는 Production 빌드에 적용되지 않는다. 로컬 BE를 사용할 때는 [.env.example](../.env.example)을 참고해 HTTPS 사용 여부와 API 주소를 바꾼다.

## 로그인·API 계약

BE는 운영 Origin `https://hanmaum.site`와 개발 Origin `https://local.hanmaum.site:5173`의 credentials 요청을 허용한다.

- 로컬 FE의 로그인 시작 주소에는 `frontend=local`을 붙여 로컬 `/auth/callback`으로 복귀한다. 운영 FE는 해당 쿼리를 붙이지 않고 운영 콜백으로 복귀한다.
- Google·카카오 공급자 콜백은 기존 BE 주소를 사용한다. 세션 쿠키·CSRF 처리는 [공통 API 규격](../src/lib/api/README.md)을 따른다.
- 로컬과 운영 FE는 같은 BE 세션을 사용하므로 계정 전환·로그아웃이 서로 영향을 줄 수 있다.

설정 후 Google·카카오 로그인 → **로컬 콜백 복귀** → 공간 목록 → 테스트 공간 생성 → 로그아웃을 확인한다.

## 문제 해결

| 현상                              | 확인 사항                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| mkcert·Node를 찾지 못함           | 터미널 재시작, `mkcert -version`, `node --version`으로 Node 24 확인                     |
| hosts 권한 오류                   | Windows 관리자 PowerShell 사용 여부 확인                                                |
| 인증서 경고                       | 정확한 HTTPS 주소 확인, 같은 계정에서 `pnpm setup:local` 재실행, 브라우저 재시작        |
| CORS 오류·로그인 후 운영으로 이동 | BE의 개발 Origin 허용과 `frontend=local` 복귀 설정 확인                                 |
| 설정 잠금이 남음                  | 실행 중인 설정·mkcert 프로세스가 없는지 확인한 뒤 `.certs/setup.lock`만 삭제하고 재실행 |

설정 중에는 환경 파일을 동시에 편집하지 않는다. 강제 종료로 `.env.setup-*.local`이 남았다면 관련 프로세스 종료를 확인한 뒤 제거할 수 있다.

로컬 HTTPS 사용을 중단하려면 `HANMAUM_LOCAL_HTTPS=false`로 변경한다. 환경을 완전히 해제할 때는 hosts의 `# Hanmaum local FE` 항목과 해당 프로젝트의 인증서를 정리한다. `mkcert -uninstall`은 같은 CA를 사용하는 다른 프로젝트에도 영향을 준다.
