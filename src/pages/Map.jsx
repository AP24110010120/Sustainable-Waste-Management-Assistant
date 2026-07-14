import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import API from '../services/api'

const defaultIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function FlyToMarker({ center }) {
  const map = useMap()

  useEffect(() => {
    if (center) {
      map.flyTo(center, 13, {
        duration: 0.8
      })
    }
  }, [center, map])

  return null
}

function getCenterPosition(center) {
  if (!center) return null
  if (center.latitude && center.longitude) return [center.latitude, center.longitude]
  if (center.lat && center.lng) return [center.lat, center.lng]
  if (center.location) {
    const { lat, lng, latitude, longitude } = center.location
    if (lat != null && lng != null) return [lat, lng]
    if (latitude != null && longitude != null) return [latitude, longitude]
  }
  return null
}

export default function MapPage() {
  const [centers, setCenters] = useState([])
  const [filter, setFilter] = useState('')
  const [selectedCenter, setSelectedCenter] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const mapRef = useRef(null)

  useEffect(() => {
    fetchCenters()
  }, [])

  const fetchCenters = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await API.get('/api/get-centers')
      setCenters(res.data.centers || [])
    } catch (e) {
      console.error(e)
      setError('Unable to load collection centers. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const set = new Set()
    centers.forEach((center) => {
      const types = center.waste_types || center.categories || []
      types.forEach((type) => {
        if (typeof type === 'string') set.add(type)
      })
    })
    return Array.from(set)
  }, [centers])

  const filteredCenters = useMemo(() => {
    if (!filter) return centers
    return centers.filter((center) => {
      const types = center.waste_types || center.categories || []
      return types.some((type) =>
        String(type).toLowerCase().includes(filter.toLowerCase())
      )
    })
  }, [centers, filter])

  const activeCenter = selectedCenter || filteredCenters[0] || null
  const mapCenter = getCenterPosition(activeCenter) || [20, 0]

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-emerald-50">Collection Centers</h1>
            <p className="mt-2 text-sm text-emerald-100/80">
              Browse nearby waste collection points and filter centers by accepted materials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('')}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${!filter ? 'border-emerald-500 bg-emerald-500 text-[#05140d]' : 'border-emerald-800/70 bg-[#0f2d1f] text-emerald-100 hover:border-emerald-500 hover:text-emerald-200'}`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setFilter(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${filter === category ? 'border-emerald-500 bg-emerald-500 text-[#05140d]' : 'border-emerald-800/70 bg-[#0f2d1f] text-emerald-100 hover:border-emerald-500 hover:text-emerald-200'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-3xl border border-red-700/50 bg-red-500/10 px-4 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="h-[420px] overflow-hidden rounded-3xl border border-emerald-900/60 bg-[#0b1f16] shadow-[0_16px_36px_rgba(0,0,0,0.25)]">
              <MapContainer
                center={mapCenter}
                zoom={activeCenter ? 11 : 2}
                scrollWheelZoom={true}
                style={{ height: '100%', minHeight: '420px' }}
                whenCreated={(mapInstance) => {
                  mapRef.current = mapInstance
                }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <FlyToMarker center={mapCenter} />
                {filteredCenters.map((center) => {
                  const position = getCenterPosition(center)
                  if (!position) return null

                  return (
                    <Marker
                      key={center.id || center.name || JSON.stringify(position)}
                      position={position}
                      icon={defaultIcon}
                      eventHandlers={{
                        click: () => setSelectedCenter(center)
                      }}
                    >
                      <Popup>
                        <div className="space-y-2 text-sm">
                          <div className="font-semibold text-slate-900 dark:text-white">{center.name || 'Collection Center'}</div>
                          {center.address && <div>{center.address}</div>}
                          {center.city && <div>{center.city}</div>}
                          {center.waste_types && (
                            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                              Accepts: {center.waste_types.join(', ')}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>

            <div className="rounded-3xl border border-emerald-900/60 bg-[#0b1f16] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-emerald-50">Center list</h2>
              <p className="mt-2 text-sm text-emerald-100/80">
                Click a center to see details and jump to its location on the map.
              </p>

              <div className="mt-4 space-y-3">
                {loading ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    Loading centers…
                  </div>
                ) : filteredCenters.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                    No centers found for this category.
                  </div>
                ) : (
                  filteredCenters.map((center) => {
                    const isActive = selectedCenter?.id === center.id
                    return (
                      <button
                        key={center.id || center.name}
                        type="button"
                        onClick={() => {
                          setSelectedCenter(center)
                          const position = getCenterPosition(center)
                          if (mapRef.current && position) {
                            mapRef.current.flyTo(position, 13, { duration: 0.8 })
                          }
                        }}
                        className={`w-full rounded-3xl border px-4 py-4 text-left transition ${isActive ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-emerald-900/60 bg-[#0f2d1f] hover:border-emerald-500/50 hover:bg-[#153b28]'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-base font-semibold text-slate-900 dark:text-white">{center.name || 'Unnamed Center'}</div>
                            <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                              {center.address || center.city || 'Address not available'}
                            </div>
                          </div>
                          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                            {center.waste_types ? center.waste_types.length : 0} categories
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-emerald-900/60 bg-[#0b1f16] p-5 shadow-[0_16px_36px_rgba(0,0,0,0.25)]">
              <h2 className="text-lg font-semibold text-emerald-50">Selected center</h2>

              {activeCenter ? (
                <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-300">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{activeCenter.name || 'Collection center'}</div>
                    {activeCenter.address && <div className="mt-1">{activeCenter.address}</div>}
                    {activeCenter.city && <div>{activeCenter.city}</div>}
                  </div>

                  {activeCenter.phone && (
                    <div>
                      <span className="font-semibold">Phone:</span> {activeCenter.phone}
                    </div>
                  )}

                  {activeCenter.email && (
                    <div>
                      <span className="font-semibold">Email:</span> {activeCenter.email}
                    </div>
                  )}

                  {activeCenter.hours && (
                    <div>
                      <span className="font-semibold">Hours:</span> {activeCenter.hours}
                    </div>
                  )}

                  {activeCenter.waste_types && (
                    <div>
                      <div className="font-semibold">Accepted materials</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {activeCenter.waste_types.map((type) => (
                          <span key={type} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeCenter.notes && (
                    <div>
                      <div className="font-semibold">Notes</div>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{activeCenter.notes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Select a collection center from the map or list to view details.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
