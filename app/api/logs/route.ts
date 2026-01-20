import { NextRequest, NextResponse } from 'next/server'
import { getAllVisits, getVisitsByLink } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const linkId = searchParams.get('linkId')
    
    if (linkId) {
      const visits = getVisitsByLink(linkId)
      return NextResponse.json(visits)
    }
    
    const visits = getAllVisits()
    return NextResponse.json(visits)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
