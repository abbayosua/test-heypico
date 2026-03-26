// Google Maps Place Types

export interface Place {
  id: string;
  placeId: string;
  name: string;
  address: string;
  formattedAddress?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  totalRatings?: number;
  priceLevel?: number;
  types?: string[];
  photos?: PlacePhoto[];
  openingHours?: {
    isOpen: boolean;
    periods?: OpeningPeriod[];
    weekdayText?: string[];
  };
  phoneNumber?: string;
  website?: string;
  googleMapsUrl?: string;
}

export interface PlacePhoto {
  photoReference: string;
  height: number;
  width: number;
}

export interface OpeningPeriod {
  open: {
    day: number;
    time: string;
  };
  close: {
    day: number;
    time: string;
  };
}

export interface PlaceSearchResult {
  places: Place[];
  total: number;
  query: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface DirectionsRequest {
  origin: string | { lat: number; lng: number };
  destination: string | { lat: number; lng: number };
  travelMode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export interface DirectionsStep {
  distance: string;
  duration: string;
  instructions: string;
  travelMode: string;
}

export interface DirectionsRoute {
  summary: string;
  distance: string;
  duration: string;
  steps: DirectionsStep[];
  polyline?: string; // Encoded polyline for rendering on map
}

export interface GeocodeResult {
  address: string;
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId?: string;
}

export interface MapConfig {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  styles?: MapStyle[];
}

export interface MapStyle {
  featureType?: string;
  elementType?: string;
  stylers: Record<string, string | number | boolean>[];
}
