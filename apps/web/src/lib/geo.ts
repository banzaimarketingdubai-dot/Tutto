import { HubId } from '../types'
import { HUBS } from '../data/mockData'

interface HubCoords {
  id: HubId
  lat: number
  lng: number
  defaultDistrict: string
}

const HUB_COORDINATES: HubCoords[] = [
  { id: 'phuket', lat: 7.8804, lng: 98.3923, defaultDistrict: 'Patong' },
  { id: 'bali', lat: -8.4095, lng: 115.1889, defaultDistrict: 'Canggu' },
  { id: 'bangkok', lat: 13.7563, lng: 100.5018, defaultDistrict: 'Thonglor' },
  { id: 'vietnam', lat: 12.2388, lng: 109.1967, defaultDistrict: 'Nha Trang Centre' },
  { id: 'seoul', lat: 37.5665, lng: 126.9780, defaultDistrict: 'Gangnam' },
  { id: 'tokyo', lat: 35.6762, lng: 139.6503, defaultDistrict: 'Shibuya' },
]

/**
 * Calculate distance in kilometers between two GPS points (Haversine formula)
 */
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export interface DetectedLocationResult {
  hubId: HubId
  hubNameRu: string
  district: string
  distanceKm: number
}

/**
 * Map coordinates to nearest Hub
 */
export function detectLocationFromCoords(userLat: number, userLng: number): DetectedLocationResult {
  let closestHub = HUB_COORDINATES[0]
  let minDistance = getDistanceKm(userLat, userLng, closestHub.lat, closestHub.lng)

  for (let i = 1; i < HUB_COORDINATES.length; i++) {
    const dist = getDistanceKm(userLat, userLng, HUB_COORDINATES[i].lat, HUB_COORDINATES[i].lng)
    if (dist < minDistance) {
      minDistance = dist
      closestHub = HUB_COORDINATES[i]
    }
  }

  const hubData = HUBS.find((h) => h.id === closestHub.id) || HUBS[0]

  return {
    hubId: closestHub.id,
    hubNameRu: hubData.nameRu,
    district: hubData.districts[0] || closestHub.defaultDistrict,
    distanceKm: Math.round(minDistance),
  }
}

/**
 * Detect user's current GPS location and return the nearest Hub & District
 */
export function detectUserLocation(): Promise<DetectedLocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Геолокация не поддерживается вашим браузером'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude
        const userLng = position.coords.longitude

        resolve(detectLocationFromCoords(userLat, userLng))
      },
      (error) => {
        let msg = 'Не удалось определить геолокацию'
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Доступ к GPS отклонен пользователем'
        }
        reject(new Error(msg))
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  })
}

export interface GeoPair {
  hub: string
  district: string
}

/**
 * Validates Hub / District pair against the canonical HUBS Geo Tree.
 * Prevents invalid cross-hub district assignments (e.g. Hub: Bali, District: Rawai).
 */
export function validateHubAndDistrict(rawHub: string, rawDistrict: string, userMentionedHubExplicitly = false): GeoPair {
  const hubNormalized = (rawHub || 'phuket').toLowerCase().trim()
  const districtNormalized = (rawDistrict || '').trim()

  const currentHubObj = HUBS.find((h) => h.id === hubNormalized) || HUBS[0]

  if (!districtNormalized) {
    return { hub: currentHubObj.id, district: currentHubObj.districts[0] || 'Rawai' }
  }

  // 1. Check if district belongs to current hub
  const matchedInCurrent = currentHubObj.districts.find(
    (d) => d.toLowerCase() === districtNormalized.toLowerCase()
  )
  if (matchedInCurrent) {
    return { hub: currentHubObj.id, district: matchedInCurrent }
  }

  // 2. District doesn't belong to current hub — search across all other hubs
  const foundOtherHub = HUBS.find((h) =>
    h.districts.some((d) => d.toLowerCase() === districtNormalized.toLowerCase())
  )

  if (foundOtherHub) {
    const foundDistrict = foundOtherHub.districts.find(
      (d) => d.toLowerCase() === districtNormalized.toLowerCase()
    )!
    if (!userMentionedHubExplicitly) {
      // The user specified a district that uniquely belongs to another hub (e.g., Rawai -> Phuket)
      // Switch hub to the correct hub!
      return { hub: foundOtherHub.id, district: foundDistrict }
    } else {
      // User explicitly specified hub (e.g., Bali), so keep Bali and fallback to Bali's primary district (e.g., Canggu)
      return { hub: currentHubObj.id, district: currentHubObj.districts[0] }
    }
  }

  // 3. Fallback: keep hub, use its default district
  return {
    hub: currentHubObj.id,
    district: currentHubObj.districts[0] || 'Rawai',
  }
}

