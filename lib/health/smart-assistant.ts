import type {
  Recommendation,
  HealthEvent,
  VaccinationRecord,
  DewormingRecord,
  VitalSigns,
  HorseProfile,
  Priority,
} from "./types"

interface HorseContext {
  id: string
  profile: HorseProfile
  age?: number
  events: HealthEvent[]
  vaccinations: VaccinationRecord[]
  dewormings: DewormingRecord[]
  vitalSigns: VitalSigns[]
}

export function generateRecommendations(context: HorseContext): Recommendation[] {
  const recommendations: Recommendation[] = []
  const now = new Date()

  // Check vaccinations
  const vaccineRecos = checkVaccinations(context, now)
  recommendations.push(...vaccineRecos)

  // Check dewormings
  const dewormRecos = checkDewormings(context, now)
  recommendations.push(...dewormRecos)

  // Check vital signs trends
  const vitalRecos = checkVitalSigns(context, now)
  recommendations.push(...vitalRecos)

  // Profile-specific recommendations
  const profileRecos = getProfileRecommendations(context, now)
  recommendations.push(...profileRecos)

  // Seasonal recommendations
  const seasonalRecos = getSeasonalRecommendations(context, now)
  recommendations.push(...seasonalRecos)

  return recommendations
}

function checkVaccinations(context: HorseContext, now: Date): Recommendation[] {
  const recommendations: Recommendation[] = []

  // Check if flu/tetanus vaccines are due
  const fluVaccine = context.vaccinations
    .filter((v) => v.vaccineType === "FLU")
    .sort((a, b) => b.date.localeCompare(a.date))[0]

  if (!fluVaccine || (fluVaccine.nextDueDate && new Date(fluVaccine.nextDueDate) < now)) {
    recommendations.push({
      id: `reco-vaccine-flu-${Date.now()}`,
      horseId: context.id,
      title: "Vaccin grippe équine en retard",
      detail:
        "Le vaccin contre la grippe équine est obligatoire pour les concours et doit être renouvelé annuellement. Planifiez une visite vétérinaire rapidement.",
      category: "PERIODIC",
      priority: "HIGH",
      suggestedDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: "PLAN_EVENT",
      basedOn: ["HISTORY", "PROFILE"],
      createdAt: now.toISOString(),
    })
  } else if (fluVaccine.nextDueDate) {
    const dueDate = new Date(fluVaccine.nextDueDate)
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

    if (daysUntilDue <= 30 && daysUntilDue > 0) {
      recommendations.push({
        id: `reco-vaccine-flu-reminder-${Date.now()}`,
        horseId: context.id,
        title: "Rappel vaccin grippe équine",
        detail: `Le prochain rappel de vaccin grippe est prévu dans ${daysUntilDue} jours. Pensez à prendre rendez-vous avec votre vétérinaire.`,
        category: "PERIODIC",
        priority: "MEDIUM",
        suggestedDate: fluVaccine.nextDueDate,
        action: "PLAN_EVENT",
        basedOn: ["HISTORY"],
        createdAt: now.toISOString(),
      })
    }
  }

  return recommendations
}

function checkDewormings(context: HorseContext, now: Date): Recommendation[] {
  const recommendations: Recommendation[] = []

  const lastDeworming = context.dewormings.sort((a, b) => b.date.localeCompare(a.date))[0]

  if (!lastDeworming) {
    recommendations.push({
      id: `reco-deworm-first-${Date.now()}`,
      horseId: context.id,
      title: "Premier vermifuge à planifier",
      detail:
        "Aucun vermifuge enregistré. Il est recommandé de vermifuger les chevaux 2 fois par an minimum (printemps et automne). Une coproscopie préalable permet d'adapter le traitement.",
      category: "PERIODIC",
      priority: "HIGH",
      suggestedDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      action: "PLAN_EVENT",
      basedOn: ["HISTORY"],
      createdAt: now.toISOString(),
    })
  } else if (lastDeworming.nextDueDate) {
    const dueDate = new Date(lastDeworming.nextDueDate)

    if (dueDate < now) {
      recommendations.push({
        id: `reco-deworm-overdue-${Date.now()}`,
        horseId: context.id,
        title: "Vermifuge en retard",
        detail:
          "Le dernier vermifuge date de plus de 6 mois. Planifiez un traitement rapidement, idéalement après une coproscopie pour adapter la molécule.",
        category: "PERIODIC",
        priority: "HIGH",
        suggestedDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        action: "PLAN_EVENT",
        basedOn: ["HISTORY"],
        createdAt: now.toISOString(),
      })
    }
  }

  return recommendations
}

function checkVitalSigns(context: HorseContext, now: Date): Recommendation[] {
  const recommendations: Recommendation[] = []

  if (context.vitalSigns.length < 2) return recommendations

  const recentVitals = context.vitalSigns.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  // Check weight trend
  const weightsWithData = recentVitals.filter((v) => v.weightKg !== undefined)
  if (weightsWithData.length >= 2) {
    const latestWeight = weightsWithData[0].weightKg!
    const previousWeight = weightsWithData[1].weightKg!
    const weightChange = ((latestWeight - previousWeight) / previousWeight) * 100

    if (Math.abs(weightChange) >= 5) {
      const priority: Priority = Math.abs(weightChange) >= 10 ? "HIGH" : "MEDIUM"
      recommendations.push({
        id: `reco-weight-change-${Date.now()}`,
        horseId: context.id,
        title: weightChange > 0 ? "Prise de poids significative" : "Perte de poids significative",
        detail: `Le poids a ${weightChange > 0 ? "augmenté" : "diminué"} de ${Math.abs(weightChange).toFixed(1)}% récemment. ${
          weightChange > 0
            ? "Surveillez la ration et l'exercice pour éviter l'embonpoint."
            : "Vérifiez l'alimentation, les dents et envisagez un vermifuge ou un bilan vétérinaire."
        }`,
        category: "PERIODIC",
        priority,
        action: "READ_MORE",
        basedOn: ["VITALS"],
        createdAt: now.toISOString(),
      })
    }
  }

  // Check temperature
  const tempsWithData = recentVitals.filter((v) => v.temperatureC !== undefined)
  if (tempsWithData.length >= 2) {
    const recentHighTemps = tempsWithData.filter((v) => v.temperatureC! > 38.5)

    if (recentHighTemps.length >= 2) {
      recommendations.push({
        id: `reco-temp-high-${Date.now()}`,
        horseId: context.id,
        title: "Température élevée persistante",
        detail:
          "La température est supérieure à 38.5°C depuis plusieurs jours. Cela peut indiquer une infection ou une inflammation. Consultez un vétérinaire rapidement.",
        category: "EMERGENCY",
        priority: "CRITICAL",
        action: "PLAN_EVENT",
        basedOn: ["VITALS"],
        createdAt: now.toISOString(),
      })
    }
  }

  return recommendations
}

function getProfileRecommendations(context: HorseContext, now: Date): Recommendation[] {
  const recommendations: Recommendation[] = []

  switch (context.profile) {
    case "FOAL":
      recommendations.push({
        id: `reco-foal-${Date.now()}`,
        horseId: context.id,
        title: "Suivi poulain : vermifuges fréquents",
        detail:
          "Les poulains nécessitent des vermifuges plus fréquents (toutes les 8 semaines) la première année pour cibler les ascaris. Consultez votre vétérinaire pour un protocole adapté.",
        category: "PERIODIC",
        priority: "MEDIUM",
        action: "READ_MORE",
        basedOn: ["PROFILE"],
        createdAt: now.toISOString(),
      })
      break

    case "SENIOR":
      recommendations.push({
        id: `reco-senior-${Date.now()}`,
        horseId: context.id,
        title: "Cheval senior : contrôles bi-annuels",
        detail:
          "Pour un cheval âgé, il est recommandé d'effectuer des bilans vétérinaires tous les 6 mois (auscultation, prise de sang) pour dépister précocement les maladies liées à l'âge (Cushing, insuffisance rénale, etc.).",
        category: "PERIODIC",
        priority: "MEDIUM",
        suggestedDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        action: "PLAN_EVENT",
        basedOn: ["PROFILE"],
        createdAt: now.toISOString(),
      })
      break

    case "PREGNANT_MARE":
      recommendations.push({
        id: `reco-pregnant-${Date.now()}`,
        horseId: context.id,
        title: "Jument gestante : vaccins rhinopneumonie",
        detail:
          "Les juments gestantes doivent recevoir les vaccins contre la rhinopneumonie aux 5e, 7e et 9e mois de gestation pour prévenir les avortements viraux. Vérifiez le calendrier avec votre vétérinaire.",
        category: "PERIODIC",
        priority: "HIGH",
        action: "PLAN_EVENT",
        basedOn: ["PROFILE"],
        createdAt: now.toISOString(),
      })
      break

    case "ATHLETE":
      recommendations.push({
        id: `reco-athlete-${Date.now()}`,
        horseId: context.id,
        title: "Cheval de sport : suivi ostéopathique",
        detail:
          "Pour un cheval de sport, un suivi ostéopathique régulier (tous les 3-6 mois) aide à prévenir les blessures et maintenir les performances. Pensez également aux contrôles dentaires bi-annuels.",
        category: "PERIODIC",
        priority: "MEDIUM",
        suggestedDate: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        action: "PLAN_EVENT",
        basedOn: ["PROFILE"],
        createdAt: now.toISOString(),
      })
      break
  }

  return recommendations
}

function getSeasonalRecommendations(context: HorseContext, now: Date): Recommendation[] {
  const recommendations: Recommendation[] = []
  const month = now.getMonth() + 1 // 1-12

  // Spring (March-May)
  if (month >= 3 && month <= 5) {
    recommendations.push({
      id: `reco-spring-deworm-${Date.now()}`,
      horseId: context.id,
      title: "Printemps : vermifuge saisonnier",
      detail:
        "Le printemps est une période clé pour le vermifuge (ciblant les strongles). Une coproscopie préalable permet d'adapter le traitement et de limiter les résistances.",
      category: "SEASONAL",
      priority: "MEDIUM",
      action: "PLAN_EVENT",
      basedOn: ["SEASON"],
      createdAt: now.toISOString(),
    })

    recommendations.push({
      id: `reco-spring-vaccine-${Date.now()}`,
      horseId: context.id,
      title: "Printemps : saison des vaccins",
      detail:
        "Le printemps est la période idéale pour mettre à jour les vaccins (grippe, tétanos) avant la saison des concours et rassemblements.",
      category: "SEASONAL",
      priority: "MEDIUM",
      action: "READ_MORE",
      basedOn: ["SEASON"],
      createdAt: now.toISOString(),
    })
  }

  // Summer (June-August)
  if (month >= 6 && month <= 8) {
    recommendations.push({
      id: `reco-summer-hydration-${Date.now()}`,
      horseId: context.id,
      title: "Été : vigilance hydratation",
      detail:
        "En période de chaleur, assurez-vous que votre cheval boit suffisamment (20-50L/jour). Vous pouvez ajouter des électrolytes après l'effort et proposer de l'eau tiède pour l'encourager à boire.",
      category: "SEASONAL",
      priority: "MEDIUM",
      action: "READ_MORE",
      basedOn: ["SEASON", "WEATHER"],
      createdAt: now.toISOString(),
    })

    recommendations.push({
      id: `reco-summer-insects-${Date.now()}`,
      horseId: context.id,
      title: "Été : protection anti-insectes",
      detail:
        "Utilisez des répulsifs, masques anti-mouches et couvertures légères pour protéger votre cheval des insectes piqueurs qui peuvent transmettre des maladies.",
      category: "SEASONAL",
      priority: "LOW",
      action: "READ_MORE",
      basedOn: ["SEASON"],
      createdAt: now.toISOString(),
    })
  }

  // Fall (September-November)
  if (month >= 9 && month <= 11) {
    recommendations.push({
      id: `reco-fall-deworm-${Date.now()}`,
      horseId: context.id,
      title: "Automne : vermifuge saisonnier",
      detail:
        "Le vermifuge d'automne est essentiel pour cibler les parasites avant l'hiver. Privilégiez une molécule à large spectre après coproscopie.",
      category: "SEASONAL",
      priority: "MEDIUM",
      action: "PLAN_EVENT",
      basedOn: ["SEASON"],
      createdAt: now.toISOString(),
    })
  }

  // Winter (December-February)
  if (month === 12 || month <= 2) {
    recommendations.push({
      id: `reco-winter-feeding-${Date.now()}`,
      horseId: context.id,
      title: "Hiver : adaptation de la ration",
      detail:
        "En hiver, les chevaux brûlent plus de calories pour se réchauffer. Augmentez la ration de fourrage (foin) et surveillez le poids régulièrement.",
      category: "SEASONAL",
      priority: "MEDIUM",
      action: "READ_MORE",
      basedOn: ["SEASON"],
      createdAt: now.toISOString(),
    })

    recommendations.push({
      id: `reco-winter-water-${Date.now()}`,
      horseId: context.id,
      title: "Hiver : eau non gelée",
      detail:
        "Vérifiez quotidiennement que l'eau n'est pas gelée. Vous pouvez tiédir légèrement l'eau pour encourager le cheval à boire et prévenir les coliques de déshydratation.",
      category: "SEASONAL",
      priority: "MEDIUM",
      action: "READ_MORE",
      basedOn: ["SEASON", "WEATHER"],
      createdAt: now.toISOString(),
    })
  }

  return recommendations
}
