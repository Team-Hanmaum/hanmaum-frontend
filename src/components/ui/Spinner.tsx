import brand from "@/assets/icons/spinner-brand.svg";
import inverse from "@/assets/icons/spinner-inverse.svg";
import secondary from "@/assets/icons/spinner-secondary.svg";

const sources = { brand, inverse, secondary };

export function Spinner({ tone = "brand" }: { tone?: keyof typeof sources }) {
  return (
    <img
      src={sources[tone]}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="shrink-0 motion-safe:animate-spin"
    />
  );
}
