import { Icon, TextAction } from "@/components/ui";
export type SourceProps = { className?: string } & (
  | {
      state: "available";
      heading: string;
      meta: string;
      quote: string;
      onViewOriginal?: () => void;
      actionLabel?: string;
    }
  | {
      state: "redacted";
      heading?: never;
      meta?: never;
      quote?: never;
      onViewOriginal?: never;
      actionLabel?: never;
    }
);
export function Source(props: SourceProps) {
  return (
    <section
      className={`flex w-full min-w-0 flex-col items-start gap-hm-12 rounded-hm-14 bg-hm-bg-surface p-hm-20 wrap-anywhere ${props.className ?? ""}`}
    >
      {props.state === "redacted" ? (
        <>
          <Icon name="lock-secondary" />
          <h3 className="w-full text-hm-heading-section">
            원본 소식이 삭제됐어요
          </h3>
          <p className="w-full text-hm-body-default text-hm-text-secondary">
            원문은 다시 볼 수 없어요.
            <br />
            현재 정보는 별도로 확인해 주세요.
          </p>
        </>
      ) : (
        <>
          <h3 className="w-full text-hm-heading-section">{props.heading}</h3>
          <p className="w-full text-hm-caption-default text-hm-text-secondary">
            {props.meta}
          </p>
          <blockquote className="w-full text-hm-body-reading whitespace-pre-wrap">
            {props.quote}
          </blockquote>
          {props.onViewOriginal && (
            <TextAction
              className="w-full"
              onClick={props.onViewOriginal}
            >
              {props.actionLabel ?? "소식 원문 보기"}
            </TextAction>
          )}
        </>
      )}
    </section>
  );
}
