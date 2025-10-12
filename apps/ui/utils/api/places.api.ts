const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
const PLACES_API_BASE_URL = 'https://places.googleapis.com/v1';
const GEOCODING_API_BASE_URL = 'https://maps.googleapis.com/maps/api/geocode';

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
          radius: 50000.0, // 50km radius
        },
      };
    }

    const response = await fetch(`${PLACES_API_BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY || '',
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
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
