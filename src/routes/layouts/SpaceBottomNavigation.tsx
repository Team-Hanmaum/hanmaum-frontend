import { AppLink } from "@/routes/AppLink";

import { BottomNav, type NavItemProps } from "@/components/layout";
import { spacePath, type SpaceTab } from "../paths";

const renderNavLink: NonNullable<NavItemProps["renderLink"]> = ({
  href,
  ...props
}) => (
  <AppLink
    to={href}
    {...props}
  />
);
export function SpaceBottomNavigation({
  spaceId,
  active,
}: {
  spaceId: string;
  active: SpaceTab;
}) {
  return (
    <BottomNav
      active={active}
      renderLink={renderNavLink}
      destinations={{
        home: spacePath(spaceId, "home"),
        care: spacePath(spaceId, "care"),
        news: spacePath(spaceId, "news"),
        family: spacePath(spaceId, "family"),
        all: spacePath(spaceId, "all"),
      }}
    />
  );
}
