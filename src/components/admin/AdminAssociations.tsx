import { useState, useEffect } from "react";
import { api, adminApi, mediaUrl, type Association } from "../../lib/api";
import MediaField from "./MediaField";

export default function AdminAssociations({ token }: { token: string }) {
  const [items, setItems] = useState<Association[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: Association }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    api.associations().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const a = adminApi(token);
    try {
      const res = modal.item
        ? await a.associations.update(modal.item.id, form)
        : await a.associations.create(form);
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
    if (!confirm("Supprimer cette association ?")) return;
    await adminApi(token).associations.delete(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
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
          + Nouvelle association
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
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Logo</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nom</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Ville</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Mis en avant</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {mediaUrl(item.logo)
                      ? <img src={mediaUrl(item.logo)!} alt={item.name} className="w-10 h-10 object-contain rounded" />
                      : <div className="w-10 h-10 bg-gray-200 rounded" />
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                  <td className="px-4 py-3 text-gray-500">{item.city ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{item.email ?? "—"}</td>
                  <td className="px-4 py-3">
                    {item.featured ? (
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
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucune association</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">{modal.item ? "Modifier l'association" : "Nouvelle association"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Nom *" name="name" required defaultValue={modal.item?.name} />
              <Field label="Slug" name="slug" defaultValue={modal.item?.slug ?? ""} />
              <Field label="Description" name="description" textarea rows={5} defaultValue={modal.item?.description ?? ""} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email" name="email" type="email" defaultValue={modal.item?.email ?? ""} />
                <Field label="Téléphone" name="phone" defaultValue={modal.item?.phone ?? ""} />
              </div>
              <Field label="Site web" name="website" defaultValue={modal.item?.website ?? ""} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Adresse" name="address" defaultValue={modal.item?.address ?? ""} />
                <Field label="Ville" name="city" defaultValue={modal.item?.city ?? ""} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="featured" value="true" defaultChecked={!!modal.item?.featured} />
                Mis en avant
              </label>
              <hr className="border-gray-100" />
              <MediaField label="Logo" name="logo" token={token} currentKey={modal.item?.logo} defaultFolder="associations" />
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
