import { NextRequest, NextResponse } from 'next/server'
import { updateVisitDuration } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (data.visitId && data.duration) {
      updateVisitDuration(data.visitId, data.duration)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
