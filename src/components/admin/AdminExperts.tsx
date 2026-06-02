import { useState, useEffect, useMemo } from "react";
import { api, adminApi, mediaUrl, type Expert, type Advisor } from "../../lib/api";
import RichTextEditor from "./RichTextEditor";
import SlugField from "./SlugField";

export default function AdminExperts({ token }: { token: string }) {
  const [items, setItems] = useState<Expert[]>([]);
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: Expert }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    Promise.all([api.experts(), adminApi(token).advisors.list()])
      .then(([experts, advs]) => { setItems(experts); setAdvisors(advs); })
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  const advisorsById = useMemo(
    () => new Map(advisors.map((a) => [a.id, a])),
    [advisors]
  );

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const a = adminApi(token);
    try {
      const res = modal.item
        ? await a.experts.update(modal.item.id, form)
        : await a.experts.create(form);
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
    if (!confirm("Supprimer ce conseil ?")) return;
    await adminApi(token).experts.delete(id);
    setItems((prev) => prev.filter((a) => a.id !== id));
  }

  const noAdvisors = !loading && advisors.length === 0;

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">{error}</div>
      )}
      {noAdvisors && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded px-4 py-3 mb-4">
          Aucun conseiller enregistré. Créez d'abord un conseiller dans <a href="/admin/advisors" className="underline font-medium">Conseillers</a>.
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setModal({ open: true })}
          disabled={noAdvisors}
          className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-4 py-2 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Nouveau conseil
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
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Conseiller</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Titre du conseil</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Slug</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Statut</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const adv = item.advisor_id ? advisorsById.get(item.advisor_id) : undefined;
                const photoUrl = mediaUrl(adv?.photo ?? item.photo ?? null);
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {photoUrl
                          ? <img src={photoUrl} alt={adv?.name ?? ""} className="w-8 h-8 object-cover rounded-full" />
                          : <div className="w-8 h-8 bg-gray-200 rounded-full" />
                        }
                        <span className="font-medium text-gray-900">{adv?.name ?? item.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{item.advice_title ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{item.slug ?? "—"}</td>
                    <td className="px-4 py-3">
                      {item.published ? (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Publié</span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Brouillon</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button onClick={() => setModal({ open: true, item })} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Modifier</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Supprimer</button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun conseil</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">{modal.item ? "Modifier le conseil" : "Nouveau conseil"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <h3 className="font-semibold text-gray-800 text-sm">Conseiller</h3>
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Sélectionner un conseiller *
                <select
                  name="advisor_id"
                  required
                  defaultValue={modal.item?.advisor_id ?? ""}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]"
                >
                  <option value="" disabled>— Choisir un conseiller —</option>
                  {advisors.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </label>

              <hr className="border-gray-100" />
              <h3 className="font-semibold text-gray-800 text-sm">Conseil</h3>
              <Field label="Titre du conseil *" name="advice_title" required defaultValue={modal.item?.advice_title ?? ""} />
              <SlugField sourceName="advice_title" defaultValue={modal.item?.slug ?? ""} />
              <RichTextEditor label="Contenu du conseil" name="advice_content" rows={6} defaultValue={modal.item?.advice_content ?? ""} token={token} defaultFolder="experts" />

              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="featured" value="true" defaultChecked={!!modal.item?.featured} />
                  Mis en avant
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" name="published" value="true" defaultChecked={modal.item?.published !== 0} />
                  Publié
                </label>
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

function Field({ label, name, required, type = "text", defaultValue }: {
  label: string; name: string; required?: boolean; type?: string; defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      {label}
      <input
        type={type}
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]"
      />
    </label>
  );
}
