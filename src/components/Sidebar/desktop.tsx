import { NAV_LINKS } from "../../constants/nav-links";
//import { Link } from "react-router-dom";

export default function SidebarDesktop() {
  return(
    <section
      className="
        h-screen w-65
        px-10 py-4
        flex flex-col
        bg-(--background-second-layer)
        justify-between
      "
    >
      <div>
        <img
          src="/logo.webp"
          className="
            w-25 h-25
            mb-12.5
          "
        />

        <nav>
          <ul
            className="
              flex flex-col
              gap-4
            "
          >
            {NAV_LINKS.map((link) => (
              <li
                key={link.name}
              >
                {/* 
                  TODO: (após criação das rotas)
                  - trocar <a> para <Link> -> react-router-dom
                  - colocar 'bg-(--highlighted-text)' para a rota ativa
                */}
                <a
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
        <hr className="mb-5"/>
        
        <div className="flex flex-col gap-1.5">
          {/* <div
            className="
              flex flex-row gap-2
            "
          >
            <img
              src="/icons/sidebar/dark-mode.svg"
              alt="Ícone modo escuro"
              className="
                w-5
              "
            />
            <p>Modo Escuro</p>
          </div> */}

          <div
            className="
              flex flex-row gap-2
            "
          >
            <img
              src="/icons/sidebar/logout.svg"
              alt="Ícone para log out"
              className="
                w-5
              "
            />
            <p>Sair</p>
          </div>
        </div>
      </div>
    </section>
  );
};