import { NextRequest, NextResponse } from 'next/server'
import { getAllVisits, getVisitsByLink } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const linkId = searchParams.get('linkId')
    
    if (linkId) {
      const visits = await getVisitsByLink(linkId)
      return NextResponse.json(visits)
    }
    
    const visits = await getAllVisits()
    return NextResponse.json(visits)
  } catch (error) {
    console.error('GET /api/logs error:', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
