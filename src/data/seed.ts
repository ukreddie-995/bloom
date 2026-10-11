import type { Note, Partner } from '../types'

export const seedNotes: Note[] = [
  {
    id: 'n1',
    title: 'The Cell: Structure & Function',
    subject: 'Biology',
    topic: 'Cell biology',
    excerpt: 'A quick guide to the tiny structures that make life possible.',
    content:
      'Cells are the basic structural and functional units of life. The cell membrane regulates what enters and leaves the cell. The nucleus stores DNA and directs cell activities. Mitochondria produce ATP through cellular respiration, while ribosomes assemble proteins. Plant cells also have a cell wall, chloroplasts for photosynthesis, and a large central vacuole.',
    color: 'mint',
    icon: '✳',
    updatedAt: 'Today',
    minutes: 8,
    pinned: true,
  },
  {
    id: 'n2',
    title: 'Understanding Derivatives',
    subject: 'Mathematics',
    topic: 'Calculus',
    excerpt: 'What rates of change tell us about a function.',
    content:
      'A derivative measures the instantaneous rate of change of a function. Geometrically, it is the slope of the tangent line at a point. The power rule says that if f(x) = xⁿ, then f′(x) = nxⁿ⁻¹. For example, the derivative of x³ is 3x². Derivatives help describe velocity, growth, and optimization.',
    color: 'lavender',
    icon: 'ƒ',
    updatedAt: 'Yesterday',
    minutes: 12,
    pinned: true,
  },
  {
    id: 'n3',
    title: 'The French Revolution',
    subject: 'History',
    topic: 'European history',
    excerpt: 'Key events, people, and ideas that changed France.',
    content:
      'The French Revolution began in 1789 amid financial crisis, social inequality, and Enlightenment ideas. The Estates-General led to the National Assembly, followed by the storming of the Bastille. The Declaration of the Rights of Man articulated liberty and equality. The period later saw the Reign of Terror and, eventually, Napoleon rise to power.',
    color: 'peach',
    icon: '⌁',
    updatedAt: '2 days ago',
    minutes: 10,
    pinned: false,
  },
  {
    id: 'n4',
    title: 'Chemical Bonding Basics',
    subject: 'Chemistry',
    topic: 'Atomic structure',
    excerpt: 'Ionic, covalent, and metallic bonds made simple.',
    content:
      'Atoms bond to reach a more stable electron arrangement. Ionic bonds form when electrons transfer between atoms, creating oppositely charged ions. Covalent bonds share electron pairs. Metallic bonding describes positive ions in a sea of delocalized electrons, which explains conductivity and malleability.',
    color: 'blue',
    icon: '◈',
    updatedAt: '3 days ago',
    minutes: 9,
    pinned: false,
  },
]

export const mockPartners: Partner[] = [
  { id: 'p1', name: 'Maya Chen', initials: 'MC', major: 'Biology major', year: 'Sophomore', interests: ['Biology', 'Chemistry'], distance: '0.4 mi', color: 'mint', status: 'Online now' },
  { id: 'p2', name: 'Jordan Lee', initials: 'JL', major: 'Pre-med student', year: 'Junior', interests: ['Biology', 'Mathematics'], distance: '0.8 mi', color: 'lavender', status: 'Online now' },
  { id: 'p3', name: 'Sam Rivera', initials: 'SR', major: 'History major', year: 'Sophomore', interests: ['History', 'Writing'], distance: '1.2 mi', color: 'peach', status: 'Available today' },
]
