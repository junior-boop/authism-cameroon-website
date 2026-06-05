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

type Card = {
  key: keyof Counts;
  label: string;
  sub: string;
  href: string;
  tint: string;
  icon: string;
};

const CARDS: Card[] = [
  {
    key: "news", label: "Actualités", sub: "Articles publiés", href: "/admin/news",
    tint: "bg-cyan-50 text-cyan-600",
    icon: "M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a1.5 1.5 0 0 1-3 0V5.25A2.25 2.25 0 0 0 16.5 3h-9a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h9a2.25 2.25 0 0 0 2.25-2.25V18M6.75 7.5H9m-2.25 3H9",
  },
  {
    key: "events", label: "Événements", sub: "Rendez-vous à venir", href: "/admin/events",
    tint: "bg-violet-50 text-violet-600",
    icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  },
  {
    key: "experts", label: "Conseils Pros", sub: "Conseils enregistrés", href: "/admin/experts",
    tint: "bg-emerald-50 text-emerald-600",
    icon: "M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z",
  },
  {
    key: "associations", label: "Associations", sub: "Partenaires", href: "/admin/associations",
    tint: "bg-amber-50 text-amber-600",
    icon: "M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418",
  },
  {
    key: "gallery", label: "Galerie", sub: "Photos en ligne", href: "/admin/gallery",
    tint: "bg-pink-50 text-pink-600",
    icon: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z",
  },
  {
    key: "contacts", label: "Messages", sub: "Demandes reçues", href: "/admin/contacts",
    tint: "bg-blue-50 text-blue-600",
    icon: "M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75",
  },
  {
    key: "media", label: "Médias", sub: "Fichiers stockés", href: "/admin/media",
    tint: "bg-orange-50 text-orange-600",
    icon: "M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776",
  },
  {
    key: "users", label: "Utilisateurs", sub: "Comptes admin", href: "/admin/users",
    tint: "bg-indigo-50 text-indigo-600",
    icon: "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  },
  {
    key: "newsletter", label: "Newsletter", sub: "Abonnés actifs", href: "/admin/newsletter",
    tint: "bg-teal-50 text-teal-600",
    icon: "M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3",
  },
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      {CARDS.map((card, i) => {
        const count = counts[card.key];
        return (
          <a
            key={card.key}
            href={card.href}
            className="group anim-fade-up bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4
              transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:border-gray-300"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-start justify-between">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${card.tint}`}>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                </svg>
              </div>
              <svg
                className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
              </svg>
            </div>
            <div>
              <div
                className={`text-3xl font-extrabold tabular-nums transition-colors duration-300 ${
                  loading ? "text-gray-200" : "text-gray-900"
                }`}
              >
                {loading ? "—" : (count ?? "—")}
              </div>
              <div className="mt-1">
                <p className="text-sm font-semibold text-gray-900">{card.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
