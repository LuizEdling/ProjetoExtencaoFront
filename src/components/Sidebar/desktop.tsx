import { Link, NavLink } from "react-router-dom";
import { NAV_LINKS } from "../../constants/nav-links";
import ThemeToggle from "./ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "w-full p-3 rounded-[15px] cursor-pointer text-md flex gap-2 items-center transition-all",
    "text-(--text-primary)",
    isActive
      ? "bg-(--highlighted-text) font-medium shadow-sm"
      : "hover:bg-(--highlighted-text)/60",
  ].join(" ");

export default function SidebarDesktop() {
  return (
    <section
      className="
        h-screen w-65 shrink-0
        px-10 py-4
        flex flex-col
        bg-(--background-second-layer)
        justify-between
        border-r border-(--light-gray)/30
      "
    >
      <div>
        <div className="mb-10">
          <Link
            to="/painel"
            className="inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)"
            aria-label="Ir para o painel"
          >
            <img
              src="/favicon.ico"
              alt="Projeto Extensão"
              className="w-12 h-12 object-contain rounded-lg"
            />
          </Link>
        </div>

        <nav>
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.path}>
                <NavLink to={link.path} className={navLinkClass} end>
                  <img src={link.icoPath} alt="" className="w-5 h-5 shrink-0" />
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div>
        <hr className="mb-4 border-(--light-gray)/40" />

        <div className="flex flex-col gap-1">
          <ThemeToggle />

          <NavLink
            to="/"
            className="
              flex flex-row items-center gap-2
              p-2 rounded-[12px]
              text-(--text-primary)
              hover:bg-(--highlighted-text)/40 transition-all
            "
          >
            <img src="/icons/sidebar/logout.svg" alt="" className="w-5 h-5" />
            <span>Sair</span>
          </NavLink>
        </div>
      </div>
    </section>
  );
}
