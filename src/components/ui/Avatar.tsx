export type AvatarProps = {
  name: string;
  initial?: string;
  emphasis?: "default" | "self";
  size?: "default" | "compact";
  decorative?: boolean;
  className?: string;
};
export function Avatar({
  name,
  initial = Array.from(name.trim())[0] ?? "?",
  emphasis = "default",
  size = "default",
  decorative = false,
  className = "",
}: AvatarProps) {
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={`inline-flex shrink-0 items-center justify-center rounded-hm-full ${size === "compact" ? "size-hm-32 text-hm-body-emphasis" : "size-hm-touch-min text-hm-heading-section"} ${emphasis === "self" ? "bg-hm-bg-brand-subtle text-hm-text-brand" : "bg-hm-bg-subtle text-hm-text-secondary"} ${className}`}
    >
      {initial}
    </span>
  );
}
