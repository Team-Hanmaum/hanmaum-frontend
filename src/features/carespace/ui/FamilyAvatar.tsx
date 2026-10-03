import { Avatar } from "@/components/ui";
export type FamilyAvatarProps = {
  name: string;
  roleLabel: string;
  initial?: string;
  self?: boolean;
  className?: string;
};
export function FamilyAvatar({
  name,
  roleLabel,
  initial,
  self = false,
  className = "",
}: FamilyAvatarProps) {
  return (
    <div
      className={`flex w-22.5 max-w-full flex-col items-center gap-hm-4 text-center wrap-anywhere ${className}`}
    >
      <Avatar
        name={name}
        initial={initial}
        emphasis={self ? "self" : "default"}
        decorative
      />
      <p className="w-full text-hm-body-emphasis">{name}</p>
      <p className="w-full text-hm-caption-default text-hm-text-secondary">
        {roleLabel}
      </p>
    </div>
  );
}
