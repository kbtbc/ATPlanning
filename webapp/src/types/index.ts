export type WaypointType =
  | 'shelter'
  | 'resupply'
  | 'town'
  | 'water'
  | 'campsite'
  | 'feature'
  | 'hostel'
  | 'post_office';

export type Direction = 'NOBO' | 'SOBO';

export interface Waypoint {
  id: string;
  name: string;
  mile: number; // Mile from Springer Mountain (NOBO)
  soboMile: number; // Mile from Katahdin (SOBO)
  elevation: number; // in feet
  lat: number;
  lng: number;
  state: string;
  county?: string;
  type: WaypointType;
  services?: string[];
  notes?: string;
  distanceFromTrail?: number; // in miles, 0 if on trail
}

export interface ResupplyPoint extends Waypoint {
  type: 'resupply' | 'town';
  hasGrocery: boolean;
  hasOutfitter: boolean;
  hasPostOffice: boolean;
  hasLodging: boolean;
  hasRestaurant: boolean;
  hasLaundry: boolean;
  hasShower: boolean;
  /**
   * Resupply location category:
   * - major_town: Full services, grocery stores, outfitters (e.g., Franklin, Hot Springs)
   * - trail_town: Good resupply, limited selection (e.g., Damascus, Waynesboro)
   * - on_trail: Convenience/camp stores near trail (e.g., Mountain Crossings, NOC)
   * - limited: Minimal options, plan ahead (e.g., small general stores)
   */
  resupplyQuality: 'major_town' | 'trail_town' | 'on_trail' | 'limited';
  distanceFromTrail: number;
  directionFromTrail?: 'E' | 'W'; // E = East (right when NOBO), W = West (left when NOBO)
  shuttleAvailable?: boolean;
  notes?: string;
  businesses?: Business[];
}

export interface Shelter extends Waypoint {
  type: 'shelter';
  capacity?: number;
  hasWater: boolean;
  waterDistance?: number; // distance to water in feet
  hasPrivy: boolean;
  isTenting: boolean;
  fee?: number;
}

export interface DayPlan {
  day: number;
  date: Date;
  startMile: number;
  endMile: number;
  distance: number;
  startWaypoint: Waypoint | null;
  endWaypoint: Waypoint | null;
  waypointsEnRoute: Waypoint[];
  resupplyOptions: ResupplyPoint[];
  elevationGain: number;
  elevationLoss: number;
}

export interface HikePlan {
  id: string;
  name: string;
  direction: Direction;
  startDate: Date;
  startMile: number;
  endMile: number;
  averageMilesPerDay: number;
  days: DayPlan[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterOptions {
  types: WaypointType[];
  states: string[];
  minMile: number;
  maxMile: number;
  hasWater?: boolean;
  hasResupply?: boolean;
  onTrailOnly?: boolean;
  searchQuery: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  nearestMile: number | null;
  nearestWaypoint: Waypoint | null;
}

// Contact information for resupply points
export interface ContactInfo {
  resupplyId: string;
  businesses: Business[];
}

export interface Business {
  id?: string;
  name: string;
  type: BusinessType;
  phone?: string;
  phone2?: string;
  address?: string;
  hours?: string;
  website?: string;
  email?: string;
  googleMapsUrl?: string;
  notes?: string;
  pricing?: string;
  services?: string[];
  lastVerified?: string; // ISO date string (e.g., '2026-02-04')
  status?: 'open' | 'closed' | 'seasonal' | 'unverified';
  seasonalHours?: string; // e.g., 'Mar-Oct only'
}

export type BusinessType =
  | 'outfitter'
  | 'hostel'
  | 'grocery'
  | 'restaurant'
  | 'post_office'
  | 'lodging'
  | 'general_store'
  | 'visitor_center'
  | 'shuttle'
  | 'laundry'
  | 'camping'
  | 'campground'
  | 'shelter'
  | 'medical'
  | 'pharmacy'
  | 'veterinary'
  | 'hospital'
  | 'library'
  | 'services'
  | 'activity'
  | 'museum'
  | 'kennel'
  | 'shipping';
