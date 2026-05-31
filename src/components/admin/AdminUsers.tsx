import { useState, useEffect } from "react";
import { adminApi, type User } from "../../lib/api";

export default function AdminUsers({ token }: { token: string }) {
  const [items, setItems] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: User }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const a = adminApi(token);

  const reload = () =>
    a.users.list().then(setItems).catch(() => setError("Erreur de chargement")).finally(() => setLoading(false));

  useEffect(() => { reload(); }, []);

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      role: fd.get("role") as string,
    };
    try {
      if (modal.item) {
        await a.users.update(modal.item.id, data);
      } else {
        await a.users.create(data);
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
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await a.users.delete(id);
    setItems((prev) => prev.filter((u) => u.id !== id));
  }

  async function handleToggle(user: User) {
    await a.users.update(user.id, { active: user.active ? 0 : 1 });
    setItems((prev) => prev.map((u) => u.id === user.id ? { ...u, active: u.active ? 0 : 1 } : u));
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
          + Nouvel utilisateur
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
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Nom</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Email</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Rôle</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Statut</th>
                <th className="text-left px-4 py-3 text-gray-600 font-semibold">Inscrit le</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(user)}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-500"
                      }`}>
                        {user.active ? "Actif" : "Inactif"}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => setModal({ open: true, item: user })}
                      className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-500 hover:text-red-700 font-medium text-xs"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">Aucun utilisateur</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold text-gray-900">
                {modal.item ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Nom *" name="name" required defaultValue={modal.item?.name} />
              <Field label="Email *" name="email" type="email" required defaultValue={modal.item?.email} />
              <label className="flex flex-col gap-1 text-sm text-gray-700">
                Rôle
                <select name="role" defaultValue={modal.item?.role ?? "user"}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]">
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </label>

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal({ open: false })} className="px-4 py-2 text-sm text-gray-600">
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
        type={type} name={name} required={required} defaultValue={defaultValue}
        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-[#00bcd4]"
      />
    </label>
  );
}
