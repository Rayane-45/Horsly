import type { GPSPoint } from "./types"

export function generateGPX(points: GPSPoint[], name = "Session"): string {
  const trackPoints = points
    .map(
      (p) => `    <trkpt lat="${p.lat}" lon="${p.lon}">
      ${p.ele ? `<ele>${p.ele}</ele>` : ""}
      <time>${new Date(p.time).toISOString()}</time>
      ${p.speed ? `<extensions><speed>${p.speed}</speed></extensions>` : ""}
    </trkpt>`,
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Cavaly" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${name}</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
  <trk>
    <name>${name}</name>
    <trkseg>
${trackPoints}
    </trkseg>
  </trk>
</gpx>`
}
