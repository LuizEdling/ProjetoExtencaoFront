import DesktopLoginForm from "./DesktopLoginForm";
import { useIsDesktop } from "../../hooks/useIsDesktop";
import MobileLoginForm from "./MobileLoginForm";

export default function Login() {
  const isDesktop = useIsDesktop();

  return (
    <div className="bg-(--background-first-layer)">
      {isDesktop ? <MobileLoginForm /> : <DesktopLoginForm />}
    </div>
  );
}
