import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, Bell, BookOpen, Bookmark, CalendarDays,
  Boxes, Check, ChevronDown, CircleHelp, Clock3, Code2, Compass, FilePlus2, Filter, HelpCircle,
  GraduationCap, Heart, Lightbulb, Menu, MessageCircle, MoreHorizontal, NotebookPen,
  Mail as MailIcon, Pause, Play, Plus, Search, Send, Sparkles, Target, Users, X,
} from 'lucide-react'
import { DEMO_PASSWORD, useApp } from './context/AppContext'
import { Avatar, Badge, Button, Card, EmptyState, Modal } from './components/UI'
import { Component as EtheralShadow } from '@/components/ui/etheral-shadow'
import { mockPartners } from './data/seed'
import { createBubbleSortSteps, createLinkedListSteps } from './data/practice'
import type { Note, Page, Partner } from './types'

const pageTitles: Record<Page, { title: string; subtitle: string }> = {
  dashboard: { title: 'Good morning, Alex', subtitle: 'A little progress each day adds up to big results.' },
  notes: { title: 'Your notes', subtitle: 'All your learning, beautifully organized.' },
  tutor: { title: 'Your AI study buddy', subtitle: 'Curious is a great place to start.' },
  partners: { title: 'Study together', subtitle: 'Find your people. Make learning feel lighter.' },
  practice: { title: 'Algorithm practice', subtitle: 'Understand the steps, then make them your own.' },
  mail: { title: 'Your messages', subtitle: 'A little encouragement goes a long way.' },
}

function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const { page, setPage, notes, email, signOut } = useApp()
  const navigation = [
    { id: 'dashboard' as Page, label: 'Overview', icon: Compass },
    { id: 'notes' as Page, label: 'My notes', icon: NotebookPen, count: String(notes.length) },
    { id: 'tutor' as Page, label: 'AI tutor', icon: Sparkles, tag: 'AI' },
    { id: 'practice' as Page, label: 'Practice lab', icon: Code2, tag: 'NEW' },
    { id: 'mail' as Page, label: 'Messages', icon: MailIcon },
    { id: 'partners' as Page, label: 'Study partners', icon: Users },
  ]
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" aria-label="Close menu" onClick={onClose} />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <span className="brand-mark"><GraduationCap size={22} strokeWidth={2.3} /></span>
          <span className="brand-name">study<span>bloom</span></span>
          <button className="mobile-close" aria-label="Close menu" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="workspace-label">YOUR SPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon, count, tag }) => (
            <button key={id} className={`nav-item ${page === id ? 'nav-item-active' : ''}`} onClick={() => { setPage(id); onClose() }}>
              <Icon size={18} strokeWidth={1.9} />
              <span>{label}</span>
              {count && <span className="nav-count">{count}</span>}
              {tag && <span className="nav-tag">{tag}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-grow" />
        <div className="streak-card">
          <span className="streak-spark">✦</span>
          <div className="streak-title">You’re on a roll!</div>
          <p>Keep your momentum going with a quick study session.</p>
          <div className="streak-days"><span className="day-done">M</span><span className="day-done">T</span><span className="day-today">W</span><span>T</span><span>F</span><span>S</span><span>S</span></div>
          <div className="streak-caption"><span>3 day streak</span><span>4 more to goal</span></div>
        </div>
        <button className="help-link" onClick={() => setPage('tutor')}><CircleHelp size={17} /> Help & feedback <ArrowUpRight size={14} className="help-arrow" /></button>
        <button className="sidebar-profile" onClick={signOut} aria-label="Sign out of demo" title="Sign out of demo">
          <Avatar initials="AJ" color="peach" />
          <div className="profile-copy"><strong>Alex Johnson</strong><span>{email}</span></div>
          <MoreHorizontal size={19} className="profile-menu" />
        </button>
      </aside>
    </>
  )
}

function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { page, setPage, mail } = useApp()
  const { title, subtitle } = pageTitles[page]
  const date = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())
  return (
    <header className="topbar">
      <button className="mobile-menu" aria-label="Open menu" onClick={onOpenMenu}><Menu size={21} /></button>
      <div className="topbar-title"><h1>{title}</h1><p>{subtitle}</p></div>
      <div className="topbar-actions">
        <div className="date-pill"><CalendarDays size={15} /><span>{date}</span></div>
        <button className="icon-button notification-button" aria-label="Open messages" onClick={() => setPage('mail')}><Bell size={18} /><span>{mail.filter((message) => message.folder === 'inbox').length}</span></button>
        <Avatar initials="AJ" color="peach" />
      </div>
    </header>
  )
}

function NoteCard({ note, onOpen }: { note: Note; onOpen: (note: Note) => void }) {
  const { togglePinned } = useApp()
  return (
    <Card className={`note-card note-${note.color}`}>
      <div className="note-card-top">
        <span className="note-icon">{note.icon}</span>
        <button className={`bookmark-button ${note.pinned ? 'bookmarked' : ''}`} aria-label={note.pinned ? 'Unpin note' : 'Pin note'} onClick={(event) => { event.stopPropagation(); togglePinned(note.id) }}>
          <Bookmark size={17} fill={note.pinned ? 'currentColor' : 'none'} />
        </button>
      </div>
      <button className="note-card-body" onClick={() => onOpen(note)}>
        <Badge color={note.color}>{note.subject}</Badge>
        <h3>{note.title}</h3>
        <p>{note.excerpt}</p>
      </button>
      <div className="note-card-footer">
        <span><Clock3 size={13} /> {note.minutes} min read</span>
        <span>{note.updatedAt}</span>
      </div>
    </Card>
  )
}

function NotesGrid({ notes, onOpen }: { notes: Note[]; onOpen: (note: Note) => void }) {
  if (!notes.length) return <EmptyState icon={<Search size={22} />} title="No notes found" description="Try another search, or create a new note to get started." />
  return <div className="notes-grid">{notes.map((note) => <NoteCard key={note.id} note={note} onOpen={onOpen} />)}</div>
}

function SectionHeading({ title, action }: { title: string; action?: ReactNode }) {
  return <div className="section-heading"><h2>{title}</h2>{action}</div>
}

function Dashboard({ onOpenNote, onAddNote }: { onOpenNote: (note: Note) => void; onAddNote: () => void }) {
  const { notes, setPage } = useApp()
  const pinned = notes.filter((note) => note.pinned).slice(0, 3)
  return (
    <div className="page-content dashboard-content">
      <div className="welcome-banner">
        <div className="welcome-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR WEEKLY MOMENTUM</div>
          <h2>Small steps.<br /><span>Big aha moments.</span></h2>
          <p>You’ve shown up 3 days in a row. Keep that<br className="desktop-break" /> beautiful momentum going.</p>
          <Button onClick={() => setPage('tutor')}>Pick up where you left off <ArrowRight size={16} /></Button>
        </div>
        <div className="banner-art" aria-hidden="true">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <div className="art-book"><BookOpen size={60} strokeWidth={1.2} /></div>
          <span className="art-star star-one">✦</span><span className="art-star star-two">✧</span><span className="art-spark">✳</span>
          <span className="art-note note-float">1% better<br />every day</span>
        </div>
        <span className="banner-decoration decoration-one">✧</span><span className="banner-decoration decoration-two">·</span>
      </div>

      <div className="stats-row">
        <Card className="stat-card"><span className="stat-icon stat-purple"><NotebookPen size={17} /></span><span className="stat-label">Notes created</span><div className="stat-value">{notes.length + 8}<span className="stat-trend"><ArrowUpRight size={13} /> 12%</span></div><span className="stat-caption">vs. last week</span></Card>
        <Card className="stat-card"><span className="stat-icon stat-peach"><Clock3 size={17} /></span><span className="stat-label">Study time</span><div className="stat-value">4.5<span className="stat-unit"> hrs</span><span className="stat-trend"><ArrowUpRight size={13} /> 8%</span></div><span className="stat-caption">this week so far</span></Card>
        <Card className="stat-card"><span className="stat-icon stat-green"><Target size={17} /></span><span className="stat-label">Learning streak</span><div className="stat-value">3<span className="stat-unit"> days</span><span className="stat-trend neutral"><ArrowDownRight size={13} /> keep it up</span></div><span className="stat-caption">your best is 7 days</span></Card>
      </div>

      <div className="content-section">
        <SectionHeading title="Pick up where you left off" action={<Button variant="quiet" onClick={() => setPage('notes')}>All notes <ArrowRight size={15} /></Button>} />
        {pinned.length ? <NotesGrid notes={pinned} onOpen={onOpenNote} /> :
          <EmptyState icon={<Bookmark size={22} />} title="Your next big idea starts here" description="Pin a note to keep it close, or create one to begin." action={<Button onClick={onAddNote}><Plus size={16} /> Create a note</Button>} />}
      </div>

      <div className="bottom-grid">
        <Card className="focus-card">
          <div className="focus-top"><span className="focus-icon"><Lightbulb size={18} /></span><Badge color="purple">A LITTLE NUDGE</Badge></div>
          <h3>Try active recall today</h3>
          <p>Close your notes and write down everything you remember. It’s one of the simplest ways to make learning stick.</p>
          <button className="text-link" onClick={() => setPage('tutor')}>Let’s give it a try <ArrowRight size={15} /></button>
        </Card>
        <Card className="study-together-card">
          <div className="study-people" aria-hidden="true"><Avatar initials="MC" color="mint" /><Avatar initials="JL" color="lavender" /><span className="people-plus">+</span></div>
          <div className="online-tag"><span /> 8 students online</div>
          <h3>Better together</h3>
          <p>Find a study partner who gets your goals.</p>
          <Button variant="secondary" onClick={() => setPage('partners')}>Meet your match <ArrowRight size={15} /></Button>
        </Card>
        <Card className="practice-callout">
          <span className="practice-callout-icon"><Boxes size={19} /></span>
          <div><h3>Algorithms, made visual</h3><p>Reverse a linked list or step through bubble sort, one move at a time.</p></div>
          <Button variant="secondary" onClick={() => setPage('practice')}>Try the practice lab <ArrowRight size={15} /></Button>
        </Card>
      </div>
    </div>
  )
}

function NotesPage({ onOpenNote, onAddNote }: { onOpenNote: (note: Note) => void; onAddNote: () => void }) {
  const { notes } = useApp()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState('All subjects')
  const subjects = ['All subjects', ...Array.from(new Set(notes.map((note) => note.subject)))]
  const filtered = useMemo(() => notes.filter((note) => (subject === 'All subjects' || note.subject === subject) && `${note.title} ${note.subject} ${note.topic} ${note.excerpt}`.toLowerCase().includes(query.toLowerCase())), [notes, query, subject])
  return (
    <div className="page-content">
      <div className="notes-toolbar">
        <div className="search-box"><Search size={17} /><input aria-label="Search notes" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your notes..." />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={15} /></button>}</div>
        <label className="filter-select"><Filter size={15} /><select aria-label="Filter by subject" value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
        <Button onClick={onAddNote}><Plus size={16} /> New note</Button>
      </div>
      <div className="notes-page-meta"><span>{filtered.length} {filtered.length === 1 ? 'note' : 'notes'}</span><span>Recently updated <ChevronDown size={14} /></span></div>
      <NotesGrid notes={filtered} onOpen={onOpenNote} />
    </div>
  )
}

function TutorPage() {
  const { messages, sendMessage, clearChat, notes } = useApp()
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const formSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!draft.trim() || sending) return
    setSending(true)
    const current = draft
    setDraft('')
    try {
      await sendMessage(current, activeNote?.id)
    } finally {
      setSending(false)
    }
  }
  const ask = (prompt: string) => { setDraft(prompt); document.getElementById('tutor-input')?.focus() }
  return (
    <div className="page-content tutor-layout">
      <Card className="chat-card">
        <div className="chat-topbar">
          <div className="tutor-identity"><span className="tutor-avatar"><Sparkles size={19} /></span><div><strong>Bloom</strong><span><i /> Here to help you learn</span></div></div>
          <button className="chat-menu" title="Clear conversation" onClick={clearChat}><MoreHorizontal size={20} /></button>
        </div>
        <div className="chat-note-context">
          <span className="context-icon"><BookOpen size={15} /></span>
          <div><span>LEARNING FROM</span><strong>{activeNote?.title ?? 'Your study space'}</strong></div>
          <select aria-label="Choose a note for the tutor" value={activeNote?.id ?? ''} onChange={(event) => setActiveNote(notes.find((note) => note.id === event.target.value) ?? null)}>
            <option value="">Change note</option>{notes.map((note) => <option key={note.id} value={note.id}>{note.title}</option>)}
          </select>
          <ChevronDown size={14} />
        </div>
        <div className="chat-messages" aria-live="polite">
          {messages.map((message) => (
            <div key={message.id} className={`message-row ${message.role === 'user' ? 'message-user-row' : ''}`}>
              {message.role === 'tutor' && <span className="message-avatar"><Sparkles size={13} /></span>}
              <div className={`message-bubble ${message.role === 'user' ? 'message-user' : ''}`}><p>{message.text}</p><span className="message-time">{message.time}</span></div>
            </div>
          ))}
          {sending && <div className="message-row"><span className="message-avatar"><Sparkles size={13} /></span><div className="message-bubble typing-bubble"><i /><i /><i /></div></div>}
        </div>
        {messages.length < 3 && <div className="suggestion-row">{['Reverse a linked list', 'Bubble sort walkthrough', 'Explain this simply', 'Quiz me on this'].map((text) => <button key={text} onClick={() => ask(text)}>{text}</button>)}</div>}
        <form className="chat-composer" onSubmit={formSubmit}>
          <input id="tutor-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask anything about your studies..." aria-label="Message your AI tutor" />
          <Button type="submit" disabled={!draft.trim() || sending} aria-label="Send message"><Send size={16} /></Button>
        </form>
        <div className="chat-disclaimer"><Sparkles size={12} /> Bloom is your study companion. Double-check important facts.</div>
      </Card>
      <aside className="tutor-aside">
        <Card className="tutor-tip-card"><span className="tip-spark">✦</span><Badge color="purple">STUDY SMARTER</Badge><h3>Little and often beats last-minute cramming.</h3><p>Try coming back to a topic tomorrow, then again next week. Each revisit makes the memory stronger.</p><div className="tip-footer"><span>THE SPACING EFFECT</span><span className="tip-dots"><i /><i /><i /></span></div></Card>
        <div className="tutor-side-title"><h3>Your recent notes</h3><button onClick={() => setActiveNote(notes[0] ?? null)}>View all <ArrowRight size={13} /></button></div>
        <div className="recent-note-list">{notes.slice(0, 3).map((note) => <button className="recent-note" key={note.id} onClick={() => setActiveNote(note)}><span className={`recent-note-icon note-${note.color}`}>{note.icon}</span><span><strong>{note.title}</strong><small>{note.subject} · {note.minutes} min read</small></span><ArrowRight size={15} /></button>)}</div>
        <div className="tutor-safe"><Heart size={14} /> Learning at your own pace is the right pace.</div>
      </aside>
    </div>
  )
}

function PartnerCard({ partner, onConnect }: { partner: Partner; onConnect: (partner: Partner) => void }) {
  return (
    <Card className="partner-card">
      <div className="partner-card-top"><Avatar initials={partner.initials} color={partner.color} size="large" /><span className="partner-online"><i /> {partner.status}</span></div>
      <h3>{partner.name}</h3><p className="partner-major">{partner.major} · {partner.year}</p>
      <div className="interest-list">{partner.interests.map((interest) => <Badge key={interest} color={interest === 'Biology' ? 'mint' : 'default'}>{interest}</Badge>)}</div>
      <div className="partner-card-footer"><span><Compass size={13} /> {partner.distance} away</span><Button variant="secondary" onClick={() => onConnect(partner)}>Say hello <ArrowRight size={14} /></Button></div>
    </Card>
  )
}

function PartnersPage() {
  const { matching, match, startMatching, resetMatch } = useApp()
  const [connected, setConnected] = useState<Partner | null>(null)
  const people = match ? [match, ...mockPartners.filter((person) => person.id !== match.id)] : mockPartners
  return (
    <div className="page-content partner-page">
      <div className={`radar-card ${matching ? 'radar-searching' : ''}`}>
        <div className="radar-copy">
          <Badge color="mint"><span className="online-dot" /> COMMUNITY IS GROWING</Badge>
          <h2>Good study days<br />are better <span>together.</span></h2>
          <p>Meet thoughtful students nearby who are learning the same things you are.</p>
          <Button onClick={matching ? undefined : startMatching} disabled={matching}>{matching ? <><span className="button-spinner" /> Finding your people...</> : <><Sparkles size={16} /> Find my study partner</>}</Button>
          <div className="privacy-note"><Heart size={13} /> Your exact location is never shared</div>
        </div>
        <div className="radar-visual" aria-label={matching ? 'Searching for study partners' : 'Study partner radar illustration'}>
          <div className="radar-ring ring-outer" /><div className="radar-ring ring-middle" /><div className="radar-ring ring-inner" />
          <span className="radar-sweep" />
          <span className="radar-center"><Users size={22} /></span>
          <span className="radar-dot radar-dot-one"><Avatar initials="MC" color="mint" /></span>
          <span className="radar-dot radar-dot-two"><Avatar initials="JL" color="lavender" /></span>
          <span className="radar-dot radar-dot-three"><Avatar initials="SR" color="peach" /></span>
          <span className="radar-star">✦</span>
        </div>
        <div className="radar-decoration">✳</div>
      </div>
      {matching && <div className="matching-status"><span className="matching-pulse" /> Looking for students who share your subjects and study style<span className="matching-dots">...</span></div>}
      {match && <div className="match-result"><span className="match-check"><Check size={18} /></span><div><strong>Your study match is here!</strong><span>We found a great connection based on your subjects.</span></div><PartnerCard partner={match} onConnect={setConnected} /><button className="match-dismiss" aria-label="Dismiss match" onClick={resetMatch}><X size={17} /></button></div>}
      <div className="partner-heading"><div><h2>Students near you</h2><p>People learning a little like you</p></div><button className="sort-button">Best match <ChevronDown size={14} /></button></div>
      <div className="partner-grid">{people.map((person) => <PartnerCard key={person.id} partner={person} onConnect={setConnected} />)}</div>
      {connected && <Modal title="Say hello to your study buddy" onClose={() => setConnected(null)}><div className="connect-modal-content"><Avatar initials={connected.initials} color={connected.color} size="large" /><p>You and <strong>{connected.name}</strong> both enjoy <strong>{connected.interests.join(' and ')}</strong>. Your demo connection is ready!</p><Button onClick={() => setConnected(null)}><MessageCircle size={16} /> Start a conversation</Button></div></Modal>}
    </div>
  )
}

const bubbleCode = [
  'for end = n - 1 down to 1:',
  '  for i = 0 to end - 1:',
  '    left, right = values[i], values[i + 1]',
  '    if left > right:',
  '      swap(values[i], values[i + 1])',
  '    # largest unsorted value bubbles right',
  'return values',
]

const reverseCode = [
  'previous = null',
  'current = head',
  'while current is not null:',
  '  next = current.next',
  '  current.next = previous',
  '  previous = current',
  '  current = next',
  'return previous',
]

function QuizCard({
  title,
  question,
  options,
  correct,
}: {
  title: string
  question: string
  options: string[]
  correct: number
}) {
  const [answer, setAnswer] = useState<number | null>(null)
  return (
    <Card className="quiz-card">
      <div className="quiz-heading"><span><HelpCircle size={16} /></span><Badge color="purple">{title}</Badge></div>
      <h3>{question}</h3>
      <div className="quiz-options">
        {options.map((option, index) => (
          <button
            key={option}
            className={`quiz-option ${answer === index ? (index === correct ? 'quiz-correct' : 'quiz-incorrect') : ''}`}
            onClick={() => setAnswer(index)}
          >
            <span>{String.fromCharCode(65 + index)}</span>{option}
            {answer === index && (index === correct ? <Check size={15} /> : <X size={15} />)}
          </button>
        ))}
      </div>
      {answer !== null && <p className={`quiz-feedback ${answer === correct ? 'feedback-correct' : 'feedback-incorrect'}`}>
        {answer === correct ? 'Exactly right — nice reasoning!' : 'Not quite. Try tracing what you need to keep before changing a pointer.'}
      </p>}
    </Card>
  )
}

function PracticePage() {
  const { setPage, sendMessage } = useApp()
  const [algorithm, setAlgorithm] = useState<'linked-list' | 'bubble-sort'>('linked-list')
  const [stepIndex, setStepIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(false)
  const linkedSteps = useMemo(() => createLinkedListSteps([12, 24, 36, 48]), [])
  const sortSteps = useMemo(() => createBubbleSortSteps([5, 1, 4, 2, 8]), [])
  const steps = algorithm === 'linked-list' ? linkedSteps : sortSteps
  const step = steps[Math.min(stepIndex, steps.length - 1)]
  const isLinkedListStep = algorithm === 'linked-list'

  useEffect(() => {
    setStepIndex(0)
    setAutoPlay(false)
  }, [algorithm])

  useEffect(() => {
    if (!autoPlay) return
    if (stepIndex >= steps.length - 1) {
      setAutoPlay(false)
      return
    }
    const timer = window.setTimeout(() => setStepIndex((index) => index + 1), 1100)
    return () => window.clearTimeout(timer)
  }, [autoPlay, stepIndex, steps.length])

  const askBloom = (question: string) => {
    setPage('tutor')
    void sendMessage(question)
  }

  return (
    <div className="page-content practice-page">
      <div className="practice-hero">
        <div className="practice-hero-copy">
          <Badge color="purple"><Sparkles size={12} /> INTERACTIVE LEARNING</Badge>
          <h2>See the idea.<br /><span>Then own it.</span></h2>
          <p>Algorithms click when you can watch every pointer move and every comparison happen.</p>
        </div>
        <div className="practice-shadow" aria-hidden="true">
          <EtheralShadow animation={{ scale: 42, speed: 28 }} noise={{ opacity: 0.08, scale: 0.7 }} title="">
            <div className="practice-shadow-copy"><span>learn by doing</span><strong>one step<br />at a time</strong><i>✦</i></div>
          </EtheralShadow>
        </div>
      </div>

      <div className="algorithm-tabs" role="tablist" aria-label="Choose an algorithm">
        <button role="tab" aria-selected={isLinkedListStep} className={isLinkedListStep ? 'algorithm-tab active' : 'algorithm-tab'} onClick={() => setAlgorithm('linked-list')}><Boxes size={16} /> Reverse a linked list</button>
        <button role="tab" aria-selected={!isLinkedListStep} className={!isLinkedListStep ? 'algorithm-tab active' : 'algorithm-tab'} onClick={() => setAlgorithm('bubble-sort')}><ArrowDownRight size={16} /> Bubble sort</button>
      </div>

      <div className="practice-grid">
        <Card className="visualizer-card">
          <div className="visualizer-heading"><div><span className="visualizer-kicker">STEP {stepIndex + 1} OF {steps.length}</span><h3>{isLinkedListStep ? 'Reverse a singly linked list' : 'Sort a list with bubble sort'}</h3></div><span className="visualizer-topic">{isLinkedListStep ? 'POINTERS' : 'COMPARISONS'}</span></div>
          <div className="step-progress"><span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div>
          <div className={`algorithm-visual ${isLinkedListStep ? 'linked-visual' : 'sort-visual'}`}>
            {isLinkedListStep
              ? (step as (typeof linkedSteps)[number]).reversed.concat((step as (typeof linkedSteps)[number]).remaining).map((value, index, rendered) => {
                const linked = step as (typeof linkedSteps)[number]
                const isReversed = index < linked.reversed.length
                return <div className="linked-node-wrap" key={`${value}-${index}`}>
                  {index === 0 && <span className="pointer-label head-label">{linked.reversed.length ? 'new head' : 'head'}</span>}
                  {value === linked.previous && <span className="pointer-label previous-label">prev</span>}
                  {value === linked.current && !isReversed && <span className="pointer-label current-label">current</span>}
                  <span className={`linked-node ${isReversed ? 'node-reversed' : ''} ${value === linked.current && !isReversed ? 'node-current' : ''}`}>{value}</span>
                  {index < rendered.length - 1 && <span className={`node-arrow ${index === linked.reversed.length - 1 && linked.reversed.length > 0 ? 'arrow-break' : ''}`}>{index === linked.reversed.length - 1 && linked.reversed.length > 0 ? '⋯' : '→'}</span>}
                </div>
              })
              : (step as (typeof sortSteps)[number]).values.map((value, index) => {
                const sortedStep = step as (typeof sortSteps)[number]
                const compared = index === sortedStep.left || index === sortedStep.right
                const isSorted = index >= sortedStep.sortedFrom
                return <div className="sort-node-wrap" key={`${index}-${value}`}>
                  {compared && <span className="compare-label">{sortedStep.swapped ? 'swap' : 'compare'}</span>}
                  <span className={`sort-node ${compared ? sortedStep.swapped ? 'sort-swap' : 'sort-compare' : ''} ${isSorted ? 'sort-done' : ''}`}>{value}</span>
                  <span className="sort-index">index {index}</span>
                </div>
              })}
          </div>
          <div className="step-explanation"><span className="step-bulb"><Lightbulb size={16} /></span><p>{step.description}</p></div>
          <div className="visualizer-actions">
            <Button variant="secondary" onClick={() => { setAutoPlay(false); setStepIndex(0) }}>Reset</Button>
            <div>
              <Button variant="secondary" aria-label={autoPlay ? 'Pause animation' : 'Play animation'} onClick={() => { if (stepIndex === steps.length - 1) setStepIndex(0); setAutoPlay((playing) => !playing) }}>{autoPlay ? <Pause size={13} /> : <Play size={13} />}</Button>
              <Button variant="secondary" onClick={() => { setAutoPlay(false); setStepIndex((index) => Math.max(0, index - 1)) }} disabled={stepIndex === 0}>Previous</Button>
              <Button onClick={() => { if (stepIndex === steps.length - 1) setStepIndex(0); else { setAutoPlay(false); setStepIndex((index) => index + 1) } }}>{stepIndex === steps.length - 1 ? 'Start over' : 'Next step'} <ArrowRight size={14} /></Button>
            </div>
          </div>
        </Card>

        <Card className="code-card">
          <div className="code-heading"><div><span className="code-dots"><i /><i /><i /></span><strong>{isLinkedListStep ? 'reverse-list.pseudo' : 'bubble-sort.pseudo'}</strong></div><Badge color="mint">PSEUDOCODE</Badge></div>
          <pre className="algorithm-code"><code>{(isLinkedListStep ? reverseCode : bubbleCode).map((line, index) => <span key={line} className={step.codeLine === index + 1 ? 'code-line code-line-active' : 'code-line'}><i>{String(index + 1).padStart(2, '0')}</i>{line}</span>)}</code></pre>
          <div className="complexity-box"><span>TIME COMPLEXITY</span><strong>{isLinkedListStep ? 'O(n)' : 'O(n²)'}</strong><small>{isLinkedListStep ? 'One pass through the list' : 'Compares pairs on repeated passes'}</small></div>
          <Button className="ask-bloom-button" variant="secondary" onClick={() => askBloom(isLinkedListStep ? 'Explain how to reverse a linked list step by step, including what each pointer does.' : 'Walk me through bubble sort step by step using a small array, and quiz me on the next comparison.')}><Sparkles size={15} /> Ask Bloom about this</Button>
        </Card>
      </div>

      <div className="practice-quiz-heading"><div><Badge color="peach">QUICK CHECK</Badge><h2>Make it stick</h2><p>A tiny retrieval practice goes a long way.</p></div></div>
      <div className="quiz-grid">
        <QuizCard title="LINKED LISTS" question="Why save current.next before reversing the pointer?" correct={1} options={['It makes the list shorter.', 'So you do not lose access to the rest of the list.', 'To sort the nodes by value.']} />
        <QuizCard title="BUBBLE SORT" question="After one full left-to-right pass, what is guaranteed?" correct={0} options={['The largest unsorted value is at the end.', 'The whole array is sorted.', 'The smallest value is at the end.']} />
      </div>
    </div>
  )
}

function LoginPage() {
  const { signIn } = useApp()
  const [address, setAddress] = useState('alex@studybloom.demo')
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [error, setError] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!signIn(address.trim(), password)) {
      setError('Enter a valid email and the demo password shown below.')
      return
    }
    setError('')
  }
  return (
    <main className="login-page">
      <section className="login-hero">
        <div className="login-brand"><span className="brand-mark"><GraduationCap size={22} /></span><span className="brand-name">study<span>bloom</span></span></div>
        <div className="login-story">
          <Badge color="purple"><Sparkles size={12} /> A CALMER WAY TO LEARN</Badge>
          <h1>Your next<br />aha moment<br /><span>starts here.</span></h1>
          <p>Your notes, your AI study buddy, and a little more confidence — all in one lovely space.</p>
          <div className="login-feature-list"><span><Check size={14} /> Notes that stay yours</span><span><Check size={14} /> A tutor that meets you where you are</span><span><Check size={14} /> Learn tricky ideas, step by step</span></div>
        </div>
        <div className="login-shadow"><EtheralShadow animation={{ scale: 56, speed: 31 }} noise={{ opacity: .08, scale: .8 }} title="" /></div>
        <span className="login-footnote">MADE FOR YOUR NEXT LITTLE WIN <span>✦</span></span>
      </section>
      <section className="login-panel">
        <div className="login-form-wrap">
          <span className="login-welcome-icon"><BookOpen size={20} /></span>
          <p className="login-overline">YOUR STUDY SPACE IS READY</p>
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to pick up where you left off.</p>
          <form className="login-form" onSubmit={submit}>
            <label>Email address<input type="email" autoComplete="username" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="you@example.com" required /></label>
            <label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter demo password" required /></label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <Button type="submit">Enter my study space <ArrowRight size={15} /></Button>
          </form>
          <div className="demo-credentials"><span><Lightbulb size={14} /> QUICK DEMO ACCESS</span>          <div><code>alex@studybloom.demo</code><button type="button" onClick={() => { setAddress('alex@studybloom.demo'); setPassword(DEMO_PASSWORD); setError('') }}>Use demo account</button></div><small>Password: <code>{DEMO_PASSWORD}</code></small></div>
          <p className="local-data-note"><Heart size={13} /> Demo data is saved only in this browser. No email is sent.</p>
        </div>
        <footer className="login-footer">A gentle space to learn at your own pace <span>·</span> StudyBloom</footer>
      </section>
    </main>
  )
}

function MailPage() {
  const { mail, sendEmail, email } = useApp()
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox')
  const [composeOpen, setComposeOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const visibleMail = mail.filter((message) => message.folder === folder)
  const selected = visibleMail.find((message) => message.id === selectedId) ?? visibleMail[0] ?? null
  return (
    <div className="page-content mail-page">
      <div className="mail-toolbar"><div><Badge color="purple"><MailIcon size={12} /> BROWSER-ONLY DEMO</Badge><p>Messages are stored on this device; nothing is delivered externally.</p></div><Button onClick={() => setComposeOpen(true)}><Plus size={15} /> Compose</Button></div>
      <div className="mail-layout">
        <Card className="mail-list-card">
          <div className="mail-folder-tabs">
            <button className={folder === 'inbox' ? 'mail-folder-active' : ''} onClick={() => { setFolder('inbox'); setSelectedId(null) }}>Inbox <span>{mail.filter((message) => message.folder === 'inbox').length}</span></button>
            <button className={folder === 'sent' ? 'mail-folder-active' : ''} onClick={() => { setFolder('sent'); setSelectedId(null) }}>Sent <span>{mail.filter((message) => message.folder === 'sent').length}</span></button>
          </div>
          {visibleMail.length ? <div className="mail-items">{visibleMail.map((message) => <button key={message.id} className={`mail-item ${selected?.id === message.id ? 'mail-item-active' : ''}`} onClick={() => setSelectedId(message.id)}><span className="mail-item-avatar">{message.folder === 'inbox' ? 'SB' : 'AJ'}</span><span className="mail-item-copy"><strong>{message.folder === 'inbox' ? message.from : `To: ${message.to}`}</strong><b>{message.subject}</b><small>{message.body.replace(/\s+/g, ' ').slice(0, 58)}…</small></span><time>{message.sentAt}</time></button>)}</div> : <EmptyState icon={<MailIcon size={20} />} title={folder === 'inbox' ? 'Your inbox is all caught up' : 'Nothing sent just yet'} description={folder === 'inbox' ? 'Your demo welcome note is waiting for you.' : 'Write yourself a little study reminder.'} action={folder === 'sent' ? <Button onClick={() => setComposeOpen(true)}><Plus size={14} /> Compose a message</Button> : undefined} />}
        </Card>
        <Card className="mail-reading-card">
          {selected ? <><div className="mail-reading-top"><span className="mail-item-avatar">{selected.folder === 'inbox' ? 'SB' : 'AJ'}</span><div><strong>{selected.folder === 'inbox' ? selected.from : `To: ${selected.to}`}</strong><span>{selected.sentAt} · To {selected.folder === 'inbox' ? email : selected.to}</span></div><button className="icon-button" title="Compose a reply" onClick={() => setComposeOpen(true)}><MessageCircle size={16} /></button></div><h2>{selected.subject}</h2><p className="mail-body">{selected.body}</p>{selected.folder === 'inbox' && <Button variant="secondary" onClick={() => setComposeOpen(true)}><MessageCircle size={14} /> Write a reply</Button>}</> : <EmptyState icon={<MailIcon size={20} />} title="Choose a message" description="Select a message to read it here." />}
        </Card>
      </div>
      {composeOpen && <ComposeMailModal onClose={() => setComposeOpen(false)} onSend={sendEmail} />}
    </div>
  )
}

function ComposeMailModal({ onClose, onSend }: { onClose: () => void; onSend: (to: string, subject: string, body: string) => void }) {
  const [to, setTo] = useState('alex@studybloom.demo')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!to.trim() || !subject.trim() || !body.trim()) return
    onSend(to.trim(), subject.trim(), body.trim())
    onClose()
  }
  return <Modal title="Compose a demo message" onClose={onClose}><form className="note-form" onSubmit={submit}><label>To<input type="email" value={to} onChange={(event) => setTo(event.target.value)} required /></label><label>Subject<input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="A quick study reminder..." required /></label><label>Message<textarea rows={5} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a note to your future self..." required /></label><div className="mail-demo-warning"><Lightbulb size={13} /> This saves to your local Sent folder. It does not send email.</div><div className="modal-actions"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit"><Send size={14} /> Save to Sent</Button></div></form></Modal>
}

function CreateNoteModal({ onClose }: { onClose: () => void }) {
  const { addNote } = useApp()
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('Biology')
  const [content, setContent] = useState('')
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim() || !content.trim()) return
    addNote({ title: title.trim(), subject, topic: subject, excerpt: content.trim().slice(0, 90), content: content.trim(), color: subject === 'Biology' ? 'mint' : subject === 'Mathematics' ? 'lavender' : subject === 'History' ? 'peach' : 'blue', icon: subject === 'Biology' ? '✳' : subject === 'Mathematics' ? 'ƒ' : subject === 'History' ? '⌁' : '◈', minutes: Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 30)), pinned: false })
    onClose()
  }
  return <Modal title="Create a new note" onClose={onClose}><form className="note-form" onSubmit={submit}><label>Note title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Photosynthesis, simplified" required /></label><label>Subject<select value={subject} onChange={(event) => setSubject(event.target.value)}>{['Biology', 'Mathematics', 'History', 'Chemistry', 'Other'].map((name) => <option key={name}>{name}</option>)}</select></label><label>Your notes<textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write down the important bits..." rows={5} required /></label><div className="modal-actions"><Button variant="secondary" type="button" onClick={onClose}>Cancel</Button><Button type="submit"><FilePlus2 size={16} /> Save note</Button></div></form></Modal>
}

function NoteDetailModal({ note, onClose }: { note: Note; onClose: () => void }) {
  const { setPage } = useApp()
  return <Modal title={note.title} onClose={onClose}><div className="note-detail"><Badge color={note.color}>{note.subject} · {note.topic}</Badge><p>{note.content}</p><div className="note-detail-footer"><span><Clock3 size={14} /> {note.minutes} min read</span><Button onClick={() => { onClose(); setPage('tutor') }}><Sparkles size={15} /> Ask Bloom about this</Button></div></div></Modal>
}

export default function App() {
  const { page, signedIn } = useApp()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  if (!signedIn) return <LoginPage />
  return (
    <div className="app-shell">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="main-area">
        <Topbar onOpenMenu={() => setMobileOpen(true)} />
        {page === 'dashboard' && <Dashboard onOpenNote={setSelectedNote} onAddNote={() => setCreateOpen(true)} />}
        {page === 'notes' && <NotesPage onOpenNote={setSelectedNote} onAddNote={() => setCreateOpen(true)} />}
        {page === 'tutor' && <TutorPage />}
        {page === 'partners' && <PartnersPage />}
        {page === 'practice' && <PracticePage />}
        {page === 'mail' && <MailPage />}
      </main>
      {createOpen && <CreateNoteModal onClose={() => setCreateOpen(false)} />}
      {selectedNote && <NoteDetailModal note={selectedNote} onClose={() => setSelectedNote(null)} />}
    </div>
  )
}
