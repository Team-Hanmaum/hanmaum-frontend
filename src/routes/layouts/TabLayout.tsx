import { Link, Outlet, useMatches, useNavigate, useParams } from "react-router";
import {
  BottomNav,
  Header,
  PageLayout,
  type NavItemProps,
} from "@/components/layout";
import { NotFoundPage } from "@/pages/error/NotFoundPage";
import { paths, spacePath, spaceTabs, type SpaceTab } from "../paths";

const renderNavLink: NonNullable<NavItemProps["renderLink"]> = ({
  href,
  ...props
}) => (
  <Link
    to={href}
    {...props}
  />
);

export function TabLayout() {
  const { careSpaceId } = useParams();
  const navigate = useNavigate();
  const matches = useMatches();
  const handle = matches.at(-1)?.handle as { tab?: SpaceTab } | undefined;
  const active = handle?.tab;
  if (!careSpaceId || !active || !spaceTabs.includes(active))
    return <NotFoundPage />;

  const destinations = {
    home: spacePath(careSpaceId, "home"),
    care: spacePath(careSpaceId, "care"),
    news: spacePath(careSpaceId, "news"),
    family: spacePath(careSpaceId, "family"),
    all: spacePath(careSpaceId, "all"),
  };
  return (
    <PageLayout
      header={
        <Header
          variant="main"
          space={{
            name: "공간 선택",
            onClick: () => void navigate(paths.spaces),
          }}
        />
      }
      footer={
        <BottomNav
          active={active}
          destinations={destinations}
          renderLink={renderNavLink}
          position="fixed"
        />
      }
    >
      <Outlet />
      <p className="text-hm-caption-default wrap-anywhere text-hm-text-secondary">
        Mock · 현재 경로의 공간 ID: {careSpaceId}
      </p>
    </PageLayout>
  );
}
