import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "../../constants/nav-links";
import { logoutRequest } from "../../lib/authApi";
import ThemeToggle from "./ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  [
    "w-full p-3 rounded-[15px] cursor-pointer text-md flex gap-2 items-center transition-all",
    "text-(--text-primary)",
    isActive
      ? "bg-(--highlighted-text) font-medium shadow-sm"
      : "hover:bg-(--highlighted-text)/60",
  ].join(" ");

export default function SidebarMobile() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    setIsOpen(false);
    await logoutRequest();
    navigate("/", { replace: true });
  }

  return (
    <>
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          h-14
          px-4
          flex items-center justify-between
          bg-(--background-second-layer)
          border-b border-(--light-gray)/20
        "
      >
        <Link
          to="/painel"
          className="inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)"
          aria-label="Ir para o painel"
          onClick={() => setIsOpen(false)}
        >
          <img
            src="/logo.webp"
            alt="Projeto Extensão"
            className="w-10 h-10 object-contain rounded-lg"
          />
        </Link>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="
            p-2 rounded-[10px]
            hover:bg-(--highlighted-text)/60 transition-all
            cursor-pointer text-(--text-primary)
          "
          aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isOpen}
        >
          <div className="flex flex-col gap-1.5 w-5">
            <span
              className={`
                block h-0.5 bg-current rounded transition-all duration-300 origin-center
                ${isOpen ? "rotate-45 translate-y-2" : ""}
              `}
            />
            <span
              className={`
                block h-0.5 bg-current rounded transition-all duration-300
                ${isOpen ? "opacity-0 scale-x-0" : ""}
              `}
            />
            <span
              className={`
                block h-0.5 bg-current rounded transition-all duration-300 origin-center
                ${isOpen ? "-rotate-45 -translate-y-2" : ""}
              `}
            />
          </div>
        </button>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 md:hidden
          h-screen w-72
          px-8 py-6
          flex flex-col justify-between
          bg-(--background-second-layer)
          shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            <Link
              to="/painel"
              className="inline-flex rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)"
              aria-label="Ir para o painel"
              onClick={() => setIsOpen(false)}
            >
              <img
                src="/logo.webp"
                alt="Projeto Extensão"
                className="w-14 h-14 object-contain rounded-lg"
              />
            </Link>
          </div>

          <nav>
            <ul className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    className={navLinkClass}
                    end
                    onClick={() => setIsOpen(false)}
                  >
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
            <button
              type="button"
              onClick={handleLogout}
              className="
                flex flex-row items-center gap-2 p-2 rounded-[12px]
                text-(--text-primary)
                hover:bg-(--highlighted-text)/40 transition-all
                w-full text-left cursor-pointer
              "
            >
              <img src="/icons/sidebar/logout.svg" alt="" className="w-5 h-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="h-14 shrink-0 md:hidden" aria-hidden />
    </>
  );
}
