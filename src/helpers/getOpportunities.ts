// a bit of a hack until we only support ES Modules
// note the key here:
// https://github.com/microsoft/TypeScript/pull/44501#issue-914346744
export const loadReportUtils = async () => {
  const module = await import('lighthouse/report/renderer/report-utils.js');
  return module.ReportUtils;
};

// inspired by:
// https://github.com/GoogleChrome/lighthouse/blob/8100b8034507e679c95b2fab5ab48965875443b6/report/renderer/performance-category-renderer.js#L98
const getWastedMs = (audit: any) => {
  if (audit.result.details && audit.result.details.type === 'opportunity') {
    const details = audit.result.details;
    if (typeof details.overallSavingsMs !== 'number') {
      throw new Error('non-opportunity details passed to getWastedMs');
    }
    return details.overallSavingsMs;
  } else {
    return Number.MIN_VALUE;
  }
};

// inspired by:
// https://github.com/GoogleChrome/lighthouse/blob/2e9c3c9b5f7d75b39be9d1e2ba116d49cf811f81/lighthouse-core/report/html/renderer/performance-category-renderer.js#L224-L226
export default async (result: any) => {
  const ReportUtils = await loadReportUtils();
  return result.categories.performance.auditRefs
    .reduce((accumulator: any, audit: any) => {
      const auditResult = result.audits[audit.id];
      const detailsType = auditResult?.details?.type;
      if (
        detailsType !== 'opportunity' ||
        ReportUtils.showAsPassed(auditResult)
      ) {
        return accumulator;
      }

      return [
        ...accumulator,
        {
          ...audit,
          result: {
            ...auditResult,

            // "average" | "fail" | "pass" | ...
            rating: ReportUtils.calculateRating(
              auditResult.score,
              auditResult.scoreDisplayMode,
            ),
          },
        },
      ];
    }, [])
    .sort(
      (auditA: any, auditB: any) => getWastedMs(auditB) - getWastedMs(auditA),
    );
};
