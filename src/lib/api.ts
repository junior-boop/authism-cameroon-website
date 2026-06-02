const API_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8788'

export function slugify(input: string | null | undefined): string {
  if (!input) return ''
  return input
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
}

export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null
  return `${API_URL}/api/media/${key}`
}

export type HeroSection = {
  id: string
  page: string
  title: string
  subtitle: string | null
  image_desktop: string | null
  image_tablet: string | null
  image_mobile: string | null
  cta_label: string | null
  cta_url: string | null
  active: number
  display_order: number
  created_at: string
  updated_at: string
}

export type BigHeroSlide = {
  id: string
  title: string
  cta_label: string | null
  cta_url: string | null
  image_desktop: string | null
  image_mobile: string | null
  slide_order: number
  active: number
  created_at: string
  updated_at: string
}

export type MediaFile = {
  id: string
  key: string
  filename: string
  content_type: string | null
  size: number | null
  folder: string | null
  media_type: string | null
  created_at: string
}

export type News = {
  id: string
  title: string
  slug: string | null
  excerpt: string | null
  content: string | null
  cover_image: string | null
  author: string | null
  category: string | null
  published: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export type GalleryItem = {
  id: string
  title: string
  image_key: string
  description: string | null
  category: string | null
  display_order: number
  created_at: string
}

export type Event = {
  id: string
  title: string
  slug: string | null
  description: string | null
  location: string | null
  start_date: string | null
  end_date: string | null
  cover_image: string | null
  published: number
  created_at: string
  updated_at: string
}

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string | null
  message: string
  read_status: number
  replied: number
  created_at: string
}

export type Association = {
  id: string
  name: string
  slug: string | null
  description: string | null
  album: string | null
  logo: string | null
  website: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  featured: number
  created_at: string
  updated_at: string
}

export type Advisor = {
  id: string
  name: string
  email: string | null
  phone: string | null
  facebook: string | null
  twitter: string | null
  photo: string | null
  created_at: string
  updated_at: string
}

export type Expert = {
  id: string
  advisor_id: string | null
  slug: string | null
  advice_title: string | null
  advice_content: string | null
  featured: number
  published: number
  published_at: string | null
  created_at: string
  updated_at: string
  advisor?: Advisor | null
  // Champs aplatis renvoyés par l'API publique (issus du conseiller lié)
  name?: string | null
  photo?: string | null
  email?: string | null
  phone?: string | null
}

export type User = {
  id: string
  name: string
  email: string
  role: string
  active: number
  created_at: string
}

export type NewsletterSubscriber = {
  id: string
  email: string
  name: string | null
  active: number
  subscribed_at: string
}

export type ActivityEntry = {
  id: string
  action: 'create' | 'update' | 'delete'
  entity_type: 'news' | 'event' | 'association' | 'expert' | 'gallery' | 'contact' | 'media' | 'hero' | 'big-hero'
  entity_id: string | null
  entity_name: string | null
  entity_image: string | null
  created_at: string
}

export const api = {
  hero: (page?: string): Promise<HeroSection[]> =>
    fetch(`${API_URL}/api/hero${page ? `?page=${encodeURIComponent(page)}` : ''}`).then((r) => r.json()),
  bigHero: (): Promise<BigHeroSlide[]> =>
    fetch(`${API_URL}/api/big-hero`).then((r) => r.json()),
  media: (): Promise<MediaFile[]> =>
    fetch(`${API_URL}/api/media`).then((r) => r.json()),
  news: (): Promise<News[]> =>
    fetch(`${API_URL}/api/news/all`).then((r) => r.json()),
  newsOne: (id: string): Promise<News> =>
    fetch(`${API_URL}/api/news/${id}`).then((r) => r.json()),
  gallery: (): Promise<GalleryItem[]> =>
    fetch(`${API_URL}/api/gallery`).then((r) => r.json()),
  events: (): Promise<Event[]> =>
    fetch(`${API_URL}/api/events/all`).then((r) => r.json()),
  eventOne: (id: string): Promise<Event> =>
    fetch(`${API_URL}/api/events/${id}`).then((r) => r.json()),
  associations: (): Promise<Association[]> =>
    fetch(`${API_URL}/api/associations`).then((r) => r.json()),
  associationOne: (id: string): Promise<Association> =>
    fetch(`${API_URL}/api/associations/${id}`).then((r) => r.json()),
  experts: (): Promise<Expert[]> =>
    fetch(`${API_URL}/api/experts/all`).then((r) => r.json()),
  expertOne: (id: string): Promise<Expert> =>
    fetch(`${API_URL}/api/experts/${id}`).then((r) => r.json()),
}

export function adminApi(token: string) {
  const auth = { Authorization: `Bearer ${token}` }

  function xhrUpload(url: string, method: 'POST' | 'PUT', form: FormData, onProgress: (pct: number) => void): Promise<Response> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open(method, url)
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => resolve(new Response(xhr.responseText, { status: xhr.status }))
      xhr.onerror = () => reject(new Error('Erreur réseau'))
      xhr.send(form)
    })
  }

  return {
    hero: {
      create: (form: FormData) =>
        fetch(`${API_URL}/admin/hero`, { method: 'POST', headers: auth, body: form }),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/hero/${id}`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/hero/${id}`, { method: 'DELETE', headers: auth }),
    },
    bigHero: {
      list: (): Promise<BigHeroSlide[]> =>
        fetch(`${API_URL}/admin/big-hero`, { headers: auth }).then((r) => r.json()),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/big-hero/${id}`, { method: 'DELETE', headers: auth }),
    },
    bigHeroUpload: {
      create: (form: FormData, onProgress: (pct: number) => void) =>
        xhrUpload(`${API_URL}/admin/big-hero`, 'POST', form, onProgress),
      update: (id: string, form: FormData, onProgress: (pct: number) => void) =>
        xhrUpload(`${API_URL}/admin/big-hero/${id}`, 'PUT', form, onProgress),
    },
    news: {
      create: (form: FormData) =>
        fetch(`${API_URL}/admin/news`, { method: 'POST', headers: auth, body: form }),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/news/${id}`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/news/${id}`, { method: 'DELETE', headers: auth }),
    },
    gallery: {
      create: (form: FormData) =>
        fetch(`${API_URL}/admin/gallery`, { method: 'POST', headers: auth, body: form }),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/gallery/${id}`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/gallery/${id}`, { method: 'DELETE', headers: auth }),
    },
    events: {
      create: (form: FormData) =>
        fetch(`${API_URL}/admin/events`, { method: 'POST', headers: auth, body: form }),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/events/${id}`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/events/${id}`, { method: 'DELETE', headers: auth }),
    },
    contacts: {
      list: (): Promise<ContactMessage[]> =>
        fetch(`${API_URL}/admin/contacts`, { headers: auth }).then((r) => r.json()),
      get: (id: string): Promise<ContactMessage> =>
        fetch(`${API_URL}/admin/contacts/${id}`, { headers: auth }).then((r) => r.json()),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/contacts/${id}`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/contacts/${id}`, { method: 'DELETE', headers: auth }),
    },
    associations: {
      create: (form: FormData) =>
        fetch(`${API_URL}/admin/associations`, { method: 'POST', headers: auth, body: form }),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/associations/${id}`, { method: 'PUT', headers: auth, body: form }),
      updateContent: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/associations/${id}/content`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/associations/${id}`, { method: 'DELETE', headers: auth }),
    },
    experts: {
      create: (form: FormData) =>
        fetch(`${API_URL}/admin/experts`, { method: 'POST', headers: auth, body: form }),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/experts/${id}`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/experts/${id}`, { method: 'DELETE', headers: auth }),
    },
    advisors: {
      list: (): Promise<Advisor[]> =>
        fetch(`${API_URL}/admin/advisors`, { headers: auth }).then((r) => r.json()),
      create: (form: FormData) =>
        fetch(`${API_URL}/admin/advisors`, { method: 'POST', headers: auth, body: form }),
      update: (id: string, form: FormData) =>
        fetch(`${API_URL}/admin/advisors/${id}`, { method: 'PUT', headers: auth, body: form }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/advisors/${id}`, { method: 'DELETE', headers: auth }),
    },
    media: {
      upload: (form: FormData) =>
        fetch(`${API_URL}/admin/media`, { method: 'POST', headers: auth, body: form }),
      delete: (key: string) =>
        fetch(`${API_URL}/admin/media/${encodeURIComponent(key)}`, { method: 'DELETE', headers: auth }),
      get: (id: string) =>
        fetch(`${API_URL}/admin/media/${id}`, { headers: auth }).then((r) => r.json()),
    },
    mediaUpload: {
      upload: (form: FormData, onProgress: (pct: number) => void) =>
        xhrUpload(`${API_URL}/admin/media`, 'POST', form, onProgress),
    },
    activity: {
      list: (limit = 30): Promise<ActivityEntry[]> =>
        fetch(`${API_URL}/admin/activity?limit=${limit}`, { headers: auth }).then((r) => r.json()),
    },
    users: {
      list: (): Promise<User[]> =>
        fetch(`${API_URL}/admin/users`, { headers: auth }).then((r) => r.json()),
      create: (data: { name: string; email: string; role?: string }) =>
        fetch(`${API_URL}/admin/users`, { method: 'POST', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      update: (id: string, data: Partial<User>) =>
        fetch(`${API_URL}/admin/users/${id}`, { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: auth }),
    },
    newsletter: {
      list: (): Promise<NewsletterSubscriber[]> =>
        fetch(`${API_URL}/admin/newsletter`, { headers: auth }).then((r) => r.json()),
      toggle: (id: string, active: number) =>
        fetch(`${API_URL}/admin/newsletter/${id}`, { method: 'PUT', headers: { ...auth, 'Content-Type': 'application/json' }, body: JSON.stringify({ active }) }),
      delete: (id: string) =>
        fetch(`${API_URL}/admin/newsletter/${id}`, { method: 'DELETE', headers: auth }),
    },
  }
}

export type Newsletter = NewsletterSubscriber
