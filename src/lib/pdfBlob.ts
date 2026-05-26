/** Download de blob PDF no navegador (uso compartilhado: contratos, relatórios). */
export function triggerPdfDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Tenta extrair mensagem de erro quando o servidor devolve JSON dentro de um Blob. */
export async function messageFromErrorBlob(blob: Blob): Promise<string | null> {
  try {
    const text = await blob.text();
    const parsed = JSON.parse(text) as { message?: string; mensagem?: string };
    return parsed.mensagem ?? parsed.message ?? null;
  } catch {
    return null;
  }
}
