export type AlertVariant = "success" | "error" | "warning" | "info";

export function alertToneClass(variant: AlertVariant, celebration = false): string {
  if (celebration) {
    return "border-(--success-advice)/50 bg-(--green-bg)/80 text-(--green)";
  }
  switch (variant) {
    case "success":
      return "border-(--light-green)/45 bg-(--light-green-bg)/70 text-(--green-title)";
    case "error":
      return "border-(--error-advice)/40 bg-(--red-bg)/50 text-(--error-advice)";
    case "warning":
      return "border-(--orange)/45 bg-(--orange-bg)/70 text-(--orange)";
    case "info":
      return "border-(--blue)/40 bg-(--blue-bg)/70 text-(--blue)";
  }
}

export function alertRole(variant: AlertVariant): "status" | "alert" {
  return variant === "success" || variant === "info" ? "status" : "alert";
}

export function alertAriaLive(variant: AlertVariant): "polite" | "assertive" {
  return variant === "success" || variant === "info" ? "polite" : "assertive";
}
