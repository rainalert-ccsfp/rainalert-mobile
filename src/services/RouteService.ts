// This is a mock service for route calculation
// In a real app, you would integrate with Google Directions API or similar

import type { AlertLevel } from "../context/AlertContext"

type Coordinate = {
  latitude: number
  longitude: number
}

type Route = {
  id: string
  name: string
  distance: string
  duration: string
  floodRisk: "low" | "medium" | "high"
  coordinates: Coordinate[]
}

type FloodedArea = {
  location: Coordinate
  level: AlertLevel
  radius: number
}

// Check if a route passes through flooded areas
const checkRouteForFlooding = (
  route: Coordinate[],
  floodedAreas: FloodedArea[],
): { hasFlooding: boolean; risk: "low" | "medium" | "high" } => {
  let severeCount = 0
  let moderateCount = 0
  let cautionCount = 0

  // Simple algorithm to check if route points are within flooded areas
  for (const point of route) {
    for (const area of floodedAreas) {
      const distance = calculateDistance(point, area.location)
      if (distance <= area.radius / 1000) {
        // Convert radius from meters to km
        if (area.level === "severe") severeCount++
        else if (area.level === "moderate") moderateCount++
        else cautionCount++
      }
    }
  }

  // Determine overall risk
  if (severeCount > 0) return { hasFlooding: true, risk: "high" }
  if (moderateCount > 1) return { hasFlooding: true, risk: "high" }
  if (moderateCount === 1 || cautionCount > 2) return { hasFlooding: true, risk: "medium" }
  if (cautionCount > 0) return { hasFlooding: true, risk: "low" }

  return { hasFlooding: false, risk: "low" }
}

// Calculate distance between two coordinates in km (Haversine formula)
const calculateDistance = (point1: Coordinate, point2: Coordinate): number => {
  const R = 6371 // Earth's radius in km
  const dLat = deg2rad(point2.latitude - point1.latitude)
  const dLon = deg2rad(point2.longitude - point1.longitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(point1.latitude)) * Math.cos(deg2rad(point2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180)
}

// Generate a route between two points
const generateRoute = (start: Coordinate, end: Coordinate): Coordinate[] => {
  // In a real app, this would call a routing API
  // For now, we'll create a simple straight line with some intermediate points
  const steps = 5
  const route: Coordinate[] = []

  for (let i = 0; i <= steps; i++) {
    route.push({
      latitude: start.latitude + ((end.latitude - start.latitude) * i) / steps,
      longitude: start.longitude + ((end.longitude - start.longitude) * i) / steps,
    })
  }

  return route
}

// Generate alternative routes
const generateAlternativeRoutes = (start: Coordinate, end: Coordinate): Coordinate[][] => {
  const mainRoute = generateRoute(start, end)

  // Create two alternative routes with slight deviations
  const alt1: Coordinate[] = [...mainRoute]
  const alt2: Coordinate[] = [...mainRoute]

  // Add some deviation to the routes
  for (let i = 1; i < alt1.length - 1; i++) {
    alt1[i] = {
      latitude: alt1[i].latitude + (Math.random() - 0.5) * 0.01,
      longitude: alt1[i].longitude + (Math.random() - 0.5) * 0.01,
    }

    alt2[i] = {
      latitude: alt2[i].latitude + (Math.random() - 0.5) * 0.01,
      longitude: alt2[i].longitude + (Math.random() - 0.5) * 0.01,
    }
  }

  return [mainRoute, alt1, alt2]
}

// Calculate routes between two points, considering flooded areas
export const calculateRoutes = (start: Coordinate, end: Coordinate, floodedAreas: FloodedArea[]): Route[] => {
  const routes = generateAlternativeRoutes(start, end)
  const result: Route[] = []

  // Evaluate each route
  routes.forEach((routeCoords, index) => {
    const { risk } = checkRouteForFlooding(routeCoords, floodedAreas)
    const distance = calculateTotalDistance(routeCoords)

    result.push({
      id: `route${index + 1}`,
      name: index === 0 ? "Main Route" : `Alternative Route ${index}`,
      distance: `${distance.toFixed(1)} km`,
      duration: `${Math.round(distance * 2)} min`, // Rough estimate: 30 km/h average speed
      floodRisk: risk,
      coordinates: routeCoords,
    })
  })

  // Sort routes by flood risk (low to high)
  return result.sort((a, b) => {
    const riskValue = { low: 0, medium: 1, high: 2 }
    return riskValue[a.floodRisk] - riskValue[b.floodRisk]
  })
}

// Calculate total distance of a route
const calculateTotalDistance = (route: Coordinate[]): number => {
  let distance = 0
  for (let i = 0; i < route.length - 1; i++) {
    distance += calculateDistance(route[i], route[i + 1])
  }
  return distance
}

export default {
  calculateRoutes,
}
