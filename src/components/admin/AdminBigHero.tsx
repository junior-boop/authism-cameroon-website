import { useState, useEffect } from "react";
import { adminApi, mediaUrl, type BigHeroSlide } from "../../lib/api";
import MediaField from "./MediaField";

export default function AdminBigHero({ token }: { token: string }) {
  const [items, setItems] = useState<BigHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: BigHeroSlide }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    adminApi(token).bigHero.list()
      .then(setItems)
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setUploadPct(0);
    setError(null);
    const form = new FormData(e.currentTarget);
    const a = adminApi(token);
    try {
      const res = modal.item
        ? await a.bigHeroUpload.update(modal.item.id, form, setUploadPct)
        : await a.bigHeroUpload.create(form, setUploadPct);
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
      setUploadPct(0);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce slide ?")) return;
    await adminApi(token).bigHero.delete(id);
    setItems((prev) => prev.filter((s) => s.id !== id));
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
          + Nouveau slide
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
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Image desktop</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Image mobile</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Titre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Ordre</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actif</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((slide) => (
                <tr key={slide.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {mediaUrl(slide.image_desktop)
                      ? <img src={mediaUrl(slide.image_desktop)!} alt="" className="w-20 h-12 object-cover rounded" />
                      : <div className="w-20 h-12 bg-gray-200 rounded" />
                    }
                  </td>
                  <td className="px-4 py-3">
                    {mediaUrl(slide.image_mobile)
                      ? <img src={mediaUrl(slide.image_mobile)!} alt="" className="w-12 h-12 object-cover rounded" />
                      : <div className="w-12 h-12 bg-gray-200 rounded" />
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{slide.title}</td>
                  <td className="px-4 py-3 text-gray-500">{slide.slide_order}</td>
                  <td className="px-4 py-3">
                    {slide.active ? (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Oui</span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">Non</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setModal({ open: true, item: slide })}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-xs"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun slide</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">
                {modal.item ? "Modifier le slide" : "Nouveau slide"}
              </h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Titre *" name="title" required defaultValue={modal.item?.title} />
              <Field label="Texte du bouton" name="cta_label" defaultValue={modal.item?.cta_label ?? ""} />
              <Field label="Lien du bouton" name="cta_url" defaultValue={modal.item?.cta_url ?? ""} />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Ordre d'affichage" name="slide_order" type="number" defaultValue={modal.item?.slide_order?.toString() ?? "0"} />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" name="active" value="true" defaultChecked={modal.item ? !!modal.item.active : true} />
                Actif
              </label>

              <hr className="border-gray-100" />
              <MediaField
                label="Image desktop / tablette (16:9 ou paysage recommandé)"
                name="image_desktop"
                token={token}
                currentKey={modal.item?.image_desktop}
                defaultFolder="big-hero/desktop"
              />
              <MediaField
                label="Image mobile (format carré recommandé)"
                name="image_mobile"
                token={token}
                currentKey={modal.item?.image_mobile}
                defaultFolder="big-hero/mobile"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}

              {saving && uploadPct > 0 && uploadPct < 100 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Upload en cours…</span>
                    <span>{uploadPct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00bcd4] rounded-full transition-all duration-150" style={{ width: `${uploadPct}%` }} />
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#00bcd4] hover:bg-[#00acc1] text-white font-bold px-6 py-2 rounded text-sm disabled:opacity-60"
                >
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
