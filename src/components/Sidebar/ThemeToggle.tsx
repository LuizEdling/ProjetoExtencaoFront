import { useDarkMode } from "../../hooks/useDarkMode";

export default function ThemeToggle() {
  const { dark, toggle } = useDarkMode();

  return (
    <button
      type="button"
      onClick={toggle}
      className="
        flex flex-row items-center gap-2
        w-full p-2 rounded-[12px]
        cursor-pointer text-left text-md
        text-(--text-primary)
        hover:bg-(--highlighted-text)/40 transition-all
      "
    >
      <img
        src={dark ? "/icons/sidebar/light-mode.svg" : "/icons/sidebar/dark-mode.svg"}
        alt=""
        className="w-5 h-5 shrink-0"
      />
      <span>{dark ? "Modo claro" : "Modo escuro"}</span>
    </button>
  );
}
