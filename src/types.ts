export type Note = {
  id: string
  title: string
  subject: string
  topic: string
  excerpt: string
  content: string
  color: string
  icon: string
  updatedAt: string
  minutes: number
  pinned: boolean
}

export type ChatMessage = {
  id: string
  role: 'user' | 'tutor'
  text: string
  time: string
}

export type Partner = {
  id: string
  name: string
  initials: string
  major: string
  year: string
  interests: string[]
  distance: string
  color: string
  status: string
}

export type Page = 'dashboard' | 'notes' | 'tutor' | 'partners' | 'practice' | 'mail'

export type MailMessage = {
  id: string
  from: string
  to: string
  subject: string
  body: string
  sentAt: string
  folder: 'inbox' | 'sent'
}
