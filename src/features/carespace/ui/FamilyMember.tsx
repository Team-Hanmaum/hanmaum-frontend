import { Avatar, Badge } from "@/components/ui";
export type FamilyMemberProps = {
  name: string;
  role: "owner" | "member";
  detail?: string;
  self?: boolean;
  initial?: string;
  className?: string;
};
export function FamilyMember({
  name,
  role,
  detail,
  self = false,
  initial,
  className = "",
}: FamilyMemberProps) {
  return (
    <div
      className={`flex w-full items-center gap-hm-12 rounded-hm-14 bg-hm-bg-surface p-hm-16 ${className}`}
    >
      <Avatar
        name={name}
        initial={initial}
        emphasis={self ? "self" : "default"}
        decorative
      />
      <div className="flex min-w-0 flex-1 flex-col gap-hm-4 wrap-anywhere">
        <p className="text-hm-body-emphasis">{name}</p>
        {detail && (
          <p className="text-hm-caption-default text-hm-text-secondary">
            {detail}
          </p>
        )}
      </div>
      <Badge
        tone={role === "owner" ? "brand" : "neutral"}
        label={role === "owner" ? "소유자" : "구성원"}
        className="shrink-0"
      />
    </div>
  );
}
