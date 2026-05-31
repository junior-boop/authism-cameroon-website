import { useState, useEffect } from "react";
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

export default function AdminMedia({ token }: { token: string }) {
  const [items, setItems] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    api.media().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setUploadPct(0);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await adminApi(token).mediaUpload.upload(form, setUploadPct);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Erreur upload");
      }
      await reload();
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message ?? "Erreur upload");
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  }

  async function handleDelete(key: string) {
    if (!confirm("Supprimer ce fichier ?")) return;
    await adminApi(token).media.delete(key);
    setItems((prev) => prev.filter((m) => m.key !== key));
  }

  const grouped = {
    image: items.filter((m) => m.media_type === 'image'),
    pdf:   items.filter((m) => m.media_type === 'pdf'),
    other: items.filter((m) => !m.media_type || (m.media_type !== 'image' && m.media_type !== 'pdf')),
  };

  const MediaGrid = ({ files }: { files: MediaFile[] }) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {files.map((file) => {
        const url = mediaUrl(file.key);
        const isImage = file.content_type?.startsWith("image/");
        return (
          <div key={file.key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group">
            <div className="aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
              {isImage && url
                ? <img src={url} alt={file.filename} className="w-full h-full object-cover" />
                : <div className="flex flex-col items-center gap-2 text-gray-400 px-3 text-center">
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                  <span className="text-xs truncate w-full text-center">{file.content_type}</span>
                </div>
              }
            </div>
            <div className="p-3">
              <p className="text-xs font-medium text-gray-800 truncate" title={file.filename}>{file.filename}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
              <div className="flex gap-2 mt-2">
                {url && (
                  <a href={url} target="_blank" className="text-xs text-blue-600 hover:underline">Voir</a>
                )}
                <button
                  onClick={() => handleDelete(file.key)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        );
      })}
      {files.length === 0 && (
        <div className="col-span-4 py-8 text-center text-gray-400 text-sm">Aucun fichier</div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3">{error}</div>
      )}

      {/* Upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="font-bold text-gray-900 mb-4">Uploader un fichier</h2>
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 items-end">
          <label className="flex flex-col gap-1 text-sm text-gray-700 flex-1">
            Dossier *
            <select
              name="folder"
              required
              className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]"
            >
              {FOLDERS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm text-gray-700 flex-1">
            Fichier *
            <input
              type="file"
              name="file"
              required
              className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00bcd4] file:mr-3 file:border-0 file:bg-gray-100 file:px-3 file:py-1 file:rounded file:text-sm file:font-medium file:cursor-pointer"
            />
          </label>
          <button
            type="submit"
            disabled={uploading}
            className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-60 shrink-0"
          >
            {uploading ? "Upload…" : "Uploader"}
          </button>
        </form>
        {uploading && uploadPct > 0 && uploadPct < 100 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Upload en cours…</span>
              <span>{uploadPct}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#00bcd4] rounded-full transition-all duration-150" style={{ width: `${uploadPct}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Contenu groupé par type */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {grouped.image.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">📸 Images ({grouped.image.length})</h3>
              <MediaGrid files={grouped.image} />
            </div>
          )}
          {grouped.pdf.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">📄 PDF ({grouped.pdf.length})</h3>
              <MediaGrid files={grouped.pdf} />
            </div>
          )}
          {grouped.other.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">📄 Autres ({grouped.other.length})</h3>
              <MediaGrid files={grouped.other} />
            </div>
          )}
          {items.length === 0 && (
            <div className="py-16 text-center text-gray-400">Aucun fichier</div>
          )}
        </div>
      )}
    </div>
  );
}
