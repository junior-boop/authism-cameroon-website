import { useState, useEffect, useRef } from "react";
import { api, adminApi, mediaUrl, type News, type User } from "../../lib/api";
import MediaField from "./MediaField";
import RichTextEditor from "./RichTextEditor";
import SlugField from "./SlugField";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function initial(name?: string | null) {
  return (name?.trim()?.[0] ?? "A").toUpperCase();
}

function NewsCard({
  item,
  onEdit,
  onDelete,
}: {
  item: News;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const cover = mediaUrl(item.cover_image);
  const excerptLen = item.excerpt?.length ?? 0;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initial(item.author)}
          </div>
          <div className="leading-tight min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{item.author ?? "Anonyme"}</p>
            <p className="text-xs text-gray-400">{formatDate(item.published_at ?? item.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {item.published ? (
            <span className="bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Publié
            </span>
          ) : (
            <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2.5 py-1 rounded-full">
              Brouillon
            </span>
          )}
          <div className="relative" ref={ref}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Actions"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.8" />
                <circle cx="12" cy="12" r="1.8" />
                <circle cx="19" cy="12" r="1.8" />
              </svg>
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-20 py-1 text-sm">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(); }}
                  className="block w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700"
                >
                  Modifier
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(); }}
                  className="block w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600"
                >
                  Supprimer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cover */}
      <div className="rounded-xl bg-gray-100 aspect-[16/10] overflow-hidden">
        {cover ? (
          <img src={cover} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="font-extrabold text-gray-900 text-lg leading-snug line-clamp-2">
        {item.title}
      </h3>

      {/* Tag */}
      <div className="flex flex-wrap gap-1.5">
        {item.category && (
          <span className="border border-gray-200 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
            {item.category}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-1.5 text-xs text-gray-600">
        <MetaRow
          icon="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
          text={item.slug ?? "—"}
          mono
        />
        <MetaRow
          icon="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          text={`Publié le ${formatDate(item.published_at ?? item.created_at)}`}
        />
        <MetaRow
          icon="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z"
          text={excerptLen > 0 ? `${excerptLen} car. d'extrait` : "Aucun extrait"}
        />
      </div>
    </div>
  );
}

function MetaRow({ icon, text, mono }: { icon: string; text: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 h-5 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
        <svg className="w-3 h-3 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </span>
      <span className={`truncate ${mono ? "font-mono text-[11px] text-gray-500" : ""}`}>{text}</span>
    </div>
  );
}

export default function AdminNews({ token }: { token: string }) {
  const [items, setItems] = useState<News[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: News }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    api.news().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => {
    reload();
    adminApi(token).users.list().then(setUsers).catch(() => {});
  }, [token]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const a = adminApi(token);
    try {
      const res = modal.item
        ? await a.news.update(modal.item.id, form)
        : await a.news.create(form);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any;
        setError(body?.error ?? `Erreur serveur ${res.status}`);
        return;
      }
      await reload();
      setModal({ open: false });
    } catch {
      setError("Erreur réseau — vérifiez que le serveur est accessible");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette actualité ?")) return;
    await adminApi(token).news.delete(id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">{error}</div>
      )}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setModal({ open: true })}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + Nouvelle actualité
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-4 animate-pulse">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-9 h-9 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
              <div className="aspect-[16/10] bg-gray-100 rounded-xl mb-3" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          Aucune actualité
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onEdit={() => setModal({ open: true, item })}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">{modal.item ? "Modifier l'actualité" : "Nouvelle actualité"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Titre *" name="title" required defaultValue={modal.item?.title} />
              <SlugField sourceName="title" defaultValue={modal.item?.slug ?? ""} />
              <Field label="Extrait" name="excerpt" textarea defaultValue={modal.item?.excerpt ?? ""} />
              <RichTextEditor label="Contenu" name="content" rows={10} defaultValue={modal.item?.content ?? ""} token={token} defaultFolder="news" />
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Auteur
                <select
                  name="author"
                  defaultValue={modal.item?.author ?? ""}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4] bg-white"
                >
                  <option value="">— Aucun —</option>
                  {users.filter((u) => u.active !== 0).map((u) => (
                    <option key={u.id} value={u.name}>{u.name} ({u.email})</option>
                  ))}
                  {modal.item?.author && !users.some((u) => u.name === modal.item?.author) && (
                    <option value={modal.item.author}>{modal.item.author} (ancien)</option>
                  )}
                </select>
              </label>
              <Field label="Catégorie" name="category" defaultValue={modal.item?.category ?? ""} />
              <Field label="Date de publication" name="published_at" type="date" defaultValue={modal.item?.published_at?.slice(0, 10) ?? ""} />
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="published" value="true" defaultChecked={!!modal.item?.published} />
                Publié
              </label>
              <hr className="border-gray-100" />
              <MediaField label="Image de couverture" name="cover_image" token={token} currentKey={modal.item?.cover_image} defaultFolder="news" />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuler</button>
                <button type="submit" disabled={saving} className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-60">
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, required, type = "text", textarea, rows = 3, defaultValue }: {
  label: string; name: string; required?: boolean; type?: string; textarea?: boolean; rows?: number; defaultValue?: string;
}) {
  const cls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]";
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      {label}
      {textarea
        ? <textarea name={name} rows={rows} defaultValue={defaultValue} className={cls} />
        : <input type={type} name={name} required={required} defaultValue={defaultValue} className={cls} />
      }
    </label>
  );
}
