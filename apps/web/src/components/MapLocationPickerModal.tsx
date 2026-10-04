import React, { useState, useEffect } from 'react'
import { X, MapPin, Check } from 'lucide-react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

import { useScrollLock } from '../hooks/useScrollLock'

interface MapLocationPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectLocation: (lat: number, lng: number) => void
  initialLat?: number
  initialLng?: number
}

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position}></Marker>
  )
}

export const MapLocationPickerModal: React.FC<MapLocationPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  initialLat = -8.4095, // Bali default
  initialLng = 115.1889,
}) => {
  useScrollLock(isOpen)

  const [position, setPosition] = useState<L.LatLng | null>(null)


  useEffect(() => {
    if (isOpen) {
      setPosition(new L.LatLng(initialLat, initialLng))
    }
  }, [isOpen, initialLat, initialLng])

  if (!isOpen) return null

  const handleConfirm = () => {
    if (position) {
      onSelectLocation(position.lat, position.lng)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fadeIn overscroll-contain">
      <div className="w-full h-full sm:w-[90vw] sm:h-[90vh] sm:max-w-3xl sm:rounded-3xl bg-slate-900 border border-white/10 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950/80 border-b border-white/10 shrink-0 z-10 backdrop-blur-sm absolute top-0 left-0 w-full">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display font-bold text-white text-base">Укажите точку на карте</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 w-full h-full z-0 pt-[72px] pb-[88px] sm:pb-[16px] sm:pt-[72px]">
          <MapContainer 
            center={[initialLat, initialLng]} 
            zoom={12} 
            scrollWheelZoom={true} 
            className="w-full h-full bg-[#aadaff]" // fallback color for sea
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent z-10 pointer-events-none pb-8 sm:pb-4">
          <div className="pointer-events-auto flex justify-center w-full">
            <button
              onClick={handleConfirm}
              disabled={!position}
              className={`w-full max-w-sm py-4 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition-all shadow-xl
                ${position 
                  ? 'bg-[#00F2FE] text-[#03100A] shadow-[0_0_30px_rgba(0,242,254,0.4)] hover:brightness-110 active:scale-95' 
                  : 'bg-white/10 text-gray-400 cursor-not-allowed'
                }`}
            >
              <Check className="w-5 h-5" />
              <span>Выбрать эту локацию</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
