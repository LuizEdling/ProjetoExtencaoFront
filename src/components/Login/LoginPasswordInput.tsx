import { useState, type ChangeEventHandler } from "react";

type LoginPasswordInputProps = {
  id: string;
  value: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
  disabled?: boolean;
};

function EyeOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c1.841 0 3.573-.487 5.07-1.337M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function LoginPasswordInput({ id, value, onChange, disabled = false }: LoginPasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative mt-1">
      <input
        id={id}
        name="password"
        type={showPassword ? "text" : "password"}
        autoComplete="current-password"
        value={value}
        onChange={onChange}
        required
        disabled={disabled}
        className="
          w-full
          border border-(--text-secondary)
          rounded-sm
          h-10
          p-2
          pr-10
          transition-all duration-200

          hover:border-(--green-title)
          focus:outline-none
          focus:border-(--green-title)
          focus:ring-1 focus:ring-(--green-title)

          active:border-(--green-title)
        "
      />
      <button
        type="button"
        onClick={() => setShowPassword((prev) => !prev)}
        disabled={disabled}
        aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={showPassword}
        className="
          absolute right-2 top-1/2 -translate-y-1/2
          flex h-8 w-8 items-center justify-center
          rounded-sm text-(--text-secondary)
          transition-colors
          hover:text-(--green-title)
          disabled:opacity-60 disabled:pointer-events-none
          focus:outline-none focus-visible:ring-1 focus-visible:ring-(--green-title)
        "
      >
        {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
}
