import { Person, FamilyEvent } from '../types';

export interface GeoLocation {
  name: string;
  country: string;
  lat: number;
  lng: number;
  x: number; // 0 - 800 SVG coordinate
  y: number; // 0 - 550 SVG coordinate
}

export interface FamiliarGeoPoint {
  id: string;
  name: string;
  locationName: string;
  country: string;
  lat: number;
  lng: number;
  x: number;
  y: number;
  type: 'origin' | 'residence' | 'destination' | 'mixed';
  people: {
    person: Person;
    role: 'birth' | 'death' | 'living' | 'event';
    year?: string;
    eventTitle?: string;
  }[];
}

export interface FamiliarRoute {
  id: string;
  personId: string;
  person: Person;
  originPoint: FamiliarGeoPoint;
  destinationPoint?: FamiliarGeoPoint;
  waypointPoints?: FamiliarGeoPoint[];
  path: string;
  color: string;
  startYear?: string;
  endYear?: string;
  description: string;
}

// Projection helper for SVG map (Equirectangular projection calibrated for world viewBox 0 0 800 550)
export function projectCoordinates(lat: number, lng: number): { x: number; y: number } {
  // Clamp latitude to -75 to 80
  const clampedLat = Math.max(-75, Math.min(80, lat));
  // Clamp longitude to -180 to 180
  const clampedLng = Math.max(-180, Math.min(180, lng));

  // Map lng: [-180, 180] -> [30, 770]
  const x = ((clampedLng + 180) / 360) * 740 + 30;

  // Map lat: [80, -75] -> [60, 500] (y goes down in SVG)
  const y = ((80 - clampedLat) / 155) * 440 + 60;

  return {
    x: Math.round(x * 10) / 10,
    y: Math.round(y * 10) / 10
  };
}

// Built-in database of international places, cities, provinces, and countries for fast geocoding
const KNOWN_GEO_PLACES: Record<string, { lat: number; lng: number; country: string }> = {
  // España
  'madrid': { lat: 40.4168, lng: -3.7038, country: 'España' },
  'barcelona': { lat: 41.3879, lng: 2.1699, country: 'España' },
  'oviedo': { lat: 43.3619, lng: -5.8494, country: 'España' },
  'gijon': { lat: 43.5322, lng: -5.6611, country: 'España' },
  'gijón': { lat: 43.5322, lng: -5.6611, country: 'España' },
  'asturias': { lat: 43.3619, lng: -5.8494, country: 'España' },
  'sevilla': { lat: 37.3891, lng: -5.9845, country: 'España' },
  'valencia': { lat: 39.4699, lng: -0.3763, country: 'España' },
  'bilbao': { lat: 43.2630, lng: -2.9350, country: 'España' },
  'vizcaya': { lat: 43.2630, lng: -2.9350, country: 'España' },
  'galicia': { lat: 42.8782, lng: -8.5448, country: 'España' },
  'la coruña': { lat: 43.3623, lng: -8.4115, country: 'España' },
  'a coruña': { lat: 43.3623, lng: -8.4115, country: 'España' },
  'vigo': { lat: 42.2406, lng: -8.7207, country: 'España' },
  'ourense': { lat: 42.3358, lng: -7.8639, country: 'España' },
  'santander': { lat: 43.4623, lng: -3.8099, country: 'España' },
  'cantabria': { lat: 43.1828, lng: -3.9878, country: 'España' },
  'malaga': { lat: 36.7213, lng: -4.4214, country: 'España' },
  'málaga': { lat: 36.7213, lng: -4.4214, country: 'España' },
  'cadiz': { lat: 36.5271, lng: -6.2886, country: 'España' },
  'cádiz': { lat: 36.5271, lng: -6.2886, country: 'España' },
  'zaragoza': { lat: 41.6488, lng: -0.8891, country: 'España' },
  'granada': { lat: 37.1773, lng: -3.5986, country: 'España' },
  'tenerife': { lat: 28.2916, lng: -16.6291, country: 'España' },
  'canarias': { lat: 28.2916, lng: -16.6291, country: 'España' },
  'espana': { lat: 40.4637, lng: -3.7492, country: 'España' },
  'españa': { lat: 40.4637, lng: -3.7492, country: 'España' },

  // Italia
  'genova': { lat: 44.4056, lng: 8.9463, country: 'Italia' },
  'génova': { lat: 44.4056, lng: 8.9463, country: 'Italia' },
  'liguria': { lat: 44.4056, lng: 8.9463, country: 'Italia' },
  'roma': { lat: 41.9028, lng: 12.4964, country: 'Italia' },
  'milan': { lat: 45.4642, lng: 9.1900, country: 'Italia' },
  'milán': { lat: 45.4642, lng: 9.1900, country: 'Italia' },
  'lombardia': { lat: 45.4642, lng: 9.1900, country: 'Italia' },
  'napoles': { lat: 40.8518, lng: 14.2681, country: 'Italia' },
  'nápoles': { lat: 40.8518, lng: 14.2681, country: 'Italia' },
  'turin': { lat: 45.0703, lng: 7.6869, country: 'Italia' },
  'turín': { lat: 45.0703, lng: 7.6869, country: 'Italia' },
  'piamonte': { lat: 45.0703, lng: 7.6869, country: 'Italia' },
  'venecia': { lat: 45.4408, lng: 12.3155, country: 'Italia' },
  'veneto': { lat: 45.4408, lng: 12.3155, country: 'Italia' },
  'palermo': { lat: 38.1157, lng: 13.3615, country: 'Italia' },
  'sicilia': { lat: 37.5990, lng: 14.0154, country: 'Italia' },
  'calabria': { lat: 38.9054, lng: 16.5944, country: 'Italia' },
  'florencia': { lat: 43.7696, lng: 11.2558, country: 'Italia' },
  'toscana': { lat: 43.7696, lng: 11.2558, country: 'Italia' },
  'italia': { lat: 41.8719, lng: 12.5674, country: 'Italia' },

  // Argentina
  'buenos aires': { lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  'bsas': { lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  'puerto de buenos aires': { lat: -34.6037, lng: -58.3816, country: 'Argentina' },
  'concordia': { lat: -31.3930, lng: -58.0209, country: 'Argentina' },
  'entre rios': { lat: -32.0589, lng: -59.2014, country: 'Argentina' },
  'entre ríos': { lat: -32.0589, lng: -59.2014, country: 'Argentina' },
  'rosario': { lat: -32.9468, lng: -60.6393, country: 'Argentina' },
  'santa fe': { lat: -31.6333, lng: -60.7000, country: 'Argentina' },
  'cordoba': { lat: -31.4201, lng: -64.1888, country: 'Argentina' },
  'córdoba': { lat: -31.4201, lng: -64.1888, country: 'Argentina' },
  'mendoza': { lat: -32.8895, lng: -68.8458, country: 'Argentina' },
  'tucuman': { lat: -26.8083, lng: -65.2176, country: 'Argentina' },
  'tucumán': { lat: -26.8083, lng: -65.2176, country: 'Argentina' },
  'salta': { lat: -24.7821, lng: -65.4232, country: 'Argentina' },
  'mar del plata': { lat: -38.0055, lng: -57.5560, country: 'Argentina' },
  'la plata': { lat: -34.9214, lng: -57.9545, country: 'Argentina' },
  'bariloche': { lat: -41.1335, lng: -71.3103, country: 'Argentina' },
  'corrientes': { lat: -27.4692, lng: -58.8306, country: 'Argentina' },
  'posadas': { lat: -27.3621, lng: -55.8967, country: 'Argentina' },
  'misiones': { lat: -27.3621, lng: -55.8967, country: 'Argentina' },
  'parana': { lat: -31.7333, lng: -60.5333, country: 'Argentina' },
  'paraná': { lat: -31.7333, lng: -60.5333, country: 'Argentina' },
  'argentina': { lat: -38.4161, lng: -63.6167, country: 'Argentina' },

  // Uruguay
  'montevideo': { lat: -34.9011, lng: -56.1645, country: 'Uruguay' },
  'salto': { lat: -31.3833, lng: -57.9667, country: 'Uruguay' },
  'paysandu': { lat: -32.3214, lng: -58.0756, country: 'Uruguay' },
  'paysandú': { lat: -32.3214, lng: -58.0756, country: 'Uruguay' },
  'punta del este': { lat: -34.9667, lng: -54.9500, country: 'Uruguay' },
  'colonia': { lat: -34.4626, lng: -57.8400, country: 'Uruguay' },
  'uruguay': { lat: -32.5228, lng: -55.7658, country: 'Uruguay' },

  // Otros países y ciudades comunes
  'paris': { lat: 48.8566, lng: 2.3522, country: 'Francia' },
  'parís': { lat: 48.8566, lng: 2.3522, country: 'Francia' },
  'marsella': { lat: 43.2965, lng: 5.3698, country: 'Francia' },
  'francia': { lat: 46.2276, lng: 2.2137, country: 'Francia' },
  'lisboa': { lat: 38.7223, lng: -9.1393, country: 'Portugal' },
  'porto': { lat: 41.1579, lng: -8.6291, country: 'Portugal' },
  'oporto': { lat: 41.1579, lng: -8.6291, country: 'Portugal' },
  'portugal': { lat: 39.3999, lng: -8.2245, country: 'Portugal' },
  'berlin': { lat: 52.5200, lng: 13.4050, country: 'Alemania' },
  'berlín': { lat: 52.5200, lng: 13.4050, country: 'Alemania' },
  'frankfurt': { lat: 50.1109, lng: 8.6821, country: 'Alemania' },
  'alemania': { lat: 51.1657, lng: 10.4515, country: 'Alemania' },
  'londres': { lat: 51.5074, lng: -0.1278, country: 'Reino Unido' },
  'inglaterra': { lat: 52.3555, lng: -1.1743, country: 'Reino Unido' },
  'reino unido': { lat: 55.3781, lng: -3.4360, country: 'Reino Unido' },
  'mexico': { lat: 19.4326, lng: -99.1332, country: 'México' },
  'méxico': { lat: 19.4326, lng: -99.1332, country: 'México' },
  'guadalajara': { lat: 20.6597, lng: -103.3496, country: 'México' },
  'monterrey': { lat: 25.6866, lng: -100.3161, country: 'México' },
  'bogota': { lat: 4.7110, lng: -74.0721, country: 'Colombia' },
  'bogotá': { lat: 4.7110, lng: -74.0721, country: 'Colombia' },
  'medellin': { lat: 6.2442, lng: -75.5812, country: 'Colombia' },
  'medellín': { lat: 6.2442, lng: -75.5812, country: 'Colombia' },
  'colombia': { lat: 4.5709, lng: -74.2973, country: 'Colombia' },
  'lima': { lat: -12.0464, lng: -77.0428, country: 'Perú' },
  'cusco': { lat: -13.5319, lng: -71.9675, country: 'Perú' },
  'peru': { lat: -9.1900, lng: -75.0152, country: 'Perú' },
  'perú': { lat: -9.1900, lng: -75.0152, country: 'Perú' },
  'santiago': { lat: -33.4489, lng: -70.6693, country: 'Chile' },
  'valparaiso': { lat: -33.0472, lng: -71.6127, country: 'Chile' },
  'valparaíso': { lat: -33.0472, lng: -71.6127, country: 'Chile' },
  'chile': { lat: -35.6751, lng: -71.5430, country: 'Chile' },
  'sao paulo': { lat: -23.5505, lng: -46.6333, country: 'Brasil' },
  'são paulo': { lat: -23.5505, lng: -46.6333, country: 'Brasil' },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729, country: 'Brasil' },
  'brasil': { lat: -14.2350, lng: -51.9253, country: 'Brasil' },
  'habana': { lat: 23.1136, lng: -82.3666, country: 'Cuba' },
  'la habana': { lat: 23.1136, lng: -82.3666, country: 'Cuba' },
  'cuba': { lat: 21.5218, lng: -77.7812, country: 'Cuba' },
  'nueva york': { lat: 40.7128, lng: -74.0060, country: 'Estados Unidos' },
  'new york': { lat: 40.7128, lng: -74.0060, country: 'Estados Unidos' },
  'miami': { lat: 25.7617, lng: -80.1918, country: 'Estados Unidos' },
  'estados unidos': { lat: 37.0902, lng: -95.7129, country: 'Estados Unidos' },
  'eeuu': { lat: 37.0902, lng: -95.7129, country: 'Estados Unidos' }
};

// Geocode place string into coordinates
export function resolveLocation(rawPlace?: string, customCoords?: { lat: number; lng: number }): GeoLocation | null {
  if (!rawPlace && !customCoords) return null;

  if (customCoords && customCoords.lat && customCoords.lng) {
    const proj = projectCoordinates(customCoords.lat, customCoords.lng);
    return {
      name: rawPlace || 'Ubicación Registrada',
      country: '',
      lat: customCoords.lat,
      lng: customCoords.lng,
      x: proj.x,
      y: proj.y
    };
  }

  if (!rawPlace) return null;
  const clean = rawPlace.toLowerCase().trim();

  // 1. Direct or partial match
  for (const [key, data] of Object.entries(KNOWN_GEO_PLACES)) {
    if (clean === key || clean.includes(key) || key.includes(clean)) {
      const proj = projectCoordinates(data.lat, data.lng);
      return {
        name: rawPlace,
        country: data.country,
        lat: data.lat,
        lng: data.lng,
        x: proj.x,
        y: proj.y
      };
    }
  }

  // 2. Token based search (split by comma, space)
  const tokens = clean.split(/[,;\-\/]+/).map(t => t.trim()).filter(Boolean);
  for (const token of tokens) {
    for (const [key, data] of Object.entries(KNOWN_GEO_PLACES)) {
      if (token === key || token.includes(key)) {
        const proj = projectCoordinates(data.lat, data.lng);
        return {
          name: rawPlace,
          country: data.country,
          lat: data.lat,
          lng: data.lng,
          x: proj.x,
          y: proj.y
        };
      }
    }
  }

  // 3. Fallback deterministic hash-based location in Western Hemisphere/Europe if completely unknown
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const fallbackLat = 10 + (Math.abs(hash % 40) - 20);
  const fallbackLng = -40 + (Math.abs((hash >> 3) % 80) - 40);
  const proj = projectCoordinates(fallbackLat, fallbackLng);

  return {
    name: rawPlace,
    country: 'Internacional',
    lat: fallbackLat,
    lng: fallbackLng,
    x: proj.x,
    y: proj.y
  };
}

// Generate unique key for location aggregation
function getPointKey(loc: GeoLocation): string {
  return `${Math.round(loc.lat * 10) / 10},${Math.round(loc.lng * 10) / 10}`;
}

// Extract dynamic GeoPoints & Routes from all relatives in the family tree
export function extractFamilyGeoData(people: Person[], events: FamilyEvent[] = []): {
  geoPoints: FamiliarGeoPoint[];
  routes: FamiliarRoute[];
} {
  const pointsMap = new Map<string, FamiliarGeoPoint>();

  // Helper to add or retrieve a point
  const getOrCreatePoint = (
    loc: GeoLocation, 
    person: Person, 
    role: 'birth' | 'death' | 'living' | 'event', 
    year?: string, 
    eventTitle?: string
  ): FamiliarGeoPoint => {
    const key = getPointKey(loc);
    let pt = pointsMap.get(key);

    const typeRole: 'origin' | 'residence' | 'destination' = 
      role === 'birth' ? 'origin' : role === 'death' ? 'destination' : 'residence';

    if (!pt) {
      pt = {
        id: `pt-${key.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        name: loc.name,
        locationName: loc.name,
        country: loc.country,
        lat: loc.lat,
        lng: loc.lng,
        x: loc.x,
        y: loc.y,
        type: typeRole,
        people: []
      };
      pointsMap.set(key, pt);
    } else {
      if (pt.type !== typeRole && pt.type !== 'mixed') {
        pt.type = 'mixed';
      }
    }

    // Add person if not already listed with this role
    const exists = pt.people.some(p => p.person.id === person.id && p.role === role);
    if (!exists) {
      pt.people.push({ person, role, year, eventTitle });
    }

    return pt;
  };

  const routes: FamiliarRoute[] = [];

  const routeColors = [
    '#5A5A40', // Olive
    '#A65D47', // Terracotta
    '#2563EB', // Blue
    '#7C3AED', // Violet
    '#059669', // Emerald
    '#D97706', // Amber
    '#434331', // Dark Forest
    '#BE123C'  // Crimson
  ];

  // 1. Process each person in the tree
  people.forEach((p, idx) => {
    const birthLoc = resolveLocation(p.birthPlace, p.birthCoordinates);
    const deathLoc = resolveLocation(p.deathPlace, p.deathCoordinates);

    let birthPoint: FamiliarGeoPoint | null = null;
    let deathPoint: FamiliarGeoPoint | null = null;

    if (birthLoc) {
      birthPoint = getOrCreatePoint(birthLoc, p, 'birth', p.birthDate || p.birthDateApprox);
    }

    if (deathLoc) {
      deathPoint = getOrCreatePoint(deathLoc, p, 'death', p.deathDate || p.deathDateApprox);
    }

    // Process intermediate living events for this person
    const personEvents = events.filter(e => e.personIds && e.personIds.includes(p.id) && e.place);
    const waypoints: FamiliarGeoPoint[] = [];

    personEvents.forEach(ev => {
      const evLoc = resolveLocation(ev.place, ev.coordinates);
      if (evLoc) {
        const evPoint = getOrCreatePoint(evLoc, p, 'living', ev.date || ev.dateApprox, ev.title);
        waypoints.push(evPoint);
      }
    });

    // If person has distinct places (e.g. birth and death, or birth and living, or living and death)
    if (birthPoint && deathPoint && (birthPoint.id !== deathPoint.id || waypoints.length > 0)) {
      // Build curved SVG path
      const path = buildCurvedPath(birthPoint, waypoints, deathPoint);
      const color = routeColors[idx % routeColors.length];

      routes.push({
        id: `route-${p.id}`,
        personId: p.id,
        person: p,
        originPoint: birthPoint,
        destinationPoint: deathPoint,
        waypointPoints: waypoints,
        path,
        color,
        startYear: p.birthDate?.substring(0, 4) || p.birthDateApprox,
        endYear: p.deathDate?.substring(0, 4) || p.deathDateApprox,
        description: `Trayectoria de vida de ${p.firstName} ${p.lastName || ''} desde ${birthPoint.name} hasta ${deathPoint.name}.`
      });
    } else if (birthPoint && waypoints.length > 0) {
      const lastWaypoint = waypoints[waypoints.length - 1];
      const path = buildCurvedPath(birthPoint, waypoints.slice(0, -1), lastWaypoint);
      const color = routeColors[idx % routeColors.length];

      routes.push({
        id: `route-${p.id}`,
        personId: p.id,
        person: p,
        originPoint: birthPoint,
        destinationPoint: lastWaypoint,
        waypointPoints: waypoints.slice(0, -1),
        path,
        color,
        startYear: p.birthDate?.substring(0, 4) || p.birthDateApprox,
        endYear: lastWaypoint.people.find(item => item.person.id === p.id)?.year,
        description: `Desplazamiento de ${p.firstName} ${p.lastName || ''} desde ${birthPoint.name} hacia ${lastWaypoint.name}.`
      });
    }
  });

  return {
    geoPoints: Array.from(pointsMap.values()),
    routes
  };
}

// Generate smooth Bezier curve for SVG routes
function buildCurvedPath(start: FamiliarGeoPoint, waypoints: FamiliarGeoPoint[], end: FamiliarGeoPoint): string {
  if (!waypoints || waypoints.length === 0) {
    // 2-point curve
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    // Curve control point offset
    const cx = (start.x + end.x) / 2 - dy * 0.15;
    const cy = (start.y + end.y) / 2 + dx * 0.15;
    return `M ${start.x} ${start.y} Q ${Math.round(cx)} ${Math.round(cy)}, ${end.x} ${end.y}`;
  }

  // Multi-point spline
  let d = `M ${start.x} ${start.y}`;
  const allPts = [start, ...waypoints, end];

  for (let i = 0; i < allPts.length - 1; i++) {
    const p1 = allPts[i];
    const p2 = allPts[i + 1];
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2 - 10;
    d += ` Q ${Math.round(cx)} ${Math.round(cy)}, ${p2.x} ${p2.y}`;
  }

  return d;
}
