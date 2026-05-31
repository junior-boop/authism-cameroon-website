import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { api, adminApi, mediaUrl, type MediaFile } from "../../lib/api";

const FOLDERS = [
  "hero",
  "news",
  "gallery",
  "events",
  "associations",
  "experts",
] as const;

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

type Props = {
  token: string;
  onSelect: (key: string) => void;
  onClose: () => void;
  defaultFolder?: string;
};

export default function MediaPickerModal({ token, onSelect, onClose, defaultFolder }: Props) {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterFolder, setFilterFolder] = useState<string>(defaultFolder ?? "all");
  const [justUploadedKey, setJustUploadedKey] = useState<string | null>(null);
  const newItemRef = useRef<HTMLButtonElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  const reload = () =>
    api.media().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  useEffect(() => {
    if (justUploadedKey && newItemRef.current) {
      newItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [justUploadedKey, items]);

  async function handleUpload(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    const formEl = formRef.current;
    if (!formEl) return;
    const form = new FormData(formEl);
    const folder = form.get('folder') as string;
    const fileInput = formEl.querySelector('input[type="file"]') as HTMLInputElement;
    if (!fileInput?.files?.length) {
      setError("Veuillez sélectionner un fichier");
      return;
    }
    setUploading(true);
    setError(null);
    setJustUploadedKey(null);
    try {
      const res = await adminApi(token).media.upload(form);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Erreur upload");
      }
      const { key } = await res.json() as { key: string };
      formEl.reset();
      setJustUploadedKey(key);
      if (filterFolder !== folder && filterFolder !== "all") setFilterFolder(folder);
      await reload();
    } catch (err: any) {
      setError((err as Error).message ?? "Erreur upload");
    } finally {
      setUploading(false);
    }
  }

  const filtered = filterFolder === "all" ? items : items.filter((m) => m.folder === filterFolder);

  return createPortal(
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative">

        {/* Upload overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-white/80 rounded-xl z-10 flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 border-4 border-[#00bcd4] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 font-medium text-sm">Téléchargement en cours…</p>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <h2 className="font-bold text-gray-900">Médiathèque</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="px-6 py-4 border-b shrink-0 bg-gray-50">
          <form ref={formRef} className="flex flex-col sm:flex-row gap-3 items-end">
            <label className="flex flex-col gap-1 text-sm text-gray-700 flex-1">
              Dossier
              <select
                name="folder"
                required
                defaultValue={defaultFolder}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]"
              >
                {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-gray-700 flex-1">
              Fichier
              <input
                type="file"
                name="file"
                required
                className="border border-gray-300 rounded px-3 py-1.5 text-sm file:mr-3 file:border-0 file:bg-white file:px-3 file:py-1 file:rounded file:text-sm file:font-medium file:cursor-pointer"
              />
            </label>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-5 py-2 rounded text-sm disabled:opacity-60 shrink-0"
            >
              Uploader
            </button>
          </form>
          {error && <p className="text-red-600 text-xs mt-2">{error}</p>}
          {justUploadedKey && !uploading && (
            <p className="text-green-600 text-xs mt-2 font-medium">
              Fichier uploadé — cliquez dessus dans la grille pour le sélectionner
            </p>
          )}
        </div>

        <div className="px-6 py-3 border-b shrink-0 flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterFolder("all")}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filterFolder === "all" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Tous ({items.length})
          </button>
          {FOLDERS.map((f) => {
            const count = items.filter((m) => m.folder === f).length;
            if (count === 0) return null;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setFilterFolder(f)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${filterFolder === f ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {f} ({count})
              </button>
            );
          })}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-lg" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">Aucun fichier dans ce dossier</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {filtered.map((file) => {
                const url = mediaUrl(file.key);
                const isImage = file.content_type?.startsWith("image/");
                const isNew = file.key === justUploadedKey;
                return (
                  <button
                    key={file.key}
                    ref={isNew ? newItemRef : null}
                    type="button"
                    onClick={() => { onSelect(file.key); }}
                    className={`rounded-lg border-2 overflow-hidden text-left transition-all ${
                      isNew
                        ? "border-green-500 ring-2 ring-green-300 bg-green-50 scale-105"
                        : "bg-white border-gray-200 hover:border-[#00bcd4]"
                    }`}
                  >
                    <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden relative">
                      {isNew && (
                        <span className="absolute top-1 right-1 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                          NOUVEAU
                        </span>
                      )}
                      {isImage && url
                        ? <img src={url} alt={file.filename} className="w-full h-full object-cover" />
                        : (
                          <div className="flex flex-col items-center gap-1 text-gray-400 px-2 text-center">
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            <span className="text-xs">{file.content_type?.split("/")[1] ?? "file"}</span>
                          </div>
                        )
                      }
                    </div>
                    <div className="p-2">
                      <p className="text-xs text-gray-700 truncate font-medium" title={file.filename}>{file.filename}</p>
                      <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
