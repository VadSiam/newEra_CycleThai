import { parseHTML } from '$lib/helpers.parse'; // Make sure to create this helper function
import { error, json, redirect } from '@sveltejs/kit';
import stravaApi from 'strava-v3';
import { signOut } from '../../../auth'; // Import from our local auth file
import type { RequestHandler } from './$types';
import type { SegmentParseResponse } from './types';

export interface Segment {
  id: number;
  name: string;
  category: string;
  distance: number;
  elevationGain: string;
  averageGrade: number;
  maximum_grade: number;
  elevation_high: string;
  elevation_low: string;
  time: string;
  kVAM: number;
  qVAM: number;
}

export const POST: RequestHandler = async ({ request, locals, cookies }) => {
  try {
    const session = await locals.auth();
    if (!session?.accessToken) {
      throw error(401, 'Unauthorized');
    }

    const { coords } = await request.json();
    if (!coords || coords.length !== 4) {
      throw error(400, 'Invalid coordinates');
    }

    const [swLat, swLon, neLat, neLon] = coords;
    const segmentsVAMForTable = await fetchData(session.accessToken, [swLat, swLon, neLat, neLon]);
    return json(segmentsVAMForTable);
  } catch (err: any) {
    console.error('Error in POST handler:', err);

    if (err.message?.includes('Authorization Error') ||
      err.statusCode === 401 ||
      (err.message?.includes('access_token') && err.message?.includes('invalid'))) {

      cookies.set('authjs.session-token', '', {
        path: '/',
        expires: new Date(0)
      });

      const redirectTo = '/';
      await signOut({
        request,
        locals,
        cookies,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        callbackUrl: redirectTo
      });

      throw redirect(303, redirectTo);
    }

    throw error(500, 'Failed to fetch segments');
  }
};

async function fetchData(accessToken: string, coords: number[]) {
  console.log('🚀 ~ coords:', coords)
  let isError = false;
  const [swLat, swLon, neLat, neLon] = coords;
  const areaToExplore = calculateArea([swLat, swLon, neLat, neLon]);

  let targetSize = 10; // default target size for splitting
  if (areaToExplore > 30) {
    targetSize = 10;
  } else if (areaToExplore > 17) {
    targetSize = 8.5;
  }

  const splitAreas = (areaToExplore <= 17 ? coords : splitArea(swLat, swLon, neLat, neLon, targetSize)).map(String);
  const mixedAreas = [...splitAreas, coords.map(String).join(', ')];

  const segments = await fetchSegmentsForAreas(mixedAreas, accessToken)
    .then(allSegments => {
      const clearedSegments = allSegments.filter(segment => !!segment);
      const flattened = clearedSegments.flatMap(item => item.segments);

      const uniqueIds = new Set();
      return flattened.filter(segment => {
        if (uniqueIds.has(segment.id)) {
          return false;
        } else {
          uniqueIds.add(segment.id);
          return true;
        }
      });
    })
    .catch(error => {
      console.error("There was an error fetching the segments:", error);
      isError = true;
      throw error;
    })
    .finally(() => {
      if (isError) {
        return [];
      }
    });

  const segmentsParseDetailsPromises = segments.map(async (segment: any) => {
    try {
      const response = await fetch(`https://www.strava.com/segments/${segment.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const htmlContent = await response.text();
      const { segment: parsedSegment, athlete } = parseHTML(htmlContent);

      return {
        ...parsedSegment,
        athlete,
        legacySegment: segment
      };
    } catch (error) {
      console.error(`Error fetching or parsing segment ${segment.id}:`, error);
      return null;
    }
  });

  const segmentsParseResponses = await Promise.all(segmentsParseDetailsPromises);

  const filteredSegmentsParseResponses = segmentsParseResponses.filter((seg): seg is SegmentParseResponse => seg !== null && seg.legacySegment?.id !== undefined)
    .filter((seg) => !!seg.legacySegment.climb_category); // TODO: remove this filter when we will calculate VAM for all segments
  console.log('🚀 ~ segmentsParseResponses.filter((seg): seg is SegmentParseResponse => seg !== null && seg.legacySegment?.id !== undefined):', segmentsParseResponses.length, segmentsParseResponses)

  const segmentsVAMForTable = filteredSegmentsParseResponses.map((seg) => {

    return {
      id: seg.legacySegment.id,
      name: seg.legacySegment.name,
      category: seg.climbCategory || seg.legacySegment.climb_category,
      distance: seg.legacySegment.distance,
      averageGrade: seg.legacySegment.avg_grade,
      maximum_grade: 0,
      elevation_high: seg.segment?.highestElev || '0',
      elevation_low: seg.segment?.lowestElev || '0',
      elevationGain: seg.segment?.elevationGain || `${seg.legacySegment.elev_difference}` || '0', // elevation gain
      time: seg.athlete?.time || '0',
      kVAM: seg.athlete?.vam || 0,
      qVAM: 0,
    };
  });

  return segmentsVAMForTable;
};

async function fetchSegmentsForAreas(areas: string[], accessToken: string): Promise<any[]> {
  const strava = new (stravaApi.client as any)(accessToken);

  const fetchPromises = areas.map(async (area) => {
    try {
      const response = await new Promise((resolve, reject) => {
        strava.segments.explore({
          bounds: area,
          activity_type: 'riding',
          min_cat: 1,
          max_cat: 5,
        }, (err: any, payload: any) => {
          if (err) reject(err);
          else resolve(payload);
        });
      });

      return response;
    } catch (err: any) {
      if (err.message?.includes('Authorization Error') ||
        err.statusCode === 401 ||
        (err.message?.includes('access_token') && err.message?.includes('invalid'))) {
        throw err;
      }
      console.error(`Error fetching segments for area ${area}:`, err);
      return null;
    }
  });

  const results = await Promise.all(fetchPromises);
  console.log('🚀 ~ results:@@@@@', results.length, results)
  return results.filter(result => result !== null);
}

function calculateArea(coords: number[]): number {
  const [swLat, swLon, neLat, neLon] = coords;
  const width = Math.abs(neLon - swLon);
  const height = Math.abs(neLat - swLat);
  return width * height;
}

function splitArea(swLat: number, swLon: number, neLat: number, neLon: number, targetSize: number): number[][] {
  const width = Math.abs(neLon - swLon);
  const height = Math.abs(neLat - swLat);
  const numCols = Math.ceil(width / targetSize);
  const numRows = Math.ceil(height / targetSize);

  const areas: number[][] = [];
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const areaSwLat = swLat + (i * height) / numRows;
      const areaSwLon = swLon + (j * width) / numCols;
      const areaNeLat = Math.min(swLat + ((i + 1) * height) / numRows, neLat);
      const areaNeLon = Math.min(swLon + ((j + 1) * width) / numCols, neLon);
      areas.push([areaSwLat, areaSwLon, areaNeLat, areaNeLon]);
    }
  }

  return areas;
}