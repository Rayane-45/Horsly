// Service météo utilisant Open-Meteo API (gratuit, sans clé API)
// Documentation: https://open-meteo.com/en/docs

export interface DailyForecast {
  date: Date
  dayName: string
  weatherCode: number
  temperatureMin: number
  temperatureMax: number
}

export interface WeatherData {
  latitude: number
  longitude: number
  timezone: string
  daily: DailyForecast[]
}

export interface WeatherError {
  message: string
  code: 'FETCH_ERROR' | 'PARSE_ERROR' | 'API_ERROR'
}

// Cache de 10 minutes
const CACHE_DURATION = 10 * 60 * 1000
const CACHE_KEY = 'cavaly_weather_cache'

interface CachedWeather {
  data: WeatherData
  timestamp: number
  lat: number
  lon: number
}

// Codes météo Open-Meteo -> icône simplifiée
export type WeatherIcon = 'sun' | 'partly-cloudy' | 'cloudy' | 'rain' | 'snow' | 'storm' | 'fog'

export function getWeatherIcon(code: number): WeatherIcon {
  // WMO Weather interpretation codes
  // https://open-meteo.com/en/docs#weathervariables
  if (code === 0) return 'sun' // Clear sky
  if (code <= 3) return 'partly-cloudy' // Mainly clear, partly cloudy, overcast
  if (code <= 49) return 'fog' // Fog
  if (code <= 69) return 'rain' // Drizzle & Rain
  if (code <= 79) return 'snow' // Snow
  if (code <= 84) return 'rain' // Rain showers
  if (code <= 86) return 'snow' // Snow showers
  if (code >= 95) return 'storm' // Thunderstorm
  return 'cloudy'
}

// Description française du code météo
export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: 'Ensoleillé',
    1: 'Peu nuageux',
    2: 'Partiellement nuageux',
    3: 'Couvert',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine légère',
    53: 'Bruine modérée',
    55: 'Bruine dense',
    56: 'Bruine verglaçante légère',
    57: 'Bruine verglaçante dense',
    61: 'Pluie légère',
    63: 'Pluie modérée',
    65: 'Pluie forte',
    66: 'Pluie verglaçante légère',
    67: 'Pluie verglaçante forte',
    71: 'Neige légère',
    73: 'Neige modérée',
    75: 'Neige forte',
    77: 'Grésil',
    80: 'Averses légères',
    81: 'Averses modérées',
    82: 'Averses violentes',
    85: 'Averses de neige légères',
    86: 'Averses de neige fortes',
    95: 'Orage',
    96: 'Orage avec grêle légère',
    99: 'Orage avec grêle forte',
  }
  return descriptions[code] || 'Variable'
}

// Noms des jours en français
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

function getCachedWeather(lat: number, lon: number): WeatherData | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null
    
    const parsed: CachedWeather = JSON.parse(cached)
    const now = Date.now()
    
    // Vérifier expiration
    if (now - parsed.timestamp > CACHE_DURATION) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    
    // Vérifier si même position (tolérance de ~1km)
    const latDiff = Math.abs(parsed.lat - lat)
    const lonDiff = Math.abs(parsed.lon - lon)
    if (latDiff > 0.01 || lonDiff > 0.01) {
      return null
    }
    
    // Reconvertir les dates string en Date objects
    const weatherData: WeatherData = {
      ...parsed.data,
      daily: parsed.data.daily.map(day => ({
        ...day,
        date: new Date(day.date)
      }))
    }
    
    return weatherData
  } catch {
    return null
  }
}

function setCachedWeather(lat: number, lon: number, data: WeatherData): void {
  if (typeof window === 'undefined') return
  
  try {
    const cache: CachedWeather = {
      data,
      timestamp: Date.now(),
      lat,
      lon,
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore storage errors
  }
}

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<WeatherData> {
  // Vérifier le cache d'abord
  const cached = getCachedWeather(latitude, longitude)
  if (cached) {
    return cached
  }
  
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', latitude.toString())
  url.searchParams.set('longitude', longitude.toString())
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode')
  url.searchParams.set('timezone', 'auto')
  url.searchParams.set('forecast_days', '7')
  
  try {
    const response = await fetch(url.toString(), { signal })
    
    if (!response.ok) {
      throw {
        message: `Erreur API météo: ${response.status}`,
        code: 'API_ERROR',
      } as WeatherError
    }
    
    const json = await response.json()
    
    if (!json.daily || !json.daily.time) {
      throw {
        message: 'Format de réponse invalide',
        code: 'PARSE_ERROR',
      } as WeatherError
    }
    
    const daily: DailyForecast[] = json.daily.time.map((dateStr: string, index: number) => {
      const date = new Date(dateStr)
      return {
        date,
        dayName: DAYS_FR[date.getDay()],
        weatherCode: json.daily.weathercode[index],
        temperatureMin: Math.round(json.daily.temperature_2m_min[index]),
        temperatureMax: Math.round(json.daily.temperature_2m_max[index]),
      }
    })
    
    const weatherData: WeatherData = {
      latitude: json.latitude,
      longitude: json.longitude,
      timezone: json.timezone,
      daily,
    }
    
    // Mettre en cache
    setCachedWeather(latitude, longitude, weatherData)
    
    return weatherData
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    
    if ((error as WeatherError).code) {
      throw error
    }
    
    throw {
      message: 'Impossible de récupérer les données météo',
      code: 'FETCH_ERROR',
    } as WeatherError
  }
}

// Reverse geocoding simple via Nominatim (OpenStreetMap)
// Note: respecter la politique d'utilisation (1 req/sec max)
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  signal?: AbortSignal
): Promise<string | null> {
  const cacheKey = `cavaly_geocode_${latitude.toFixed(2)}_${longitude.toFixed(2)}`
  
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(cacheKey)
    if (cached) return cached
  }
  
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`
    
    const response = await fetch(url, {
      signal,
      headers: {
        'User-Agent': 'Cavaly-App/1.0',
      },
    })
    
    if (!response.ok) return null
    
    const data = await response.json()
    const city = data.address?.city || 
                 data.address?.town || 
                 data.address?.village ||
                 data.address?.municipality ||
                 data.address?.county ||
                 null
    
    if (city && typeof window !== 'undefined') {
      localStorage.setItem(cacheKey, city)
    }
    
    return city
  } catch {
    return null
  }
}
