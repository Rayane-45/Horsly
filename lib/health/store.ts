import { create } from "zustand"
import type {
  HealthEvent,
  VaccinationRecord,
  DewormingRecord,
  VitalSigns,
  Observation,
  Recommendation,
  Practitioner,
  HealthSettings,
} from "./types"
import {
  mockHealthEvents,
  mockVaccinations,
  mockDewormings,
  mockVitalSigns,
  mockObservations,
  mockRecommendations,
  mockPractitioners,
  mockHealthSettings,
} from "./mock-data"

interface HealthFilters {
  horseId?: string
  dateFrom?: string
  dateTo?: string
  status?: string[]
  category?: string[]
  priority?: string[]
}

interface HealthStore {
  // Data
  events: HealthEvent[]
  vaccinations: VaccinationRecord[]
  dewormings: DewormingRecord[]
  vitalSigns: VitalSigns[]
  observations: Observation[]
  recommendations: Recommendation[]
  practitioners: Practitioner[]
  settings: HealthSettings

  // Filters
  filters: HealthFilters
  setFilters: (filters: Partial<HealthFilters>) => void
  clearFilters: () => void

  // Events
  addEvent: (event: Omit<HealthEvent, "id" | "createdAt" | "updatedAt">) => void
  updateEvent: (id: string, updates: Partial<HealthEvent>) => void
  deleteEvent: (id: string) => void
  markEventDone: (id: string, doneDate: string) => void

  // Vaccinations
  addVaccination: (vaccination: Omit<VaccinationRecord, "id" | "createdAt">) => void

  // Dewormings
  addDeworming: (deworming: Omit<DewormingRecord, "id" | "createdAt">) => void

  // Vital Signs
  addVitalSigns: (vitals: Omit<VitalSigns, "id" | "createdAt">) => void

  // Observations
  addObservation: (observation: Omit<Observation, "id" | "createdAt">) => void

  // Recommendations
  updateRecommendationFeedback: (id: string, feedback: "UP" | "DOWN") => void
  dismissRecommendation: (id: string) => void

  // Practitioners
  addPractitioner: (practitioner: Omit<Practitioner, "id">) => void

  // Settings
  updateSettings: (updates: Partial<HealthSettings>) => void
}

export const useHealthStore = create<HealthStore>((set) => ({
  // Initial data
  events: mockHealthEvents,
  vaccinations: mockVaccinations,
  dewormings: mockDewormings,
  vitalSigns: mockVitalSigns,
  observations: mockObservations,
  recommendations: mockRecommendations,
  practitioners: mockPractitioners,
  settings: mockHealthSettings,

  // Filters
  filters: {},
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  clearFilters: () => set({ filters: {} }),

  // Events
  addEvent: (event) =>
    set((state) => ({
      events: [
        ...state.events,
        {
          ...event,
          id: `event-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    })),

  updateEvent: (id, updates) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : event,
      ),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),

  markEventDone: (id, doneDate) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id
          ? {
              ...event,
              status: "DONE" as const,
              doneDate,
              updatedAt: new Date().toISOString(),
            }
          : event,
      ),
    })),

  // Vaccinations
  addVaccination: (vaccination) =>
    set((state) => ({
      vaccinations: [
        ...state.vaccinations,
        {
          ...vaccination,
          id: `vacc-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  // Dewormings
  addDeworming: (deworming) =>
    set((state) => ({
      dewormings: [
        ...state.dewormings,
        {
          ...deworming,
          id: `deworm-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  // Vital Signs
  addVitalSigns: (vitals) =>
    set((state) => ({
      vitalSigns: [
        ...state.vitalSigns,
        {
          ...vitals,
          id: `vital-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  // Observations
  addObservation: (observation) =>
    set((state) => ({
      observations: [
        ...state.observations,
        {
          ...observation,
          id: `obs-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
      ],
    })),

  // Recommendations
  updateRecommendationFeedback: (id, feedback) =>
    set((state) => ({
      recommendations: state.recommendations.map((reco) => (reco.id === id ? { ...reco, feedback } : reco)),
    })),

  dismissRecommendation: (id) =>
    set((state) => ({
      recommendations: state.recommendations.filter((reco) => reco.id !== id),
    })),

  // Practitioners
  addPractitioner: (practitioner) =>
    set((state) => ({
      practitioners: [
        ...state.practitioners,
        {
          ...practitioner,
          id: `pract-${Date.now()}`,
        },
      ],
    })),

  // Settings
  updateSettings: (updates) =>
    set((state) => ({
      settings: {
        ...state.settings,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    })),
}))
