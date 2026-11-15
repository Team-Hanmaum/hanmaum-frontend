import type { Ref } from "react";
import { Avatar, Badge, type BadgeProps } from "@/components/ui";

export function NewsPreviewCard({
  author,
  time,
  title,
  body,
  badge,
  onOpen,
  ref,
}: {
  author: {
    name: string;
    initial?: string;
    profileImageUrl?: string | null;
    isMine?: boolean;
  };
  time: string;
  title?: string;
  body: string;
  badge?: Pick<BadgeProps, "label" | "tone">;
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
}) {
  return (
    <button
      ref={ref}
      type="button"
      className="hm-focus-ring flex w-full min-w-0 cursor-pointer items-start gap-hm-12 rounded-hm-12 bg-hm-bg-surface px-hm-16 py-hm-12 text-left hover:bg-hm-bg-subtle focus-visible:z-10"
      onClick={onOpen}
    >
      <Avatar
        name={author.name}
        initial={author.initial}
        profileImageUrl={author.profileImageUrl}
        emphasis={author.isMine ? "self" : "default"}
        size="compact"
        decorative
      />
      <span className="flex min-w-0 flex-1 flex-col gap-hm-4 wrap-anywhere">
        <span className="flex flex-wrap items-baseline justify-between gap-x-hm-8">
          <span className="min-w-0 text-hm-body-default font-bold">
            {author.name}
          </span>
          <span className="text-hm-caption-default text-hm-text-secondary">
            {time}
          </span>
        </span>
        {title && <span className="text-hm-body-emphasis">{title}</span>}
        <span className="line-clamp-2 text-hm-body-default whitespace-normal">
          {body}
        </span>
        {badge && (
          <Badge
            {...badge}
            className="self-start"
          />
        )}
      </span>
    </button>
  );
}
