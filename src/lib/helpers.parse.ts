import { JSDOM } from 'jsdom';
import type { Athlete, SegmentDetails } from '../routes/api/fetchSegments/types';


export function parseHTML(htmlContent: string): { segment: SegmentDetails | null, athlete: Athlete | null } {
  const dom = new JSDOM(htmlContent);
  const doc = dom.window.document;

  // Extract Segment Details
  const segmentName = doc.querySelector('#js-full-name')?.textContent?.trim() || '';
  const stats = Array.from(doc.querySelectorAll('.list-stats .stat')).map((stat: Element) => {
    const matches = stat.textContent?.trim().match(/(\d[\d,.]*\s*\w*)/);
    return matches ? matches[0] : '';
  });

  const segment: SegmentDetails = {
    name: segmentName,
    distance: stats[0] || '',
    elevationGain: stats[1] || '',
    avgGrade: stats[2] || '',
    lowestElev: stats[3] || '',
    highestElev: stats[4] || '',
    elevDifference: stats[5] || '',
    climbCategory: stats[6] || '',
    attempts: stats[7] || ''
  };
  console.log('🚀 ~ segment:', segment)

  // Extract First Athlete Data
  const firstRow = doc.querySelector('table.table-leaderboard tbody tr');
  console.log('🚀 ~ firstRow:', firstRow);
  const athlete: Athlete | null = firstRow ? {
    rank: parseInt(firstRow.querySelector('td:nth-child(1)')?.textContent?.trim() || '0', 10),
    name: firstRow.querySelector('td:nth-child(2) a')?.textContent?.trim() || '',
    speed: firstRow.querySelector('td:nth-child(3)')?.textContent?.trim() || '',
    power: firstRow.querySelector('td:nth-child(4)')?.textContent?.trim() || '',
    vam: parseInt(firstRow.querySelector('td:nth-child(5)')?.textContent?.trim() || '0', 10),
    time: firstRow.querySelector('td:nth-child(6)')?.textContent?.trim() || ''
  } : null;
  console.log('🚀 ~ athlete:!!!!!', athlete)

  return { segment, athlete };
}

// function getElementTextContent(doc: Document, selector: string): string {
//   const element = doc.querySelector(selector);
//   return element ? element.textContent?.trim() || '' : '';
// }

// function calculateVAM(doc: Document): number {
//   const elevationGain = parseFloat(getElementTextContent(doc, '.elevation-chart .imperial .elevation-data span:nth-child(3)'));
//   const time = parseFloat(getElementTextContent(doc, '.personal-record time'));

//   if (elevationGain && time) {
//     return (elevationGain * 60) / (time / 60);
//   }
//   return 0;
// }