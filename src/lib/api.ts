const API_BASE = '/api'

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

export type MediaFile = {
  id: string
  key: string
  filename: string
  content_type: string
  size: number
  folder: string
  media_type: string | null
  created_at: string
}

export type Newsletter = {
  id: string
  email: string
  name: string | null
  active: number
  subscribed_at: string
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

export type Expert = {
  id: string
  name: string
  slug: string | null
  specialty: string | null
  photo: string | null
  bio: string | null
  city: string | null
  email: string | null
  phone: string | null
  advice_title: string | null
  advice_content: string | null
  category: string | null
  featured: number
  published: number
  published_at: string | null
  created_at: string
  updated_at: string
}

export type User = {
  id: string
  name: string
  email: string
  role: string
  active: number
  created_at: string
  updated_at: string
}

export type ActivityEntry = {
  id: string
  action: string
  entity_type: string
  entity_id: string | null
  entity_name: string | null
  entity_image: string | null
  created_at: string
}

async function get<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return res.json()
}

export const api = {
  hero:         () => get<HeroSection[]>(`${API_BASE}/hero`),
  media:        () => get<MediaFile[]>(`${API_BASE}/media`),
  bigHero:      () => get<BigHeroSlide[]>(`${API_BASE}/big-hero`),
  news:         () => get<News[]>(`${API_BASE}/news/all`),
  gallery:      () => get<GalleryItem[]>(`${API_BASE}/gallery`),
  events:       () => get<Event[]>(`${API_BASE}/events/all`),
  contacts:     () => get<ContactMessage[]>(`${API_BASE}/contacts`),
  associations: () => get<Association[]>(`${API_BASE}/associations`),
  experts:      () => get<Expert[]>(`${API_BASE}/experts/all`),
}

export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null
  return `${API_BASE}/media/${key}`
}

async function uploadForm(url: string, form: FormData, onProgress?: (pct: number) => void): Promise<Response> {
  if (onProgress) onProgress(50)
  const res = await fetch(url, { method: 'POST', body: form })
  if (onProgress) onProgress(100)
  return res
}

export function adminApi(token: string) {
  const headers = { Authorization: `Bearer ${token}` }

  function crud(base: string) {
    return {
      create: (form: FormData) => uploadForm(base, form),
      update: (id: string, form: FormData) => fetch(`${base}/${id}`, { method: 'PUT', body: form, headers }),
      delete: (id: string) => fetch(`${base}/${id}`, { method: 'DELETE', headers }),
    }
  }

  const mediaApi = {
    upload: (form: FormData, onProgress?: (pct: number) => void) => uploadForm('/admin/media', form, onProgress),
    delete: (key: string) => fetch(`/admin/media/${encodeURIComponent(key)}`, { method: 'DELETE', headers }),
    get:    (id: string) => get(`/admin/media/${id}`),
  }

  return {
    hero:         crud('/admin/hero'),
    media:        mediaApi,
    mediaUpload:  mediaApi,
    activity: {
      list: (limit = 30) => get<ActivityEntry[]>(`/admin/activity?limit=${limit}`),
    },
    bigHero:      crud('/admin/big-hero'),
    newsletter: {
      list:   () => get<Newsletter[]>('/admin/newsletter'),
      delete: (id: string) => fetch(`/admin/newsletter/${id}`, { method: 'DELETE', headers }),
    },
    users: {
      ...crud('/admin/users'),
      list: () => get<User[]>('/admin/users'),
    },
    news:         crud('/admin/news'),
    gallery:      crud('/admin/gallery'),
    events:       crud('/admin/events'),
    contacts: {
      list:   () => get<ContactMessage[]>('/admin/contacts'),
      get:    (id: string) => get<ContactMessage>(`/admin/contacts/${id}`),
      update: (id: string, form: FormData) => fetch(`/admin/contacts/${id}`, { method: 'PUT', body: form, headers }),
      delete: (id: string) => fetch(`/admin/contacts/${id}`, { method: 'DELETE', headers }),
    },
    associations: crud('/admin/associations'),
    experts:      crud('/admin/experts'),
  }
}
