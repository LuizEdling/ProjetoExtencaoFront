import { useState } from "react";
import { NAV_LINKS } from "../../constants/nav-links";

export default function SidebarMobile() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Top bar */}
      <header
        className="
          fixed top-0 left-0 right-0 z-50
          h-14
          px-4
          flex items-center justify-between
          bg-(--background-second-layer)
          border-b border-white/10
        "
      >
        <img src="/logo.webp" className="w-10 h-10" />

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="
            p-2 rounded-[10px]
            hover:bg-(--highlighted-text)/60 transition-all
            cursor-pointer
          "
          aria-label="Abrir menu"
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

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <aside
        className={`
          fixed top-0 left-0 z-50
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
            <img src="/logo.webp" className="w-14 h-14" />
          </div>

          <nav>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.name}>
                  <a
                    onClick={() => setIsOpen(false)}
                    className="
                      w-full
                      p-3
                      rounded-[15px]
                      cursor-pointer
                      text-md
                      flex gap-2 items-center
                      hover:bg-(--highlighted-text)/60 transition-all
                    "
                  >
                    <img
                      src={link.icoPath}
                      alt={`Ícone para ${link.name}`}
                    />
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div>
          <hr className="mb-5" />
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-row gap-2 p-2">
              <img
                src="/icons/sidebar/logout.svg"
                alt="Ícone para log out"
                className="w-5"
              />
              <p>Sair</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer para o conteúdo não ficar atrás da top bar */}
      <div className="h-14" />
    </>
  );
}