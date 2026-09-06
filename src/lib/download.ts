import { getFileUrl } from "./files";
import type { Asset } from "./types";

function triggerDownload(url: string, filename: string, revoke = false) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (revoke) setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

function safeName(asset: Asset, url: string) {
  const base = asset.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "asset";
  if (/\.[a-z0-9]{2,4}$/i.test(base)) return base;
  const ext = (url.split("?")[0] ?? "").split(".").pop();
  return ext && ext.length <= 4 ? `${base}.${ext}` : base;
}

/** Download one asset: local uploaded file first, otherwise its direct media URL. */
export async function downloadAsset(asset: Asset): Promise<void> {
  if (asset.hasFile) {
    const url = await getFileUrl(asset.id);
    if (url) {
      triggerDownload(url, safeName(asset, asset.name), true);
      return;
    }
  }
  const remote = asset.downloadUrl || asset.previewUrl || asset.sourceUrl;
  if (!remote) throw new Error("This asset has no downloadable file.");
  try {
    const res = await fetch(remote, { mode: "cors" });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    triggerDownload(URL.createObjectURL(blob), safeName(asset, remote), true);
  } catch {
    // Cross-origin block: open the file so the browser can save it directly.
    window.open(remote, "_blank", "noopener");
  }
}
