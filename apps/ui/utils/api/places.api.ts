const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1';
const GEOCODING_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode';
const MAX_SEARCH_RADIUS_KM = 3; // Maximum search radius in kilometers

export interface PlaceAutocomplete {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
  name: string;
}

export interface GeocodedAddress {
  formatted_address: string;
  place_id: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// Helper to convert new API format to old format for compatibility
function convertNewPlaceToOldFormat(place: any): PlaceAutocomplete {
  const mainText = place.displayName?.text || place.formattedAddress || '';
  const secondaryText = place.formattedAddress || '';

  return {
    description: place.formattedAddress || mainText,
    place_id: place.id || '',
    structured_formatting: {
      main_text: mainText,
      secondary_text: secondaryText,
    },
  };
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

export { MAX_SEARCH_RADIUS_KM };

/**
 * Search for places using Google Places API (New)
 * @param input - Search query text
 * @param location - Optional location bias (lat,lng)
 * @returns Array of place predictions
 */
export async function searchPlaces(
  input: string,
  location?: { latitude: number; longitude: number }
): Promise<PlaceAutocomplete[]> {
  if (!input.trim()) {
    return [];
  }

  try {
    const requestBody: any = {
      textQuery: input,
      languageCode: 'id',
      regionCode: 'ID', // Indonesia
    };

    // Add location bias if provided
    if (location) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
          radius: MAX_SEARCH_RADIUS_KM * 1000, // Convert km to meters
        },
      };
    }

    const response = await fetch(`${PLACES_API_BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY || '',
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.places && Array.isArray(data.places)) {
      return data.places.map(convertNewPlaceToOldFormat);
    }

    return [];
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

/**
 * Get detailed information about a place using place_id
 * @param placeId - Google Place ID (format: places/{place_id})
 * @returns Place details including coordinates
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  try {
    // Remove 'places/' prefix if it exists
    const cleanPlaceId = placeId.replace(/^places\//, '');

    const response = await fetch(`${PLACES_API_BASE_URL}/places/${cleanPlaceId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY || '',
        'X-Goog-FieldMask': 'id,displayName,formattedAddress,location',
      },
    });

    const data = await response.json();

    if (data.id) {
      return {
        place_id: data.id,
        formatted_address: data.formattedAddress || '',
        geometry: {
          location: {
            lat: data.location?.latitude || 0,
            lng: data.location?.longitude || 0,
          },
        },
        name: data.displayName?.text || '',
      };
    } else {
      console.error('Place Details API error:', data);
      throw new Error('Failed to fetch place details');
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
}

/**
 * Reverse geocode coordinates to get address
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @returns Formatted address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<GeocodedAddress> {
  try {
    const params = new URLSearchParams({
      latlng: `${latitude},${longitude}`,
      key: GOOGLE_MAPS_API_KEY || '',
      language: 'id',
    });

    const response = await fetch(`${GEOCODING_API_BASE_URL}/json?${params}`);
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      return data.results[0];
    } else {
      console.error('Geocoding API error:', data.status, data.error_message);
      throw new Error(data.error_message || 'Failed to reverse geocode');
    }
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    throw error;
  }
}

/**
 * Decode an encoded polyline string into an array of coordinates
 * Uses Google's polyline encoding algorithm
 * @param encoded - Encoded polyline string
 * @returns Array of coordinates
 */
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

export interface RoutesResponse {
  routes: {
    polyline: {
      encodedPolyline: string;
    };
    distanceMeters: number;
    duration: string;
    localizedValues?: {
      distance: {
        text: string;
      };
      duration: {
        text: string;
      };
    };
  }[];
}

/**
 * Get route from origin to destination using Google Routes API v2
 * @param origin - Origin coordinates
 * @param destination - Destination coordinates
 * @returns Route information including polyline coordinates
 */
export async function getDirections(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<{
  coordinates: { latitude: number; longitude: number }[];
  distance: string;
  duration: string;
}> {
  try {
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: origin.latitude,
            longitude: origin.longitude,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.latitude,
            longitude: destination.longitude,
          },
        },
      },
      travelMode: 'WALK',
      computeAlternativeRoutes: false,
      languageCode: 'id',
      units: 'METRIC',
    };

    const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY || '',
        'X-Goog-FieldMask':
          'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline,routes.localizedValues',
      },
      body: JSON.stringify(requestBody),
    });

    // Log the response status
    console.log('Routes API response status:', response.status);

    const data: RoutesResponse = await response.json();

    // Log the full response for debugging
    console.log('Routes API response data:', JSON.stringify(data, null, 2));

    // Check if there's an error in the response
    if ((data as any).error) {
      console.error('Routes API error:', {
        code: (data as any).error.code,
        message: (data as any).error.message,
        status: (data as any).error.status,
        details: (data as any).error.details,
      });
      throw new Error(`Routes API error: ${(data as any).error.message || 'Unknown error'}`);
    }

    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const encodedPolyline = route.polyline.encodedPolyline;
      const coordinates = decodePolyline(encodedPolyline);

      // Format distance (convert meters to km if > 1000m)
      const distanceMeters = route.distanceMeters;
      const distance =
        distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} m`;

      // Format duration (convert from "123s" format to readable format)
      const durationMatch = route.duration.match(/(\d+)s/);
      const durationSeconds = durationMatch ? parseInt(durationMatch[1]) : 0;
      const durationMinutes = Math.ceil(durationSeconds / 60);
      const duration = `${durationMinutes} menit`;

      return {
        coordinates,
        distance,
        duration,
      };
    } else {
      console.error('Routes API error: No routes in response', {
        response: data,
        hasRoutes: !!data.routes,
        routesLength: data.routes?.length,
      });
      throw new Error('Routes API failed: No routes found');
    }
  } catch (error) {
    console.error('Error fetching route:', error);
    throw error;
  }
}
