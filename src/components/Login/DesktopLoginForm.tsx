import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../lib/authApi";
import { getLoginErrorMessage } from "../../lib/loginErrorMessage";
import LoginImage from "../../assets/images/Login/login-image.webp";
import LoginPasswordInput from "./LoginPasswordInput";
import AppAlert from "../ui/AppAlert";

export default function LoginForm() {
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
      <div className="w-100 lg:w-40/100 h-screen p-25 flex flex-col gap-25 justify-center">
        <header
          className="
            flex gap-6.25
            items-end
          "
        >
          <img src="/logo.webp" alt="Logo do sistema" className="w-25 h-25" />
          <p className="text-(--green-title) text-[30px] font-extralight font-family-inter">BorderCare</p>
        </header>

        <form className="flex flex-col gap-12.5" onSubmit={handleSubmit}>
          {error ? (
            <AppAlert variant="error" compact>
              {error}
            </AppAlert>
          ) : null}

          <div className="flex flex-col">
            <label htmlFor="login-email-desktop" className="font-extralight">
              Login ou Email
            </label>
            <input
              id="login-email-desktop"
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
            <label htmlFor="login-password-desktop" className="font-extralight">
              Senha
            </label>
            <LoginPasswordInput
              id="login-password-desktop"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitting}
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
      <div className="absolute bottom-0 right-0 w-[58%] h-screen flex items-end">
        <img src={LoginImage} alt="Imagem Login" className="w-full h-auto object-contain" />
      </div>
    </div>
  );
}
