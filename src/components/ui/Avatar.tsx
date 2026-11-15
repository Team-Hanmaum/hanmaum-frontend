import { useState } from "react";

export type AvatarProps = {
  name: string;
  initial?: string;
  profileImageUrl?: string | null;
  emphasis?: "default" | "self";
  size?: "default" | "compact";
  decorative?: boolean;
  className?: string;
};
export function Avatar({
  name,
  initial = Array.from(name.trim())[0] ?? "?",
  profileImageUrl,
  emphasis = "default",
  size = "default",
  decorative = false,
  className = "",
}: AvatarProps) {
  const photo = httpsPhotoUrl(profileImageUrl);
  return (
    <span
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-hm-full ${size === "compact" ? "size-hm-32 text-hm-body-emphasis" : "size-hm-touch-min text-hm-heading-section"} ${emphasis === "self" ? "bg-hm-bg-brand-subtle text-hm-text-brand" : "bg-hm-bg-subtle text-hm-text-secondary"} ${className}`}
    >
      {photo ? (
        <AvatarPhoto
          key={photo}
          src={photo}
          initial={initial}
        />
      ) : (
        initial
      )}
    </span>
  );
}

function httpsPhotoUrl(value: string | null | undefined) {
  if (!value) return;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password)
      return url.href;
  } catch {
    return;
  }
}

function AvatarPhoto({ src, initial }: { src: string; initial: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">(
    "loading",
  );
  return (
    <>
      {status !== "loaded" && initial}
      {status !== "failed" && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          loading="lazy"
          className={`absolute inset-0 size-full object-cover ${status === "loaded" ? "" : "opacity-0"}`}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("failed")}
        />
      )}
    </>
  );
}
