import { Link } from "react-router-dom";

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-(--background-first-layer) px-4">
      <img src="/favicon.ico" alt="" className="w-16 h-16 object-contain rounded-lg" />
      <h1 className="text-xl font-semibold text-(--text-primary)">Entrar</h1>
      <p className="text-(--text-secondary) text-sm text-center">Tela de login em construção.</p>
      <Link
        to="/painel"
        className="text-(--green-title) font-medium underline underline-offset-2 hover:opacity-90"
      >
        Ir ao painel
      </Link>
    </div>
  );
}
