import { useParams } from "react-router";
import { ConnectedInvitationPage } from "./ConnectedInvitationPage";
export function InvitationPage() {
  const { invitationToken = "" } = useParams();
  return <ConnectedInvitationPage key={invitationToken} />;
}
