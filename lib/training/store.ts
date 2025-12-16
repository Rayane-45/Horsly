import { create } from "zustand"
import type {
  TrainingSession,
  TrainingSettings,
  TrainingRecommendation,
  TrainingTrack,
  TrainingSeries,
  TrainingOccurrence,
  CalendarView,
  CalendarFilters,
  PrepState,
  LiveSession,
  GpsSample,
  LiveSessionState,
} from "./types"
import { mockSessions, mockSettings, mockRecommendations } from "./mock-data"

interface TrainingStore {
  // Sessions
  sessions: TrainingSession[]
  activeSession: TrainingSession | null
  addSession: (session: TrainingSession) => void
  updateSession: (id: string, updates: Partial<TrainingSession>) => void
  deleteSession: (id: string) => void
  startSession: (id: string) => void
  stopSession: (id: string) => void

  // Settings
  settings: TrainingSettings
  updateSettings: (updates: Partial<TrainingSettings>) => void

  // Recommendations
  recommendations: TrainingRecommendation[]
  addRecommendation: (rec: TrainingRecommendation) => void
  updateRecommendation: (id: string, updates: Partial<TrainingRecommendation>) => void
  dismissRecommendation: (id: string) => void

  // Tracks
  tracks: TrainingTrack[]
  addTrack: (track: TrainingTrack) => void

  // Series
  series: TrainingSeries[]
  addSeries: (series: TrainingSeries) => void
  updateSeries: (id: string, updates: Partial<TrainingSeries>) => void
  deleteSeries: (id: string) => void

  // Occurrences
  occurrences: TrainingOccurrence[]
  addOccurrence: (occurrence: TrainingOccurrence) => void
  updateOccurrence: (id: string, updates: Partial<TrainingOccurrence>) => void
  cancelOccurrence: (id: string) => void
  moveOccurrence: (id: string, newStartAt: string) => void

  // Calendar
  calendarView: CalendarView
  setCalendarView: (view: CalendarView) => void
  calendarFilters: CalendarFilters
  setCalendarFilters: (filters: Partial<CalendarFilters>) => void
  calendarDate: Date
  setCalendarDate: (date: Date) => void

  // Filters
  selectedHorseId: string | null
  setSelectedHorseId: (id: string | null) => void

  // Preparation state for /training/live persistence
  prepState: PrepState | null
  setPrepState: (state: PrepState | null) => void
  resetPrepState: () => void

  liveSession: LiveSession | null
  setLiveSession: (session: LiveSession | null) => void
  updateLiveSession: (updates: Partial<LiveSession>) => void
  addGpsSample: (sample: GpsSample) => void
  setLiveSessionState: (state: LiveSessionState) => void
}

export const useTrainingStore = create<TrainingStore>((set) => ({
  // Sessions
  sessions: mockSessions,
  activeSession: null,
  addSession: (session) =>
    set((state) => ({
      sessions: [...state.sessions, session],
    })),
  updateSession: (id, updates) =>
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),
  deleteSession: (id) =>
    set((state) => ({
      sessions: state.sessions.filter((s) => s.id !== id),
    })),
  startSession: (id) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === id)
      if (!session) return state

      const now = new Date().toISOString()
      const updatedSession = {
        ...session,
        status: "ACTIVE" as const,
        start: now,
      }

      return {
        sessions: state.sessions.map((s) => (s.id === id ? updatedSession : s)),
        activeSession: updatedSession,
      }
    }),
  stopSession: (id) =>
    set((state) => {
      const session = state.sessions.find((s) => s.id === id)
      if (!session) return state

      const now = new Date().toISOString()
      const start = new Date(session.start || now)
      const end = new Date(now)
      const durationSec = Math.floor((end.getTime() - start.getTime()) / 1000)

      const updatedSession = {
        ...session,
        status: "DONE" as const,
        end: now,
        durationSec,
      }

      return {
        sessions: state.sessions.map((s) => (s.id === id ? updatedSession : s)),
        activeSession: null,
      }
    }),

  // Settings
  settings: mockSettings,
  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  // Recommendations
  recommendations: mockRecommendations,
  addRecommendation: (rec) =>
    set((state) => ({
      recommendations: [...state.recommendations, rec],
    })),
  updateRecommendation: (id, updates) =>
    set((state) => ({
      recommendations: state.recommendations.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  dismissRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.filter((r) => r.id !== id),
    })),

  // Tracks
  tracks: [],
  addTrack: (track) =>
    set((state) => ({
      tracks: [...state.tracks, track],
    })),

  // Series
  series: [],
  addSeries: (series) =>
    set((state) => ({
      series: [...state.series, series],
    })),
  updateSeries: (id, updates) =>
    set((state) => ({
      series: state.series.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s)),
    })),
  deleteSeries: (id) =>
    set((state) => ({
      series: state.series.filter((s) => s.id !== id),
    })),

  // Occurrences
  occurrences: [],
  addOccurrence: (occurrence) =>
    set((state) => ({
      occurrences: [...state.occurrences, occurrence],
    })),
  updateOccurrence: (id, updates) =>
    set((state) => ({
      occurrences: state.occurrences.map((o) =>
        o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o,
      ),
    })),
  cancelOccurrence: (id) =>
    set((state) => ({
      occurrences: state.occurrences.map((o) => (o.id === id ? { ...o, status: "CANCELED" as const } : o)),
    })),
  moveOccurrence: (id, newStartAt) =>
    set((state) => ({
      occurrences: state.occurrences.map((o) =>
        o.id === id
          ? {
              ...o,
              movedFrom: o.movedFrom || o.startAt,
              startAt: newStartAt,
              updatedAt: new Date().toISOString(),
            }
          : o,
      ),
    })),

  // Calendar
  calendarView: "MONTH",
  setCalendarView: (view) => set({ calendarView: view }),
  calendarFilters: {
    horseIds: [],
    types: [],
    coaches: [],
    statuses: [],
  },
  setCalendarFilters: (filters) =>
    set((state) => ({
      calendarFilters: { ...state.calendarFilters, ...filters },
    })),
  calendarDate: new Date(),
  setCalendarDate: (date) => set({ calendarDate: date }),

  // Filters
  selectedHorseId: null,
  setSelectedHorseId: (id) => set({ selectedHorseId: id }),

  // Preparation state for /training/live persistence
  prepState: null,
  setPrepState: (state) => set({ prepState: state }),
  resetPrepState: () =>
    set({
      prepState: {
        horseId: null,
        sessionType: "EXTERIOR",
        goalType: null,
        goalValue: null,
        autoPause: true,
        gaitDetection: true,
        safetyShare: false,
        lastPosition: null,
      },
    }),

  liveSession: null,
  setLiveSession: (session) => set({ liveSession: session }),
  updateLiveSession: (updates) =>
    set((state) => ({
      liveSession: state.liveSession ? { ...state.liveSession, ...updates } : null,
    })),
  addGpsSample: (sample) =>
    set((state) => {
      if (!state.liveSession) return state
      return {
        liveSession: {
          ...state.liveSession,
          samples: [...state.liveSession.samples, sample],
          lastFix: {
            lat: sample.lat,
            lng: sample.lng,
            accuracy: sample.accuracy,
            provider: "gps",
          },
        },
      }
    }),
  setLiveSessionState: (newState) =>
    set((state) => {
      if (!state.liveSession) return state
      return {
        liveSession: {
          ...state.liveSession,
          state: newState,
        },
      }
    }),
}))
