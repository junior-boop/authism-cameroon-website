import { useState, useEffect } from "react";
import { api, adminApi } from "../../lib/api";

type Counts = {
  news: number;
  events: number;
  experts: number;
  associations: number;
  gallery: number;
  contacts: number;
  media: number;
  users: number;
  newsletter: number;
};

const CARDS: { key: keyof Counts; label: string; href: string; emoji: string }[] = [
  { key: "news",         label: "Actualités",  href: "/admin/news",         emoji: "📰" },
  { key: "events",       label: "Événements",  href: "/admin/events",       emoji: "📅" },
  { key: "experts",      label: "Conseils Pros", href: "/admin/experts",    emoji: "🧑‍⚕️" },
  { key: "associations", label: "Associations", href: "/admin/associations", emoji: "🤝" },
  { key: "gallery",      label: "Galerie",     href: "/admin/gallery",      emoji: "🖼️" },
  { key: "contacts",     label: "Messages",    href: "/admin/contacts",     emoji: "✉️" },
  { key: "media",        label: "Médias",      href: "/admin/media",        emoji: "📁" },
  { key: "users",        label: "Utilisateurs", href: "/admin/users",       emoji: "👥" },
  { key: "newsletter",   label: "Newsletter",  href: "/admin/newsletter",   emoji: "📧" },
];

export default function AdminDashboardCards({ token }: { token: string }) {
  const [counts, setCounts] = useState<Partial<Counts>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const a = adminApi(token);
    Promise.allSettled([
      api.news().then((d) => ({ news: d.length })),
      api.events().then((d) => ({ events: d.length })),
      api.experts().then((d) => ({ experts: d.length })),
      api.associations().then((d) => ({ associations: d.length })),
      api.gallery().then((d) => ({ gallery: d.length })),
      api.media().then((d) => ({ media: d.length })),
      a.contacts.list().then((d) => ({ contacts: d.length })),
      a.users.list().then((d) => ({ users: d.length })),
      a.newsletter.list().then((d) => ({ newsletter: d.length })),
    ]).then((results) => {
      const merged: Partial<Counts> = {};
      for (const r of results) {
        if (r.status === "fulfilled") Object.assign(merged, r.value);
      }
      setCounts(merged);
      setLoading(false);
    });
  }, [token]);

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
      {CARDS.map((card, i) => {
        const count = counts[card.key];
        return (
          <a
            key={card.key}
            href={card.href}
            className="anim-fade-up bg-white border border-gray-200 rounded-lg p-4 flex flex-col gap-2
              transition-[transform,border-color] duration-150 ease-out
              hover:-translate-y-px hover:border-gray-300"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <span className="text-2xl">{card.emoji}</span>
            <span
              className={`text-xl font-bold tabular-nums transition-colors duration-300 ${loading ? "text-gray-200" : "text-gray-900"
                }`}
            >
              {loading ? "—" : (count ?? "—")}
            </span>
            <span className="text-xs font-medium text-gray-500">{card.label}</span>
          </a>
        );
      })}
    </div>
  );
}
