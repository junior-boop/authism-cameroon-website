import { useState, useEffect } from "react";
import { api, adminApi, type HeroSection } from "../../lib/api";
import MediaField from "./MediaField";

export default function AdminHero({ token }: { token: string }) {
  const [items, setItems] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: HeroSection }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    api.hero().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const a = adminApi(token);
    try {
      if (modal.item) {
        await a.hero.update(modal.item.id, form);
      } else {
        await a.hero.create(form);
      }
      await reload();
      setModal({ open: false });
    } catch {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cette section hero ?")) return;
    await adminApi(token).hero.delete(id);
    setItems((prev) => prev.filter((h) => h.id !== id));
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
          + Nouvelle section hero
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />)}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Page</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Titre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Ordre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actif</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((hero) => (
                <tr key={hero.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs font-mono px-2 py-0.5 rounded">{hero.page}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{hero.title}</td>
                  <td className="px-4 py-3 text-gray-500">{hero.display_order}</td>
                  <td className="px-4 py-3">
                    {hero.active
                      ? <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Actif</span>
                      : <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Inactif</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setModal({ open: true, item: hero })} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Modifier</button>
                    <button onClick={() => handleDelete(hero.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Supprimer</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucune section hero</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">{modal.item ? "Modifier la section hero" : "Nouvelle section hero"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Page *" name="page" required defaultValue={modal.item?.page}
                hint="ex: home, audio, ebook" />
              <Field label="Titre *" name="title" required defaultValue={modal.item?.title} />
              <Field label="Sous-titre" name="subtitle" defaultValue={modal.item?.subtitle ?? ""} />

              <hr className="border-gray-100" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Images responsives</p>
              <MediaField
                label="Image — Grand écran (≥1024px)"
                name="image_desktop"
                token={token}
                currentKey={modal.item?.image_desktop}
                defaultFolder="hero"
              />
              <MediaField
                label="Image — Tablette (768–1023px)"
                name="image_tablet"
                token={token}
                currentKey={modal.item?.image_tablet}
                defaultFolder="hero"
              />
              <MediaField
                label="Image — Mobile (<768px)"
                name="image_mobile"
                token={token}
                currentKey={modal.item?.image_mobile}
                defaultFolder="hero"
              />

              <hr className="border-gray-100" />
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Bouton d'action</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Label du bouton" name="cta_label" defaultValue={modal.item?.cta_label ?? ""} />
                <Field label="URL du bouton" name="cta_url" defaultValue={modal.item?.cta_url ?? ""} />
              </div>

              <hr className="border-gray-100" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ordre d'affichage" name="display_order" type="number" defaultValue={modal.item?.display_order?.toString() ?? "0"} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="active" value="true" defaultChecked={modal.item ? !!modal.item.active : true} />
                Actif
              </label>

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

function Field({ label, name, required, type = "text", defaultValue, hint }: {
  label: string; name: string; required?: boolean; type?: string; defaultValue?: string; hint?: string;
}) {
  const cls = "w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]";
  return (
    <label className="flex flex-col gap-1 text-sm text-gray-700">
      {label}
      <input type={type} name={name} required={required} defaultValue={defaultValue} className={cls} />
      {hint && <span className="text-xs text-gray-400">{hint}</span>}
    </label>
  );
}
