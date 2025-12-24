"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useGeolocation } from '@/hooks/use-geolocation'
import { 
  fetchWeatherForecast, 
  reverseGeocode, 
  getWeatherIcon, 
  type WeatherData, 
  type DailyForecast,
  type WeatherIcon 
} from '@/services/weather'
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudFog, 
  CloudSun,
  MapPin,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Composant icône météo
function WeatherIconComponent({ icon, className }: { icon: WeatherIcon; className?: string }) {
  const iconClass = cn('h-8 w-8 sm:h-10 sm:w-10', className)
  
  switch (icon) {
    case 'sun':
      return <Sun className={cn(iconClass, 'text-yellow-300')} />
    case 'partly-cloudy':
      return <CloudSun className={cn(iconClass, 'text-yellow-200')} />
    case 'cloudy':
      return <Cloud className={cn(iconClass, 'text-gray-300')} />
    case 'rain':
      return <CloudRain className={cn(iconClass, 'text-blue-300')} />
    case 'snow':
      return <CloudSnow className={cn(iconClass, 'text-blue-100')} />
    case 'storm':
      return <CloudLightning className={cn(iconClass, 'text-purple-300')} />
    case 'fog':
      return <CloudFog className={cn(iconClass, 'text-gray-400')} />
    default:
      return <Cloud className={cn(iconClass, 'text-gray-300')} />
  }
}

// Composant jour
function DayForecast({ forecast, isToday }: { forecast: DailyForecast; isToday: boolean }) {
  const icon = getWeatherIcon(forecast.weatherCode)
  
  return (
    <div 
      className={cn(
        'flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-lg min-w-[72px] sm:min-w-[80px]',
        'transition-colors',
        isToday && 'bg-white/10 ring-1 ring-white/20'
      )}
    >
      <span className={cn(
        'text-xs sm:text-sm font-medium',
        isToday ? 'text-white' : 'text-white/80'
      )}>
        {isToday ? "Auj." : forecast.dayName}
      </span>
      
      <WeatherIconComponent icon={icon} />
      
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-sm sm:text-base font-semibold text-white">
          {forecast.temperatureMax}°
        </span>
        <span className="text-xs sm:text-sm text-white/60">
          {forecast.temperatureMin}°
        </span>
      </div>
    </div>
  )
}

// Skeleton de chargement
function WeatherSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-[#722F37] to-[#4A1E23] border-none shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
          <Skeleton className="h-5 w-32 bg-white/20" />
        </div>
        <Skeleton className="h-4 w-24 mt-1 bg-white/10" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 p-3 min-w-[72px] sm:min-w-[80px]">
              <Skeleton className="h-4 w-8 bg-white/20" />
              <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
              <Skeleton className="h-4 w-6 bg-white/20" />
              <Skeleton className="h-3 w-6 bg-white/10" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Composant d'erreur
function WeatherError({ 
  message, 
  onRetry, 
  onUseFallback,
  showFallback 
}: { 
  message: string
  onRetry: () => void
  onUseFallback: () => void
  showFallback: boolean
}) {
  return (
    <Card className="bg-gradient-to-br from-[#722F37] to-[#4A1E23] border-none shadow-lg">
      <CardContent className="py-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="h-10 w-10 text-white/60" />
          <p className="text-white/80 text-sm">{message}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRetry}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              Réessayer
            </Button>
            {showFallback && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onUseFallback}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <MapPin className="h-4 w-4 mr-1.5" />
                Utiliser Paris
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyWeatherCard() {
  const { position, loading: geoLoading, error: geoError, permissionDenied, retry, useFallback } = useGeolocation()
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [weatherLoading, setWeatherLoading] = useState(false)
  const [weatherError, setWeatherError] = useState<string | null>(null)
  const [cityName, setCityName] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Fetch météo quand on a la position
  useEffect(() => {
    if (!position) return

    // Annuler le fetch précédent
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    abortControllerRef.current = controller

    // Capturer la position actuelle pour éviter les erreurs TypeScript
    const currentPosition = position

    async function loadWeather() {
      setWeatherLoading(true)
      setWeatherError(null)

      try {
        const [weatherData, city] = await Promise.all([
          fetchWeatherForecast(currentPosition.latitude, currentPosition.longitude, controller.signal),
          reverseGeocode(currentPosition.latitude, currentPosition.longitude, controller.signal),
        ])
        
        if (!controller.signal.aborted) {
          setWeather(weatherData)
          setCityName(city)
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return
        }
        setWeatherError('Impossible de charger la météo')
      } finally {
        if (!controller.signal.aborted) {
          setWeatherLoading(false)
        }
      }
    }

    loadWeather()

    return () => {
      controller.abort()
    }
  }, [position])

  // Cleanup au démontage
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  // État de chargement
  const isLoading = geoLoading || weatherLoading

  if (isLoading) {
    return <WeatherSkeleton />
  }

  // État d'erreur
  if (weatherError || (geoError && !position)) {
    return (
      <WeatherError 
        message={weatherError || geoError?.message || 'Erreur inconnue'}
        onRetry={retry}
        onUseFallback={useFallback}
        showFallback={permissionDenied}
      />
    )
  }

  // Pas de données
  if (!weather) {
    return <WeatherSkeleton />
  }

  // Déterminer le label de localisation
  const locationLabel = cityName || 
    (position ? `${position.latitude.toFixed(2)}°, ${position.longitude.toFixed(2)}°` : 'Votre position')

  // Aujourd'hui pour marquer le premier jour
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card className="bg-gradient-to-br from-[#722F37] to-[#4A1E23] border-none shadow-lg overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
              <Sun className="h-5 w-5 text-yellow-300" />
              Météo – 7 jours
            </CardTitle>
            <CardDescription className="text-white/70 flex items-center gap-1 mt-1">
              <MapPin className="h-3.5 w-3.5" />
              {locationLabel}
              {geoError && <span className="text-yellow-300 text-xs ml-1">(approximatif)</span>}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={retry}
            className="text-white/60 hover:text-white hover:bg-white/10 h-8 w-8"
            title="Actualiser"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Grille responsive : scroll horizontal mobile, grille desktop */}
        <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-7 scrollbar-hide -mx-2 px-2 sm:mx-0 sm:px-0">
          {weather.daily.map((day, index) => {
            // S'assurer que dayDate est un objet Date
            const dayDate = day.date instanceof Date ? day.date : new Date(day.date)
            const normalizedDay = new Date(dayDate)
            normalizedDay.setHours(0, 0, 0, 0)
            const isToday = normalizedDay.getTime() === today.getTime()
            
            return (
              <DayForecast 
                key={typeof day.date === 'string' ? day.date : dayDate.toISOString()} 
                forecast={day} 
                isToday={isToday}
              />
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
