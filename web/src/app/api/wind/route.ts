import { NextRequest, NextResponse } from 'next/server'

/**
 * API proxy pour les données vent en temps réel.
 * Utilise Open-Meteo (gratuit, sans clé API).
 * GET /api/wind?lat=48.86&lon=2.35
 */

interface OpenMeteoResponse {
  current_weather?: {
    windspeed: number       // km/h
    winddirection: number   // degrees (direction d'où vient le vent)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Missing lat or lon parameter' }, { status: 400 })
  }

  const latNum = Number(lat)
  const lonNum = Number(lon)
  if (isNaN(latNum) || isNaN(lonNum)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latNum}&longitude=${lonNum}&current_weather=true`

  try {
    const res = await fetch(url, { next: { revalidate: 900 } }) // Cache 15 min
    if (!res.ok) {
      return NextResponse.json({ error: 'Open-Meteo request failed' }, { status: 502 })
    }

    const data: OpenMeteoResponse = await res.json()
    if (!data.current_weather) {
      return NextResponse.json({ error: 'No weather data available' }, { status: 404 })
    }

    return NextResponse.json({
      speed_kmh: Math.round(data.current_weather.windspeed),
      direction_deg: Math.round(data.current_weather.winddirection),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach weather service' }, { status: 502 })
  }
}
