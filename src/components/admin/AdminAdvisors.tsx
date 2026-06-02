import { useState, useEffect } from "react";
import { adminApi, mediaUrl, type Advisor } from "../../lib/api";
import MediaField from "./MediaField";

export default function AdminAdvisors({ token }: { token: string }) {
  const [items, setItems] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: Advisor }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    adminApi(token).advisors.list()
      .then(setItems)
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, [token]);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const a = adminApi(token);
    try {
      const res = modal.item
        ? await a.advisors.update(modal.item.id, form)
        : await a.advisors.create(form);
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as any;
        setError(body?.error ?? `Erreur serveur ${res.status}`);
        return;
      }
      await reload();
      setModal({ open: false });
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce conseiller ?")) return;
    await adminApi(token).advisors.delete(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3">{error}</div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setModal({ open: true })}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-4 py-2 rounded text-sm transition-colors"
        >
          + Nouveau conseiller
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-gray-400">Aucun conseiller</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map((adv) => {
            const url = mediaUrl(adv.photo);
            return (
              <div key={adv.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group flex flex-col">
                <div className="aspect-square bg-gray-50 overflow-hidden">
                  {url ? (
                    <img src={url} alt={adv.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0a3.75 3.75 0 0 1 7.5 0M4.5 20.25a7.5 7.5 0 0 1 15 0v.75H4.5z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <p className="text-sm font-semibold text-gray-900 truncate" title={adv.name}>{adv.name}</p>
                  {adv.email && <p className="text-xs text-gray-500 truncate" title={adv.email}>{adv.email}</p>}
                  {adv.phone && <p className="text-xs text-gray-500 truncate">{adv.phone}</p>}
                  <div className="flex gap-2 mt-1">
                    {adv.facebook && (
                      <a href={adv.facebook} target="_blank" rel="noopener" className="text-xs text-blue-600 hover:underline">FB</a>
                    )}
                    {adv.twitter && (
                      <a href={adv.twitter} target="_blank" rel="noopener" className="text-xs text-sky-500 hover:underline">X</a>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                    <button onClick={() => setModal({ open: true, item: adv })} className="text-xs text-blue-600 hover:text-blue-800 font-medium">Modifier</button>
                    <button onClick={() => handleDelete(adv.id)} className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto">Supprimer</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">{modal.item ? "Modifier le conseiller" : "Nouveau conseiller"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <MediaField label="Photo *" name="photo" token={token} currentKey={modal.item?.photo} defaultFolder="advisors" />
              <Field label="Nom *" name="name" required defaultValue={modal.item?.name} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" name="email" type="email" defaultValue={modal.item?.email ?? ""} />
                <Field label="Téléphone" name="phone" defaultValue={modal.item?.phone ?? ""} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Facebook" name="facebook" placeholder="https://facebook.com/…" defaultValue={modal.item?.facebook ?? ""} />
                <Field label="Twitter / X" name="twitter" placeholder="https://x.com/…" defaultValue={modal.item?.twitter ?? ""} />
              </div>
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

function Field({ label, name, required, type = "text", placeholder, defaultValue }: {
  label: string; name: string; required?: boolean; type?: string; placeholder?: string; defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]"
      />
    </label>
  );
}
