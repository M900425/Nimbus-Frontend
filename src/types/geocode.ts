export interface GeocodeResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  class: string;
  type: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    state?: string;
  };
}
