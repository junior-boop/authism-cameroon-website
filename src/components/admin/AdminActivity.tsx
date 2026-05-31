import { useState, useEffect } from "react";
import { adminApi, mediaUrl, type ActivityEntry } from "../../lib/api";

const ACTION_LABEL: Record<string, string> = {
  create: "Ajout",
  update: "Modification",
  delete: "Suppression",
};

const ACTION_DOT: Record<string, string> = {
  create: "bg-green-500",
  update: "bg-blue-400",
  delete: "bg-red-400",
};

const ENTITY_LABEL: Record<string, string> = {
  news: "Actualité",
  event: "Événement",
  association: "Association",
  expert: "Expert",
  gallery: "Galerie",
  contact: "Contact",
  media: "Média",
  hero: "Bannière",
  "big-hero": "Big Hero",
};

const IMAGE_EXTS = /\.(jpg|jpeg|png|gif|webp|avif|svg)$/i;

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function Thumbnail({ entry }: { entry: ActivityEntry }) {
  const url = mediaUrl(entry.entity_image);
  const isImage = entry.entity_image ? IMAGE_EXTS.test(entry.entity_image) : false;

  const shape = "w-9 h-9 rounded-full";

  return (
    <div className={`shrink-0 ${shape} overflow-hidden bg-gray-100 flex items-center justify-center`}>
      {isImage && url ? (
        <img src={url} alt="" className="w-full h-full object-cover" />
      ) : (
        <svg className="w-4 h-4 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
        </svg>
      )}
    </div>
  );
}

export default function AdminActivity({ token }: { token: string }) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi(token).activity.list(30)
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-3 py-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
            <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-gray-200 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
            <div className="w-20 h-3 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-10 text-center text-gray-400 text-sm">
        Aucune activité pour l'instant. Les ajouts, modifications et suppressions apparaîtront ici.
      </p>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {entries.map((entry, i) => {
        const { date, time } = formatDate(entry.created_at);
        return (
          <div
            key={entry.id}
            className="anim-fade-in flex items-center gap-3 py-3"
            style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
          >
            <span
              title={ACTION_LABEL[entry.action]}
              className={`shrink-0 w-2 h-2 rounded-full ${ACTION_DOT[entry.action] ?? "bg-gray-300"}`}
            />

            <Thumbnail entry={entry} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {entry.entity_name ?? "—"}
              </p>
              <p className="text-xs text-gray-400">
                {ACTION_LABEL[entry.action]} · {ENTITY_LABEL[entry.entity_type] ?? entry.entity_type}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-xs text-gray-500">{date}</p>
              <p className="text-xs text-gray-400">{time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
