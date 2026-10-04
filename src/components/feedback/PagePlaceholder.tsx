import { Notice } from "./Notice";

export function PagePlaceholder({ title }: { title: string }) {
  return (
    <>
      <h1 className="text-hm-title-page">{title}</h1>
      <Notice
        tone="neutral"
        title="화면 준비 중"
        body="Mock · 경로와 공통 레이아웃을 확인하는 임시 화면이에요. 실제 돌봄 정보 조회·저장 기능은 연결되지 않았어요."
      />
    </>
  );
}
