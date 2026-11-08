import { Fragment, useState, type ReactNode } from "react";
import { useLocation } from "react-router";
import { ExampleContext } from "@/components/feedback/exampleContext";
import { ConfirmDialog } from "@/components/feedback";
import { resetExampleData, useExampleRevision } from "@/lib/examplePreview";
import { useAppNavigate } from "../useAppNavigate";
import { paths, spacePath } from "../paths";

export function ExampleSurface({ children }: { children: ReactNode }) {
  const [confirm, setConfirm] = useState(false);
  const revision = useExampleRevision();
  const navigate = useAppNavigate();
  const { pathname } = useLocation();
  return (
    <ExampleContext value={{ onReset: () => setConfirm(true) }}>
      <Fragment key={revision}>{children}</Fragment>
      <ConfirmDialog
        open={confirm}
        onOpenChange={setConfirm}
        title="예시 데이터를 초기화할까요?"
        body="이 브라우저에서 입력한 예시 내용만 사라져요. 실제 서버 데이터는 유지돼요."
        confirmLabel="예시 초기화"
        onConfirm={() => {
          resetExampleData();
          setConfirm(false);
          const id = /^\/spaces\/([^/]+)/.exec(pathname)?.[1];
          void navigate(
            id ? spacePath(decodeURIComponent(id), "care") : paths.account,
            { replace: true },
          );
        }}
      />
    </ExampleContext>
  );
}
