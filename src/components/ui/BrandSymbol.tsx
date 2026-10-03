import symbol from "@/assets/brand/hanmaum-symbol.svg";
import loginSymbol from "@/assets/brand/hanmaum-symbol-login.svg";

export function BrandSymbol({
  size = "header",
  decorative = false,
}: {
  size?: "header" | "login";
  decorative?: boolean;
}) {
  return (
    <img
      src={size === "login" ? loginSymbol : symbol}
      alt={decorative ? "" : "한마음"}
      className="shrink-0"
      draggable={false}
    />
  );
}
