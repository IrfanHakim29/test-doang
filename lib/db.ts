import { supabase, Link, Visit } from './supabase'

export type { Link, Visit }

// ============ LINKS ============

export async function createLink(id: string, label: string): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .insert({ id, label })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating link:', error)
    return null
  }
  return data
}

export async function getLink(id: string): Promise<Link | null> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error getting link:', error)
    return null
  }
  return data
}

export async function getAllLinks(): Promise<Link[]> {
  const { data, error } = await supabase
    .from('links')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error getting all links:', error)
    return []
  }
  return data || []
}

export async function deleteLink(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('links')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting link:', error)
    return false
  }
  return true
}

// ============ VISITS ============

export async function recordVisit(data: Omit<Visit, 'id' | 'visited_at' | 'duration_seconds'>): Promise<number | null> {
  const { data: visit, error } = await supabase
    .from('visits')
    .insert({
      ...data,
      duration_seconds: 0
    })
    .select('id')
    .single()
  
  if (error) {
    console.error('Error recording visit:', error)
    return null
  }
  return visit?.id || null
}

export async function updateVisitDuration(visitId: number, duration: number): Promise<void> {
  const { error } = await supabase
    .from('visits')
    .update({ duration_seconds: duration })
    .eq('id', visitId)
  
  if (error) {
    console.error('Error updating visit duration:', error)
  }
}

export async function getVisitsByLink(linkId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*')
    .eq('link_id', linkId)
    .order('visited_at', { ascending: false })
  
  if (error) {
    console.error('Error getting visits by link:', error)
    return []
  }
  return data || []
}

export async function getAllVisits(): Promise<(Visit & { label: string })[]> {
  // Get all visits with link info
  const { data: visits, error: visitsError } = await supabase
    .from('visits')
    .select('*')
    .order('visited_at', { ascending: false })
  
  if (visitsError) {
    console.error('Error getting all visits:', visitsError)
    return []
  }

  // Get all links to map labels
  const { data: links } = await supabase
    .from('links')
    .select('id, label')
  
  const linkMap = new Map(links?.map(l => [l.id, l.label]) || [])
  
  return (visits || []).map(v => ({
    ...v,
    label: linkMap.get(v.link_id) || v.link_id
  }))
}
