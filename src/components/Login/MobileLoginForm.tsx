import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../lib/authApi";
import { getLoginErrorMessage } from "../../lib/loginErrorMessage";
import image from "../../assets/images/Login/GreenShade.png";

export default function MobileLoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await loginRequest(email.trim(), password);
      navigate("/painel", { replace: true });
    } catch (err) {
      setError(getLoginErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="w-full h-screen flex justify-center items-center relative z-10">
        <div className="w-full max-w-100 p-5 flex flex-col gap-25">
          <header
            className="
            flex gap-3
            items-end justify-center
          "
          >
            <img src="/logo.webp" alt="Logo do sistema" className="w-15 h-15" />
            <p className="text-(--green-title) text-[28px] font-extralight font-family-inter">Gerenciador</p>
          </header>

          <form className="flex flex-col gap-12.5" onSubmit={handleSubmit}>
            {error ? (
              <p className="text-sm text-red-600 dark:text-red-400 text-center" role="alert">
                {error}
              </p>
            ) : null}

            <div className="flex flex-col">
              <label htmlFor="login-email-mobile" className="font-extralight">
                Login ou Email
              </label>
              <input
                id="login-email-mobile"
                name="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                className="
                border border-(--text-secondary)
                mt-1
                rounded-sm
                h-10
                p-2
                transition-all duration-200

                hover:border-(--green-title)
                focus:outline-none
                focus:border-(--green-title)
                focus:ring-1 focus:ring-(--green-title)

                active:border-(--green-title)
              "
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="login-password-mobile" className="font-extralight">
                Senha
              </label>
              <input
                id="login-password-mobile"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                className="
                border border-(--text-secondary)
                mt-1
                rounded-sm
                h-10
                p-2
                transition-all duration-200

                hover:border-(--green-title)
                focus:outline-none
                focus:border-(--green-title)
                focus:ring-1 focus:ring-(--green-title)

                active:border-(--green-title)
              "
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-6.25 p-3 bg-(--green-title) rounded-2xl text-white disabled:opacity-60"
              >
                {submitting ? "Entrando…" : "Entrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img
          src={image}
          alt="Imagem Login"
          className="
          absolute top-0 left-0
          w-100
          object-cover
          -translate-x-1/2 -translate-y-1/2
        "
        />

        <img
          src={image}
          alt="Imagem Login"
          className="
          absolute bottom-0 right-0
          w-100
          object-cover
          translate-x-1/2 translate-y-1/2
        "
        />
      </div>
    </div>
  );
}
