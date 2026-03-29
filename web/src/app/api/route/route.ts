import { NextRequest, NextResponse } from 'next/server'

const OSRM_URL = process.env.OSRM_URL ?? 'https://router.project-osrm.org'

interface OsrmRoute {
  distance: number
  duration: number
  geometry: GeoJSON.LineString
}

interface OsrmResponse {
  code: string
  routes: OsrmRoute[]
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const profile = searchParams.get('profile') ?? 'driving'

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing from or to parameter (lon,lat)' }, { status: 400 })
  }

  // Validate coordinates format
  const fromParts = from.split(',').map(Number)
  const toParts = to.split(',').map(Number)
  if (fromParts.length !== 2 || toParts.length !== 2 || fromParts.some(isNaN) || toParts.some(isNaN)) {
    return NextResponse.json({ error: 'Invalid coordinates. Use lon,lat format.' }, { status: 400 })
  }

  const url = `${OSRM_URL}/route/v1/${profile}/${from};${to}?alternatives=3&geometries=geojson&overview=full`

  try {
    const res = await fetch(url, { next: { revalidate: 0 } })
    if (!res.ok) {
      return NextResponse.json({ error: 'OSRM request failed' }, { status: 502 })
    }

    const data: OsrmResponse = await res.json()
    if (data.code !== 'Ok' || !data.routes?.length) {
      return NextResponse.json({ error: 'No route found', code: data.code }, { status: 404 })
    }

    const routes = data.routes.map((r, i) => ({
      index: i,
      distance_km: Math.round(r.distance / 100) / 10,
      duration_min: Math.round(r.duration / 60),
      geometry: r.geometry,
    }))

    return NextResponse.json({ routes })
  } catch {
    return NextResponse.json({ error: 'Failed to reach OSRM server' }, { status: 502 })
  }
}
