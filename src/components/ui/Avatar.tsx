export type AvatarProps = {
  name: string;
  initial?: string;
  emphasis?: "default" | "self";
  decorative?: boolean;
  className?: string;
};
export function Avatar({
  name,
  initial = Array.from(name.trim())[0] ?? "?",
  emphasis = "default",
  decorative = false,
  className = "",
}: AvatarProps) {
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={`inline-flex size-hm-touch-min shrink-0 items-center justify-center rounded-hm-full text-hm-heading-section ${emphasis === "self" ? "bg-hm-bg-brand-subtle text-hm-text-brand" : "bg-hm-bg-subtle text-hm-text-secondary"} ${className}`}
    >
      {initial}
    </span>
  );
}
