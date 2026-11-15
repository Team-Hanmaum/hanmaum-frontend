# 공통 컴포넌트

여러 화면에서 사용하는 표현·레이아웃 컴포넌트를 관리한다. API 호출·권한·화면 이동은 호출 측에서 처리하고 데이터와 동작을 props로 전달한다. 도메인 전용 UI는 `features/{domain}/ui`에 둔다.

## 구성

| 위치        | 주요 역할                              |
| ----------- | -------------------------------------- |
| `ui/`       | 버튼·입력·선택·탭·카드·아이콘          |
| `layout/`   | 헤더·페이지·하단 탭·액션 영역          |
| `feedback/` | 로딩·빈 상태·오류·안내·확인창·바텀시트 |
| `pwa/`      | 설치 안내·설치 상태 배너               |

기본 컴포넌트는 `@/components/ui`, `@/components/layout`, `@/components/feedback`에서 가져온다. 전체 props는 각 컴포넌트의 TypeScript 타입을 기준으로 한다.

## 사용 규칙

- `Button`은 기본 `type="button"`이다. 폼 제출에는 `type="submit"`을 지정하고 요청 중에는 `loading`을 전달한다.
- `Field`에는 `label`을 지정한다. 안내는 `helper`, 오류는 `error`, 여러 줄 입력은 `multiline`을 사용한다.
- `IconButton`에는 접근 가능한 이름인 `label`을 지정한다. `Icon` 이름과 SVG 연결은 [iconSources.ts](ui/iconSources.ts)에서 관리한다.
- `Header`는 표시를 담당하고 헤더 고정·하단 여백은 `PageLayout`·`DetailLayout`을 사용한다. 로고 클릭 동작은 `brandAction`으로 전달한다.
- `ConfirmDialog`·`BottomSheet`는 `open`·`onOpenChange`로 제어한다. 처리 중 닫기를 막을 때는 `busy`를 전달한다. 공통 모달이 포커스 이동·복귀를 처리한다.
- 색상·간격·폰트는 [스타일 토큰](../styles/README.md)을 사용한다. 로고·아이콘은 기존 `src/assets` 원본을 재사용한다.
- 공통 컴포넌트에서 `features`·`pages`·`routes`를 직접 import하지 않는다.

```tsx
import { Button, Field } from "@/components/ui";

<Field
  label="이름"
  value={name}
  onChange={(event) => setName(event.target.value)}
  error={nameError}
/>;
<Button
  type="submit"
  loading={saving}
>
  저장
</Button>;
```

## 화면 확인

로컬의 `/_dev/components`에서 공통 UI 상태를 확인한다. 이 전시 화면과 예시 값은 Production에 포함하지 않는다.

변경 시 모바일 너비, 긴 문구·글자 확대, 키보드 조작·포커스, 로딩·비활성·오류 상태를 확인한다. 라우팅과 화면 전환은 [라우팅 규격](../routes/README.md), 설치 안내는 [PWA 문서](../../docs/pwa.md)를 참고한다.
