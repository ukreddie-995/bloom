import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { mockPartners, seedNotes } from '../data/seed'
import type { ChatMessage, MailMessage, Note, Page, Partner } from '../types'

type AppContextValue = {
  page: Page
  setPage: (page: Page) => void
  signedIn: boolean
  email: string
  signIn: (email: string, password: string) => boolean
  signOut: () => void
  notes: Note[]
  addNote: (note: Omit<Note, 'id' | 'updatedAt'>) => void
  togglePinned: (id: string) => void
  messages: ChatMessage[]
  sendMessage: (text: string, noteId?: string) => Promise<void>
  clearChat: () => void
  matching: boolean
  match: Partner | null
  startMatching: () => void
  resetMatch: () => void
  mail: MailMessage[]
  sendEmail: (to: string, subject: string, body: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)
const storageKey = 'studybloom.notes.v1'
const mailStorageKey = 'studybloom.mail.v1'
export const DEMO_PASSWORD = 'bloom2026'

function readStoredMail(): MailMessage[] {
  try {
    const stored = localStorage.getItem(mailStorageKey)
    if (stored) return JSON.parse(stored) as MailMessage[]
  } catch {
    // Malformed local demo data falls back to the sample inbox.
  }
  return [{
    id: 'welcome-mail',
    from: 'hello@studybloom.demo',
    to: 'alex@studybloom.demo',
    subject: 'Welcome to your study space ✨',
    body: 'Hi Alex,\n\nYour StudyBloom demo is ready. Save notes, ask Bloom about a tricky topic, or meet a study partner. Your progress is stored in this browser.\n\nHappy learning,\nThe StudyBloom team',
    sentAt: 'Today',
    folder: 'inbox',
  }]
}

const tutorReply = (prompt: string, notes: Note[], noteId?: string) => {
  const question = prompt.toLowerCase()
  if (/linked.?list/.test(question) && /(reverse|reversing|backward)/.test(question)) {
    return 'To reverse a singly linked list, keep three pointers: previous, current, and next. Save current.next before changing it, point current.next back to previous, then advance previous and current. For 1 → 2 → 3: save 2, make 1 → null, then make 2 → 1, then 3 → 2. The new head is the old tail.\n\nwhile (current) {\n  next = current.next\n  current.next = previous\n  previous = current\n  current = next\n}\n\nWhy do we save next before reversing the link?'
  }
  if (/bubble\s*sort/.test(question) || (/sort/.test(question) && /adjacent|bubble/.test(question))) {
    return 'Bubble sort compares neighboring values and swaps them when they’re out of order. After one left-to-right pass, the largest unsorted value has “bubbled” to the end. For [5, 1, 4, 2]: compare 5/1 and swap → [1, 5, 4, 2]; compare 5/4 and swap → [1, 4, 5, 2]; compare 5/2 and swap → [1, 4, 2, 5]. Repeat on the shorter unsorted prefix.\n\nfor end = n - 1 down to 1:\n  for i = 0 to end - 1:\n    if values[i] > values[i + 1]: swap\n\nWant to predict the next pass?'
  }
  if (/linked.?list/.test(question)) {
    return 'A linked list stores values in nodes, and each node points to the next node. Unlike an array, its items are not required to sit side-by-side in memory. The head points to the first node; the last node points to null. Ask me to reverse a linked list for a step-by-step walkthrough.'
  }
  const selectedNote = notes.find((note) => note.id === noteId)
  if (selectedNote && /this|explain|quiz|remember|summari[sz]e/.test(question)) {
    if (/quiz/.test(question)) {
      return `Quick check from “${selectedNote.title}”: what’s the main job of ${selectedNote.topic.toLowerCase()}? Take a guess, and I’ll help you check it against your note.`
    }
    const summary = selectedNote.content.split('. ').slice(0, 2).join('. ')
    return `Let’s use your “${selectedNote.title}” note. ${summary}. Which part would you like to explore next?`
  }
  const topic = notes.find((note) =>
    [note.subject, note.topic, note.title].some((term) => question.includes(term.toLowerCase())),
  )
  if (/derivative|calculus|slope|rate of change/.test(question)) {
    return 'Think of a derivative as a function’s “right now” rate of change. For a curve, it gives the slope of the tangent at one point. For example, with f(x) = x³, the power rule gives f′(x) = 3x². Want to try one together?'
  }
  if (/cell|mitochond|photosynthesis|biology/.test(question) || topic?.subject === 'Biology') {
    return 'A helpful way to remember it: the nucleus is the cell’s instruction center, the membrane is its selective boundary, and mitochondria convert food energy into ATP. Plant cells add chloroplasts, which capture light for photosynthesis. Which part should we unpack?'
  }
  if (/revolution|bastille|french|history/.test(question) || topic?.subject === 'History') {
    return 'The French Revolution is easiest to follow as a chain: financial strain and inequality sparked political change in 1789; the Bastille became a symbol of the uprising; revolutionary ideals reshaped government, before conflict and the Reign of Terror led toward Napoleon. Would a timeline or a cause-and-effect map help?'
  }
  if (/bond|electron|ionic|covalent|chemistry/.test(question) || topic?.subject === 'Chemistry') {
    return 'The big idea is how atoms handle electrons: ionic bonds transfer them, covalent bonds share them, and metallic bonds let electrons move across many atoms. That electron behavior explains many material properties. Want a quick comparison example?'
  }
  if (/study|remember|focus|plan/.test(question)) {
    return 'Try a 25-minute focus block: choose one small learning goal, close your notes, and retrieve what you remember from scratch. Then check the gaps and take a short break. What subject are you working on today?'
  }
  if (topic) {
    return `I found your “${topic.title}” note. ${topic.content.split('. ').slice(0, 2).join('. ')}. Want me to turn that into a quick quiz or explain a specific part?`
  }
  return 'Great question. Let’s break it into a smaller piece: what do you already know about it, and which part feels confusing? I can explain it simply, make an example, or quiz you.'
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>('dashboard')
  const [email, setEmail] = useState(() => localStorage.getItem('studybloom.email.v1') ?? 'alex@studybloom.demo')
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem('studybloom.signed-in.v1') === 'true')
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) as Note[] : seedNotes
    } catch {
      return seedNotes
    }
  })
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'tutor', text: 'Hey Alex! I’m here to make studying feel a little easier. Ask me about a topic, or pick a note and we’ll work through it together ✨', time: 'Now' },
  ])
  const [matching, setMatching] = useState(false)
  const [match, setMatch] = useState<Partner | null>(null)
  const [mail, setMail] = useState<MailMessage[]>(readStoredMail)
  const matchingTimer = useRef<number | undefined>(undefined)

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(notes))
  }, [notes])
  useEffect(() => {
    localStorage.setItem(mailStorageKey, JSON.stringify(mail))
  }, [mail])
  useEffect(() => () => {
    if (matchingTimer.current !== undefined) window.clearTimeout(matchingTimer.current)
  }, [])

  const addNote: AppContextValue['addNote'] = (note) => {
    setNotes((current) => [{ ...note, id: crypto.randomUUID(), updatedAt: 'Just now' }, ...current])
  }
  const togglePinned = (id: string) => setNotes((current) =>
    current.map((note) => note.id === id ? { ...note, pinned: !note.pinned } : note),
  )
  const sendMessage: AppContextValue['sendMessage'] = async (text, noteId) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text: trimmed, time: 'Now' }])
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'tutor', text: tutorReply(trimmed, notes, noteId), time: 'Now' }])
  }
  const clearChat = () => setMessages([
    { id: crypto.randomUUID(), role: 'tutor', text: 'Fresh start! What would you like to understand today?', time: 'Now' },
  ])
  const startMatching = () => {
    if (matching) return
    setMatch(null)
    setMatching(true)
    matchingTimer.current = window.setTimeout(() => {
      const partner = [...mockPartners].sort((a, b) => b.interests.filter((subject) => notes.some((note) => note.subject === subject)).length - a.interests.filter((subject) => notes.some((note) => note.subject === subject)).length)[0]
      setMatch(partner)
      setMatching(false)
      matchingTimer.current = undefined
    }, 2200)
  }
  const resetMatch = () => {
    if (matchingTimer.current !== undefined) window.clearTimeout(matchingTimer.current)
    matchingTimer.current = undefined
    setMatching(false)
    setMatch(null)
  }
  const signIn = (address: string, password: string) => {
    if (password !== DEMO_PASSWORD || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) return false
    setEmail(address)
    setSignedIn(true)
    localStorage.setItem('studybloom.email.v1', address)
    localStorage.setItem('studybloom.signed-in.v1', 'true')
    return true
  }
  const signOut = () => {
    setSignedIn(false)
    localStorage.removeItem('studybloom.signed-in.v1')
    setPage('dashboard')
  }
  const sendEmail = (to: string, subject: string, body: string) => {
    setMail((current) => [{
      id: crypto.randomUUID(),
      from: email,
      to,
      subject,
      body,
      sentAt: new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date()),
      folder: 'sent',
    }, ...current])
  }

  const value = useMemo(() => ({
    page, setPage, signedIn, email, signIn, signOut, notes, addNote, togglePinned,
    messages, sendMessage, clearChat, matching, match, startMatching, resetMatch,
    mail, sendEmail,
  }), [page, signedIn, email, notes, messages, matching, match, mail])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used inside AppProvider')
  return context
}
