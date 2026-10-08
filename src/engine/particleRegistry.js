/**
 * A tiny registry of "particle zones". Sections register a DOM element with
 * a shape descriptor; the global ParticleLayer picks the zone nearest the
 * viewport center and morphs the shared dash cloud into its shape.
 */

const zones = new Map()
const listeners = new Set()

export function registerZone(zone) {
  zones.set(zone.id, zone)
  listeners.forEach((fn) => fn())
}

export function unregisterZone(id) {
  zones.delete(id)
  listeners.forEach((fn) => fn())
}

export function getZones() {
  return Array.from(zones.values())
}

export function subscribeZones(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
