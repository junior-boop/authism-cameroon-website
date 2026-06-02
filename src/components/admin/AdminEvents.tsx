import { useState, useEffect } from "react";
import { api, adminApi, mediaUrl, type Event } from "../../lib/api";
import MediaField from "./MediaField";
import SlugField from "./SlugField";

export default function AdminEvents({ token }: { token: string }) {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: Event }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    api.events().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const a = adminApi(token);
    try {
      const res = modal.item
        ? await a.events.update(modal.item.id, form)
        : await a.events.create(form);
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
    if (!confirm("Supprimer cet événement ?")) return;
    await adminApi(token).events.delete(id);
    setItems((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">{error}</div>
      )}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModal({ open: true })}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-4 py-2 rounded text-sm transition-colors"
        >
          + Nouvel événement
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Image</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Titre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Lieu</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Publié</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {mediaUrl(item.cover_image)
                      ? <img src={mediaUrl(item.cover_image)!} alt={item.title} className="w-12 h-12 object-cover rounded" />
                      : <div className="w-12 h-12 bg-gray-200 rounded" />
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.title}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {item.start_date && new Date(item.start_date).toLocaleDateString("fr-FR")}
                    {item.end_date && ` — ${new Date(item.end_date).toLocaleDateString("fr-FR")}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{item.location ?? "—"}</td>
                  <td className="px-4 py-3">
                    {item.published ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Oui</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Non</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setModal({ open: true, item })} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Modifier</button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun événement</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">{modal.item ? "Modifier l'événement" : "Nouvel événement"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Titre *" name="title" required defaultValue={modal.item?.title} />
              <SlugField sourceName="title" defaultValue={modal.item?.slug ?? ""} />
              <Field label="Description" name="description" textarea rows={5} defaultValue={modal.item?.description ?? ""} />
              <Field label="Lieu" name="location" defaultValue={modal.item?.location ?? ""} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Date de début" name="start_date" type="date" defaultValue={modal.item?.start_date?.slice(0, 10) ?? ""} />
                <Field label="Date de fin" name="end_date" type="date" defaultValue={modal.item?.end_date?.slice(0, 10) ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="published" value="true" defaultChecked={!!modal.item?.published} />
                Publié
              </label>
              <hr className="border-gray-100" />
              <MediaField label="Image de couverture" name="cover_image" token={token} currentKey={modal.item?.cover_image} defaultFolder="events" />
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
