import { JSDOM } from 'jsdom';

export function parseHTML(htmlContent: string) {
  const dom = new JSDOM(htmlContent);
  const doc = dom.window.document;

  return {
    elevation_high: getElementTextContent(doc, '.elevation-chart .imperial .elevation-data span:nth-child(1)'),
    elevation_low: getElementTextContent(doc, '.elevation-chart .imperial .elevation-data span:nth-child(2)'),
    elevationGain: getElementTextContent(doc, '.elevation-chart .imperial .elevation-data span:nth-child(3)'),
    maximum_grade: getElementTextContent(doc, '.grade-chart .imperial .grade-data span:nth-child(1)'),
    athlete_segment_stats: {
      pr_elapsed_time: getElementTextContent(doc, '.personal-record time')
    },
    vam: calculateVAM(doc)
  };
}

function getElementTextContent(doc: Document, selector: string): string {
  const element = doc.querySelector(selector);
  return element ? element.textContent?.trim() || '' : '';
}

function calculateVAM(doc: Document): number {
  const elevationGain = parseFloat(getElementTextContent(doc, '.elevation-chart .imperial .elevation-data span:nth-child(3)'));
  const time = parseFloat(getElementTextContent(doc, '.personal-record time'));

  if (elevationGain && time) {
    return (elevationGain * 60) / (time / 60);
  }
  return 0;
}