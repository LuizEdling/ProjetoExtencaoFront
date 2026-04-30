import { useNavigate } from "react-router-dom";

export default function Adocoes() {
  const navigate = useNavigate();

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-(--green-title)">
            Adoções
          </h1>

          <p className="text-sm text-(--text-secondary)">
            Gerencie as adoções realizadas
          </p>
        </div>

        <button
          onClick={() => navigate("/adotantes")}
          className="
            px-6 py-2.5 rounded-full
            bg-(--light-green) text-white text-sm font-medium
            hover:opacity-90 transition-all duration-200
            active:scale-[0.98]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-(--highlighted-text)
          "
        >
          Gerenciar Adotantes
        </button>
      </div>

      {/* CONTEÚDO */}
      <div
        className="
          rounded-2xl border border-(--light-gray)/25
          bg-(--background-second-layer)
          shadow-sm p-6
        "
      >
        <p className="text-(--text-primary)">
          Aqui você poderá gerenciar as adoções realizadas pela entidade.
        </p>

        {/* PLACEHOLDER */}
        <div
          className="
            mt-4 p-6 text-center rounded-xl
            border border-dashed border-(--light-gray)/40
            text-(--text-secondary)
          "
        >
          Módulo de adoções em desenvolvimento...
        </div>
      </div>
    </div>
  );
}