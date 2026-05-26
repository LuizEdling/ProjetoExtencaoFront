import { Outlet } from "react-router-dom";
import { useIsMobile } from "../hooks/useIsMobile";
import SidebarDesktop from "../components/Sidebar/desktop";
import SidebarMobile from "../components/Sidebar/mobile";

export default function AppLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <>
        <SidebarMobile />
        <main
          className="
            min-h-screen
            bg-(--background-first-layer)
            pt-4 px-4 pb-8
          "
        >
          <Outlet />
        </main>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-(--background-first-layer)">
      <SidebarDesktop />
      <main className="ml-65 min-h-screen min-w-0 overflow-y-auto px-6 py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
