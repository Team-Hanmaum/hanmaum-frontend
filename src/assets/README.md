# 공통 자산

2026-10-02 Figma 상세 UI에서 제공된 SVG를 원본 그대로 저장했다. SVG의 색상·경로·루트 크기를 수정하거나 임의 아이콘으로 대체하지 않는다. 이미지 자체는 원본 크기로 표시하며 Google 아트워크 20px은 24px 아이콘 슬롯 가운데 배치한다.

| 파일                              | Figma 노드                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `brand/hanmaum-symbol-login.svg`  | [396:15423](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=396-15423) |
| `brand/hanmaum-symbol.svg`        | [340:16402](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=340-16402) |
| `icons/google.svg`                | [396:15405](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=396-15405) |
| `icons/kakao.svg`                 | [396:15413](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=396-15413) |
| `icons/spinner-brand.svg`         | [177:304](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-304)     |
| `icons/spinner-inverse.svg`       | [177:307](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-307)     |
| `icons/spinner-secondary.svg`     | [177:310](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=177-310)     |
| `icons/chevron-left.svg`          | [178:204](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-204)     |
| `icons/chevron-left-disabled.svg` | [178:213](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=178-213)     |
| `icons/chevron-down.svg`          | [180:140](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=180-140)     |
| `icons/alert.svg`                 | [179:143](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=179-143)     |

- 브랜드 심볼: 헤더 28.8279×28px / 로그인 98.8385×96px
- 아이콘과 스피너: 24×24px / Google 아트워크: 20×20px
- Figma 원본: [상세 UI](https://www.figma.com/design/TNlkTZrM8NIo0jSp6tRTwH?node-id=172-2)

## 소셜 로그인 연동 전 확인 사항

현재 Mock UI는 Figma의 Noto Sans KR·색상·아이콘을 그대로 사용한다. [Google 공식 가이드](https://developers.google.com/identity/branding-guidelines)의 Google Sans Medium·버튼 색상·최신 G 아트워크 규격과 차이가 있어 실제 인증 출시 전에 디자인 조율이 필요하다. [카카오 공식 가이드](https://developers.kakao.com/docs/ko/kakaologin/design-guide)도 실제 인증 연동 시 함께 재확인한다. 이 구현은 제공사 브랜드 심사 완료를 의미하지 않는다.
