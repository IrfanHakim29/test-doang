import fs from 'fs'
import path from 'path'

const dbPath = path.join(process.cwd(), 'data.json')

export interface Link {
  id: string
  label: string
  created_at: string
}

export interface Visit {
  id: number
  link_id: string
  visitor_name: string
  visitor_email: string
  ip_address: string
  user_agent: string
  device_type: string
  browser: string
  os: string
  screen_width: number
  screen_height: number
  language: string
  referrer: string
  city: string
  country: string
  isp: string
  latitude: number | null
  longitude: number | null
  visited_at: string
  duration_seconds: number
}

interface Database {
  links: Link[]
  visits: Visit[]
  nextVisitId: number
}

function getDb(): Database {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8')
      return JSON.parse(data)
    }
  } catch (error) {
    console.error('Error reading database:', error)
  }
  return { links: [], visits: [], nextVisitId: 1 }
}

function saveDb(db: Database): void {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  } catch (error) {
    console.error('Error saving database:', error)
  }
}

export function createLink(id: string, label: string): Link {
  const db = getDb()
  const link: Link = {
    id,
    label,
    created_at: new Date().toISOString()
  }
  db.links.push(link)
  saveDb(db)
  return link
}

export function getLink(id: string): Link | undefined {
  const db = getDb()
  return db.links.find(l => l.id === id)
}

export function getAllLinks(): Link[] {
  const db = getDb()
  return db.links.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function deleteLink(id: string): void {
  const db = getDb()
  db.links = db.links.filter(l => l.id !== id)
  db.visits = db.visits.filter(v => v.link_id !== id)
  saveDb(db)
}

export function recordVisit(data: Omit<Visit, 'id' | 'visited_at' | 'duration_seconds'>): number {
  const db = getDb()
  const visit: Visit = {
    ...data,
    id: db.nextVisitId,
    visited_at: new Date().toISOString(),
    duration_seconds: 0
  }
  db.visits.push(visit)
  db.nextVisitId++
  saveDb(db)
  return visit.id
}

export function updateVisitDuration(visitId: number, duration: number): void {
  const db = getDb()
  const visit = db.visits.find(v => v.id === visitId)
  if (visit) {
    visit.duration_seconds = duration
    saveDb(db)
  }
}

export function getVisitsByLink(linkId: string): Visit[] {
  const db = getDb()
  return db.visits
    .filter(v => v.link_id === linkId)
    .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
}

export function getAllVisits(): (Visit & { label: string })[] {
  const db = getDb()
  return db.visits
    .map(v => {
      const link = db.links.find(l => l.id === v.link_id)
      return { ...v, label: link?.label || v.link_id }
    })
    .sort((a, b) => new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime())
}
