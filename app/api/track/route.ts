import { NextRequest, NextResponse } from 'next/server'
import { recordVisit, getLink } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Check if link exists
    const link = getLink(data.link_id)
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Get IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'Unknown'

    let city = 'Unknown'
    let country = 'Unknown'
    let isp = 'Unknown'
    let ipCity = 'Unknown'
    let ipCountry = 'Unknown'
    const latitude = data.latitude || null
    const longitude = data.longitude || null

    // ALWAYS get location & ISP from IP first (as fallback)
    // This ensures we have location even if GPS is denied
    try {
      const ipResponse = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country,isp,lat,lon`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })
      if (ipResponse.ok) {
        const ipData = await ipResponse.json()
        if (ipData.status === 'success') {
          ipCity = ipData.city || 'Unknown'
          ipCountry = ipData.country || 'Unknown'
          isp = ipData.isp || 'Unknown'
          // Use IP location as default
          city = ipCity
          country = ipCountry
        }
      }
    } catch {
      // IP lookup failed, try alternative API
      try {
        const altResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
          signal: AbortSignal.timeout(5000)
        })
        if (altResponse.ok) {
          const altData = await altResponse.json()
          if (!altData.error) {
            ipCity = altData.city || 'Unknown'
            ipCountry = altData.country_name || 'Unknown'
            isp = altData.org || 'Unknown'
            city = ipCity
            country = ipCountry
          }
        }
      } catch {
        // Alternative API also failed
      }
    }

    // If we have GPS coordinates, use reverse geocoding for MORE ACCURATE location
    // This overrides IP-based location with precise GPS location
    if (latitude && longitude) {
      try {
        const geoResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=id`,
          { signal: AbortSignal.timeout(5000) }
        )
        if (geoResponse.ok) {
          const geoData = await geoResponse.json()
          // Override with GPS-based location (more accurate)
          city = geoData.city || geoData.locality || geoData.principalSubdivision || ipCity
          country = geoData.countryName || ipCountry
        }
      } catch {
        // Reverse geocoding failed, keep IP-based location
      }
    }

    const visitId = recordVisit({
      link_id: data.link_id,
      visitor_name: data.visitor_name || 'Anonymous',
      visitor_email: data.visitor_email || '',
      ip_address: ip,
      user_agent: data.user_agent || '',
      device_type: data.device_type || 'Unknown',
      browser: data.browser || 'Unknown',
      os: data.os || 'Unknown',
      screen_width: data.screen_width || 0,
      screen_height: data.screen_height || 0,
      language: data.language || 'Unknown',
      referrer: data.referrer || 'Direct',
      city,
      country,
      isp,
      latitude,
      longitude,
    })

    return NextResponse.json({ success: true, visitId })
  } catch (error) {
    console.error('Tracking error:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
