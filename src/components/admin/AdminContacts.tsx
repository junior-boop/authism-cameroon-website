import { useState, useEffect } from "react";
import { adminApi, type ContactMessage } from "../../lib/api";

export default function AdminContacts({ token }: { token: string }) {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<ContactMessage | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = () =>
    adminApi(token).contacts.list()
      .then(setItems)
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function toggleRead(msg: ContactMessage) {
    const form = new FormData();
    form.set("read_status", msg.read_status ? "false" : "true");
    await adminApi(token).contacts.update(msg.id, form);
    reload();
  }

  async function toggleReplied(msg: ContactMessage) {
    const form = new FormData();
    form.set("replied", msg.replied ? "false" : "true");
    await adminApi(token).contacts.update(msg.id, form);
    reload();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    await adminApi(token).contacts.delete(id);
    setItems((prev) => prev.filter((c) => c.id !== id));
    setDetail(null);
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-3 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-gray-100 animate-pulse rounded" />)}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nom</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Email</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Sujet</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Statut</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((msg) => (
                    <tr key={msg.id} className={`hover:bg-gray-50 ${!msg.read_status ? "font-semibold bg-blue-50/50" : ""}`}>
                      <td className="px-4 py-3 text-gray-900">{msg.name}</td>
                      <td className="px-4 py-3 text-gray-500">{msg.email}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">{msg.subject ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {!msg.read_status && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">Nouveau</span>
                          )}
                          {msg.replied ? (
                            <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Répondu</span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button onClick={() => setDetail(msg)} className="text-blue-600 hover:text-blue-800 font-medium text-xs">Voir</button>
                        <button onClick={() => handleDelete(msg.id)} className="text-red-500 hover:text-red-700 font-medium text-xs">Supprimer</button>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Aucun message</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {detail && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Message</h2>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="flex flex-col gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">De</p>
                <p className="text-gray-900">{detail.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Email</p>
                <a href={`mailto:${detail.email}`} className="text-blue-600 hover:underline">{detail.email}</a>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Sujet</p>
                <p className="text-gray-900">{detail.subject ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
                <p className="text-gray-900">{new Date(detail.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <hr className="border-gray-100" />
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Message</p>
                <p className="text-gray-700 whitespace-pre-wrap mt-1">{detail.message}</p>
              </div>
              <hr className="border-gray-100" />
              <div className="flex gap-2">
                <button
                  onClick={() => toggleRead(detail)}
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                    detail.read_status
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {detail.read_status ? "Marquer non lu" : "Marquer lu"}
                </button>
                <button
                  onClick={() => toggleReplied(detail)}
                  className={`flex-1 px-3 py-2 rounded text-xs font-semibold transition-colors ${
                    detail.replied
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                >
                  {detail.replied ? "Marquer non répondu" : "Marquer répondu"}
                </button>
              </div>
              <button
                onClick={() => handleDelete(detail.id)}
                className="text-red-500 hover:text-red-700 text-xs font-medium"
              >
                Supprimer ce message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
