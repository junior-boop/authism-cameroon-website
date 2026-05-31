import { useState, useEffect } from "react";
import { adminApi, type NewsletterSubscriber } from "../../lib/api";

export default function AdminNewsletter({ token }: { token: string }) {
  const [items, setItems] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const a = adminApi(token);

  const reload = () =>
    a.newsletter.list().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function handleToggle(sub: NewsletterSubscriber) {
    await a.newsletter.toggle(sub.id, sub.active ? 0 : 1);
    setItems((prev) => prev.map((s) => s.id === sub.id ? { ...s, active: s.active ? 0 : 1 } : s));
  }

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet abonné ?")) return;
    await a.newsletter.delete(id);
    setItems((prev) => prev.filter((s) => s.id !== id));
  }

  const total = items.length;
  const actifs = items.filter((s) => s.active).length;

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">{error}</div>
      )}

      <div className="flex gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center">
          <p className="text-2xl font-extrabold text-gray-900">{total}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total abonnés</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center">
          <p className="text-2xl font-extrabold text-green-600">{actifs}</p>
          <p className="text-xs text-gray-400 mt-0.5">Actifs</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-4 text-center">
          <p className="text-2xl font-extrabold text-red-500">{total - actifs}</p>
          <p className="text-xs text-gray-400 mt-0.5">Désabonnés</p>
        </div>
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
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nom</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Statut</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Inscrit le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                  <td className="px-4 py-3 text-gray-500">{sub.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(sub)}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        sub.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-500"
                      }`}>
                        {sub.active ? "Abonné" : "Désabonné"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(sub.subscribed_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-xs"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun abonné</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
