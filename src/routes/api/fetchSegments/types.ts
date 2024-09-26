export type SegmentInfo = {
  avg_grade: number;
  climb_category: number;
  climb_category_desc: string;
  distance: number;
  elev_difference: number;
  elevation_profile: string;
  end_latlng: [number, number];
  id: number;
  local_legend_enabled: boolean;
  name: string;
  points: string;
  resource_state: number;
  starred: boolean;
  start_latlng: [number, number];
};

export type SegmentDetails = {
  name: string;
  distance: string;
  elevationGain: string;
  avgGrade: string;
  lowestElev: string;
  highestElev: string;
  elevDifference: string;
  climbCategory: string;
  attempts: string;
};

export type Athlete = {
  rank: number;
  name: string;
  speed?: string;
  power?: string;
  vam?: number;
  time: string;
};

export interface SegmentParseResponse {
  legacySegment: SegmentInfo;
  segment: SegmentDetails | null;
  athlete: Athlete | null;
}


export interface Segment {
  id: number,
  name: string
  category: string
  distance: number
  elevationGain: string
  averageGrade: number
  maximum_grade: string;
  elevation_high: string;
  elevation_low: string;
  time: string,
  kVAM: number,
  qVAM: number,
}