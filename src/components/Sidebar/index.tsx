import SidebarDesktop from "./desktop";
import SidebarMobile from './mobile';
import { useIsMobile } from "../../hooks/useIsMobile";

export default function Sidebar(){
  const isMobile = useIsMobile();

  return isMobile ? <SidebarMobile/> : <SidebarDesktop/>;
}