import type { Gait } from "./types"

const THRESHOLDS = {
  walk: [0.5, 7],
  trot: [7, 15],
  canter: [15, 22],
  gallop: [22, 80],
}

export class GaitDetector {
  private vEMA = 0
  private alpha = 0.3
  private last: Gait = "idle"
  private consistencyCount = 0
  private readonly CONSISTENCY_THRESHOLD = 3

  update(speedKmh: number, accelMag?: number): Gait {
    // Exponential moving average for smoothing
    this.vEMA = this.vEMA === 0 ? speedKmh : this.alpha * speedKmh + (1 - this.alpha) * this.vEMA

    const v = this.vEMA
    let detected: Gait = "idle"

    if (v < THRESHOLDS.walk[0]) {
      detected = "idle"
    } else if (v < THRESHOLDS.walk[1]) {
      detected = "walk"
    } else if (v < THRESHOLDS.trot[1]) {
      detected = "trot"
    } else if (v < THRESHOLDS.canter[1]) {
      detected = "canter"
    } else {
      detected = "gallop"
    }

    // Hysteresis: require consistent readings before switching gait
    if (this.last !== detected) {
      this.consistencyCount++
      if (this.consistencyCount >= this.CONSISTENCY_THRESHOLD) {
        this.last = detected
        this.consistencyCount = 0
      }
    } else {
      this.consistencyCount = 0
    }

    return this.last
  }

  reset() {
    this.vEMA = 0
    this.last = "idle"
    this.consistencyCount = 0
  }

  getCurrentGait(): Gait {
    return this.last
  }
}

export function detectGait(speedKmh: number): "WALK" | "TROT" | "CANTER" | "GALLOP" {
  if (speedKmh < THRESHOLDS.walk[0]) {
    return "WALK"
  } else if (speedKmh < THRESHOLDS.walk[1]) {
    return "WALK"
  } else if (speedKmh < THRESHOLDS.trot[1]) {
    return "TROT"
  } else if (speedKmh < THRESHOLDS.canter[1]) {
    return "CANTER"
  } else {
    return "GALLOP"
  }
}
