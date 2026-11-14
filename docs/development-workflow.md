# 개발 규칙과 PR 검사

이슈·브랜치·커밋·PR의 기본 흐름은 [프로젝트 README](../README.md#개발-워크플로우), 상세 작성 지침은 [AGENTS.md](../AGENTS.md)를 따른다. 이 문서는 소스 이름 규칙과 PR 검사 운영 방법을 정리한다.

## 파일·폴더 이름

애플리케이션 소스와 직접 관리하는 자산에는 다음 규칙을 적용한다.

| 구분               | 규칙                             | 예시                                        |
| ------------------ | -------------------------------- | ------------------------------------------- |
| 컴포넌트·페이지    | PascalCase, 컴포넌트 이름과 일치 | `Button.tsx`, `LoginPage.tsx`, `Router.tsx` |
| 커스텀 훅          | camelCase, `use` 접두사          | `useSession.ts`, `useCareSpace.ts`          |
| 유틸리티·API 파일  | camelCase                        | `formatDate.ts`, `authApi.ts`               |
| CSS 파일           | kebab-case                       | `button.css`, `social-login-button.css`     |
| 이미지·아이콘      | kebab-case                       | `chevron-left.svg`, `hanmaum-favicon.svg`   |
| 폴더               | 소문자, 여러 단어는 kebab-case   | `auth/`, `component-preview/`               |
| 진입·내보내기 파일 | 고정 이름                        | `main.tsx`, `index.ts`                      |

BE와 맞춘 도메인 이름 `carespace`, `careitem`은 하나의 도메인 식별자로 유지한다. `README.md`, `.gitkeep`, 도구 설정·GitHub 템플릿과 외부 라이선스 문서는 위 소스 이름 규칙으로 일괄 변경하지 않는다.

## PR 검사

`.github/workflows/ci.yml`은 base 브랜치 제한 없이 일반 PR과 스택 PR을 동일하게 검사한다. PR 생성(`opened`), 작업 브랜치에 새 커밋 push(`synchronize`), 다시 열기(`reopened`) 시 검사한다. 제목·본문 수정이나 라벨·담당자 변경으로는 CI 실행 기록을 생성하지 않는다.

base 브랜치 변경만으로는 CI가 실행되지 않는다. 스택 PR의 base를 변경한 뒤에는 작업 브랜치에 새 커밋을 push하거나 PR을 닫았다 다시 열어 새 base와의 조합을 검사한다. 이전 실행의 재실행은 당시 커밋을 사용하므로 새 base 기준 검사를 대신하지 않는다.

PR이 없는 작업 브랜치의 push나 로컬 커밋만으로는 GitHub CI가 실행되지 않는다. 로컬 Husky·lint-staged는 유지하며, CI에서는 `package.json`의 Node.js·pnpm 버전으로 `pnpm install --frozen-lockfile` → `pnpm check` → `pnpm build`를 실행한다. CI 전용 Secret이나 배포 권한은 사용하지 않는다.

검사 이름은 **Lint and build**다. 같은 PR에 새 CI 실행이 생기면 진행 중인 이전 CI를 취소하고 최신 변경을 검사한다. 서로 다른 PR의 실행은 취소하지 않는다. 기본 checkout으로 PR을 base에 합친 임시 결과를 검사하므로, 스택 PR도 해당 부모 브랜치와의 조합을 검증한다.

CI 실행과 머지 차단은 별도 설정이다. 첫 PR에서 **Lint and build** 실행 결과를 확인한 뒤 GitHub의 **Settings → Rules → Rulesets**에서 `dev`·`main`에 적용되는 규칙의 **Require status checks to pass**에 해당 검사를 추가한다. 기존 리뷰 승인 조건은 유지한다. 다른 작업 브랜치를 base로 하는 스택 PR은 CI가 실행되더라도, 필수 검사 규칙이 없다면 실패 시 머지가 자동으로 차단되지는 않는다.

CI 설정 도입 전에 분기한 스택 브랜치에서도 검사하려면 해당 PR의 코드에 `ci.yml`이 포함되도록 최신 설정을 반영한다. `dev`에 머지된 뒤의 검사·빌드·Production 배포는 기존 `deploy.yml`이 담당한다.

배포 설정은 [배포 문서](deployment.md)를 참고한다.
