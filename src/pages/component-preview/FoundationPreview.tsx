import { useState } from "react";
import {
  Badge,
  Avatar,
  TextAction,
  SelectionRow,
  Tabs,
  MenuRow,
  TabItem,
} from "@/components/ui";
import {
  BottomNav,
  NavItem,
  SectionHeader,
  ActionBar,
  type BottomNavTab,
} from "@/components/layout";
import { PreviewExample as Example } from "./PreviewExample";
export function FoundationPreview({
  onAction,
}: {
  onAction: (message: string) => void;
}) {
  const [selected, setSelected] = useState(false);
  const [assignee, setAssignee] = useState("one");
  const [tab, setTab] = useState("schedule");
  const [navigation, setNavigation] = useState<BottomNavTab>("home");
  const [fixed, setFixed] = useState(false);
  return (
    <section
      id="foundation"
      aria-labelledby="foundation-heading"
      className="flex flex-col gap-hm-16"
    >
      <h2
        id="foundation-heading"
        className="text-hm-heading-section"
      >
        표시·선택·탐색
      </h2>
      <div className="grid gap-hm-16 md:grid-cols-2 xl:grid-cols-3">
        <Example title="Badge · Neutral / Brand / Error">
          <div className="flex flex-wrap gap-hm-8">
            <Badge label="승인 대기" />
            <Badge
              label="반영"
              tone="brand"
            />
            <Badge
              label="분석 실패"
              tone="error"
            />
          </div>
        </Example>
        <Example title="Avatar · 기본 / 본인">
          <div className="flex gap-hm-16">
            <Avatar name="수진" />
            <Avatar
              name="수진"
              emphasis="self"
            />
          </div>
        </Example>
        <Example title="TextAction · 기본 / 주의 / 비활성">
          <TextAction onClick={() => onAction("보조 행동 클릭 확인")}>
            보조 행동
          </TextAction>
          <TextAction
            tone="danger"
            onClick={() => onAction("주의 행동 클릭 확인 · 삭제 없음")}
          >
            주의 행동
          </TextAction>
          <TextAction disabled>비활성 보조 행동</TextAction>
        </Example>
        <Example title="SelectionRow · Checkbox">
          <SelectionRow
            label="선택 상태 확인"
            description="Space 키 또는 행 클릭으로 전환"
            checked={selected}
            onChange={(event) => setSelected(event.target.checked)}
          />
          <SelectionRow
            label="비활성 미선택"
            disabled
          />
          <SelectionRow
            label="비활성 선택"
            defaultChecked
            disabled
          />
        </Example>
        <Example title="SelectionRow · Radio">
          <fieldset className="flex min-w-0 flex-col gap-hm-12">
            <legend className="mb-hm-8 text-hm-caption-default text-hm-text-secondary">
              예시 담당자 · 방향키로 선택
            </legend>
            {[
              { value: "one", label: "수진", description: "나 · 소유자" },
              { value: "two", label: "민수", description: "구성원" },
              {
                value: "none",
                label: "담당 미정",
                description: "선택 동작 확인용 예시",
              },
            ].map((item) => (
              <SelectionRow
                key={item.value}
                control="radio"
                name="preview-assignee"
                value={item.value}
                label={item.label}
                description={item.description}
                checked={assignee === item.value}
                onChange={() => setAssignee(item.value)}
              />
            ))}
            <SelectionRow
              control="radio"
              name="disabled-assignee"
              label="비활성 라디오"
              defaultChecked
              disabled
            />
          </fieldset>
        </Example>
        <Example title="TabItem / Tabs · 키보드 탐색">
          <Tabs
            label="돌봄 유형 예시"
            value={tab}
            onValueChange={setTab}
            items={[
              {
                value: "schedule",
                label: "일정",
                content: <p>일정 패널 · Mock</p>,
              },
              {
                value: "todo",
                label: "할 일",
                content: <p>할 일 패널 · Mock</p>,
              },
              {
                value: "question",
                label: "확인사항",
                content: <p>확인사항 패널 · Mock</p>,
              },
              {
                value: "disabled",
                label: "비활성",
                disabled: true,
                content: null,
              },
            ]}
          />
          <TabItem disabled>독립 비활성 탭</TabItem>
        </Example>
        <Example title="MenuRow · 기본 / 주의">
          <MenuRow
            title="내 계정"
            description="메뉴 행 조합 예시"
            onClick={() => onAction("메뉴 행 클릭 확인")}
          />
          <MenuRow
            title="나가기"
            description="주의 행동 표시 예시"
            tone="danger"
            onClick={() => onAction("주의 메뉴 클릭 확인 · 실제 나가기 없음")}
          />
        </Example>
        <Example title="SectionHeader · 행동 있음 / 없음">
          <SectionHeader
            title="다가오는 일정"
            action={{
              label: "모두 보기",
              onClick: () => onAction("섹션 행동 클릭 확인"),
            }}
          />
          <SectionHeader title="가족이 남긴 소식" />
        </Example>
        <Example title="NavItem · 기본 / 선택">
          <div className="flex gap-hm-16">
            <NavItem
              label="홈"
              icon="home-secondary"
              onClick={() => onAction("NavItem 기본 클릭 확인")}
            />
            <NavItem
              label="홈"
              icon="home-secondary"
              selectedIcon="home-brand"
              selected
              onClick={() => onAction("NavItem 선택 클릭 확인")}
            />
          </div>
        </Example>
      </div>
      <div className="grid gap-hm-16 lg:grid-cols-2">
        <Example title="BottomNav · 홈 / 돌봄 / 소식 / 가족 / 전체">
          <p className="text-hm-caption-default text-hm-text-secondary">
            현재 탭: {navigation} · 실제 페이지 이동 없음
          </p>
          <label className="flex min-h-hm-touch-min items-center gap-hm-8 text-hm-body-small">
            <input
              type="checkbox"
              checked={fixed}
              onChange={(event) => setFixed(event.target.checked)}
            />
            하단 내비게이션 고정 확인
          </label>
          <BottomNav
            active={navigation}
            position={fixed ? "fixed" : "static"}
            onNavigate={setNavigation}
          />
        </Example>
        <Example title="ActionBar · 단일 / 보조 행동 포함">
          <ActionBar
            primary={{
              label: "선택한 제안 승인 요청",
              onClick: () =>
                onAction("Mock · 구성원 요청 동작 확인 · 현재 정보 유지"),
            }}
          />
          <ActionBar
            primary={{
              label: "선택한 제안 반영",
              onClick: () =>
                onAction("Mock · 소유자 최종 반영 동작 확인 · 실제 저장 없음"),
            }}
            secondary={{
              label: "나중에 확인하기",
              onClick: () => onAction("보조 행동 확인"),
            }}
          />
        </Example>
      </div>
    </section>
  );
}
