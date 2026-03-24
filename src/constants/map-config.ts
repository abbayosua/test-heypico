// Google Maps Configuration Constants

export const DEFAULT_MAP_CENTER = {
  lat: 35.6762, // Tokyo, Japan
  lng: 139.6503,
};

export const DEFAULT_MAP_ZOOM = 12;

export const PLACE_TYPES = {
  RESTAURANT: 'restaurant',
  CAFE: 'cafe',
  BAR: 'bar',
  TOURIST_ATTRACTION: 'tourist_attraction',
  LODGING: 'lodging',
  SHOPPING_MALL: 'shopping_mall',
  MUSEUM: 'museum',
  PARK: 'park',
  GAS_STATION: 'gas_station',
  HOSPITAL: 'hospital',
} as const;

export const PLACE_TYPE_LABELS: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe: 'Cafe',
  bar: 'Bar',
  tourist_attraction: 'Tourist Attraction',
  lodging: 'Hotel',
  shopping_mall: 'Shopping Mall',
  museum: 'Museum',
  park: 'Park',
  gas_station: 'Gas Station',
  hospital: 'Hospital',
  food: 'Food',
  establishment: 'Establishment',
  point_of_interest: 'Point of Interest',
};

export const TRAVEL_MODES = {
  DRIVING: 'driving',
  WALKING: 'walking',
  BICYCLING: 'bicycling',
  TRANSIT: 'transit',
} as const;

export const CACHE_TTL_SECONDS = 3600; // 1 hour

export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MS: 60000, // 1 minute
};
