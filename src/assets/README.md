# 공통 자산

2026-10-02~03 Figma 상세 UI 및 [공통 컴포넌트 보드 176:3](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=176-3)에서 제공된 SVG를 원본 그대로 저장했다. 기본 아이콘 23종과 실제 컴포넌트의 색상 변형을 합쳐 아이콘 파일은 52개다. 2026-10-12 홈 상세 화면의 원본 색상 변형 3개 추가. SVG 경로·색상·루트 크기를 수정하거나 임의 아이콘으로 대체하지 않는다.

`@/components/ui`의 `Icon`에서 이름으로 사용한다. 전체 이름과 파일 연결은 `components/ui/iconSources.ts`의 타입 지정 레지스트리에서 관리한다. 새 아이콘은 원본 SVG와 레지스트리 항목을 함께 추가한다. 기능 의미·버튼의 접근 가능한 이름은 호출 컴포넌트에서 제공한다.

- 브랜드 심볼: 헤더 28.8279×28px / 로그인 98.8385×96px
- 아이콘 슬롯: 24×24px. Google 원본 20×20px을 가운데 배치
- Link 원본: 25.0926×24px. Figma와 같이 오른쪽 기준 배치하여 왼쪽으로 1.0926px 확장
- 색상이 다른 상태는 `-brand`, `-secondary`, `-inverse`, `-error`, `-disabled` 원본 사용. CSS 필터·마스크로 색을 재작성하지 않음
- 기본 `alert`와 `chevron-down`은 아이콘 보드의 primary 색상. 오류는 `alert-error`, 헤더는 `chevron-down-secondary` 사용
- 스피너 애니메이션은 `Spinner` 담당. 모션 줄이기 설정 반영

## 파일과 출처

인스턴스 ID(`I...`) 링크는 해당 인스턴스가 있는 내비게이션 보드로 연결한다.

| 파일                                | Figma 노드                                                                              |
| ----------------------------------- | --------------------------------------------------------------------------------------- |
| `brand/hanmaum-symbol-login.svg`    | [396:15423](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=396-15423)      |
| `brand/hanmaum-symbol.svg`          | [340:16402](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=340-16402)      |
| `icons/alert.svg`                   | [177:234](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-234)          |
| `icons/alert-error.svg`             | [182:353](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=182-353)          |
| `icons/arrow-right.svg`             | [177:264](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-264)          |
| `icons/arrow-right-secondary.svg`   | [183:331](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=183-331)          |
| `icons/care.svg`                    | [177:166](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-166)          |
| `icons/care-brand.svg`              | [I180:213;180:159](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/care-secondary.svg`          | [I180:176;180:154](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/check.svg`                   | [177:213](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-213)          |
| `icons/check-disabled.svg`          | [179:209](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=179-209)          |
| `icons/check-inverse.svg`           | [179:183](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=179-183)          |
| `icons/chevron-down.svg`            | [177:203](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-203)          |
| `icons/chevron-down-secondary.svg`  | [180:140](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-140)          |
| `icons/chevron-left.svg`            | [177:197](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-197)          |
| `icons/chevron-left-disabled.svg`   | [178:213](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-213)          |
| `icons/chevron-right.svg`           | [177:192](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-192)          |
| `icons/chevron-right-secondary.svg` | [180:374](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-374)          |
| `icons/clock.svg`                   | [177:247](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-247)          |
| `icons/close.svg`                   | [177:218](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-218)          |
| `icons/edit.svg`                    | [177:223](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-223)          |
| `icons/family.svg`                  | [177:178](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-178)          |
| `icons/family-brand.svg`            | [I180:301;180:159](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/family-secondary.svg`        | [I180:190;180:154](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/google.svg`                  | [396:15405](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=396-15405)      |
| `icons/grid.svg`                    | [177:184](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-184)          |
| `icons/grid-brand.svg`              | [I180:345;180:159](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/grid-secondary.svg`          | [I180:197;180:154](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/home.svg`                    | [177:161](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-161)          |
| `icons/home-brand.svg`              | [180:159](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-159)          |
| `icons/home-secondary.svg`          | [180:154](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-154)          |
| `icons/info.svg`                    | [177:228](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-228)          |
| `icons/info-brand.svg`              | [182:335](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=182-335)          |
| `icons/info-secondary.svg`          | [182:344](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=182-344)          |
| `icons/kakao.svg`                   | [396:15413](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=396-15413)      |
| `icons/link.svg`                    | [177:253](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-253)          |
| `icons/lock.svg`                    | [177:241](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-241)          |
| `icons/lock-secondary.svg`          | [183:347](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=183-347)          |
| `icons/news.svg`                    | [177:172](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-172)          |
| `icons/news-brand.svg`              | [I180:257;180:159](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/news-secondary.svg`          | [I180:183;180:154](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-148) |
| `icons/person.svg`                  | [177:258](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-258)          |
| `icons/person-brand.svg`            | [180:368](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-368)          |
| `icons/person-error.svg`            | [180:377](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-377)          |
| `icons/plus.svg`                    | [177:208](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-208)          |
| `icons/refresh.svg`                 | [177:269](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-269)          |
| `icons/refresh-error.svg`           | [184:405](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=184-405)          |
| `icons/spinner.svg`                 | [177:275](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-275)          |
| `icons/spinner-brand.svg`           | [177:304](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-304)          |
| `icons/spinner-inverse.svg`         | [177:307](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-307)          |
| `icons/spinner-secondary.svg`       | [177:310](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-310)          |

## 소셜 로그인 연동 전 확인 사항

현재 Mock UI는 Figma의 Noto Sans KR·색상·아이콘을 그대로 사용한다. [Google 공식 가이드](https://developers.google.com/identity/branding-guidelines)의 Google Sans Medium·버튼 색상·최신 G 아트워크 규격과 차이가 있어 실제 인증 출시 전에 디자인 조율이 필요하다. [카카오 공식 가이드](https://developers.kakao.com/docs/ko/kakaologin/design-guide)도 실제 인증 연동 시 함께 재확인한다. 이 구현은 제공사 브랜드 심사 완료를 의미하지 않는다.

## 홈 상세 UI 추가 원본

- `plus-inverse.svg`: H01 `I214:1252;184:535;178:10`의 흰색 추가 아이콘.
- `check-secondary.svg`: H01 `I214:1243;180:368`의 할 일 아이콘.
- `chevron-right-brand.svg`: H01 `I214:1232;180:374`의 강조 메뉴 이동 아이콘.
- 출처: [H01 213:1233](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=213-1233). 원본 SVG를 변경하지 않고 24px 슬롯에서 사용.

## 소식 하위 UI 추가 원본

- `clock-brand.svg`: NP01 `302:12388`의 시간 선택 아이콘.
- `link-brand.svg`: NL03 `304:13111`의 근거 메뉴 아이콘.
- Figma 상세 화면의 원본 SVG를 그대로 저장하고 기존 `Icon`에서 사용. 임시 Figma URL을 런타임에서 호출하지 않음.

## 전체·계정 UI 추가 원본

- `chevron-right-error.svg`: AM01 `I320:14396;180:377`의 위험 작업 메뉴 아이콘 원본. 전체·계정·탈퇴 공간 목록에서 사용.
