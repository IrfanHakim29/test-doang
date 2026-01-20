import { NextRequest, NextResponse } from 'next/server'
import { createLink, getAllLinks, deleteLink, getVisitsByLink } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  try {
    const links = await getAllLinks()
    
    // Add visit count for each link
    const linksWithStats = await Promise.all(links.map(async link => {
      const visits = await getVisitsByLink(link.id)
      return {
        ...link,
        visit_count: visits.length,
        last_visit: visits[0]?.visited_at || null
      }
    }))
    
    return NextResponse.json(linksWithStats)
  } catch (error) {
    console.error('GET /api/links error:', error)
    return NextResponse.json({ error: 'Failed to fetch links' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { label } = await request.json()
    
    if (!label) {
      return NextResponse.json({ error: 'Label is required' }, { status: 400 })
    }

    // Generate short unique ID
    const id = uuidv4().split('-')[0]
    const link = await createLink(id, label)
    
    if (!link) {
      return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
    }
    
    return NextResponse.json(link)
  } catch (error) {
    console.error('POST /api/links error:', error)
    return NextResponse.json({ error: 'Failed to create link' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await deleteLink(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/links error:', error)
    return NextResponse.json({ error: 'Failed to delete link' }, { status: 500 })
  }
}
