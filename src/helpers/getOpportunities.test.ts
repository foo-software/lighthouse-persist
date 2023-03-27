import { loadReportUtils } from './getOpportunities';

describe('ReportUtils', () => {
  it('ReportUtils.calculateRating should be a function', async () => {
    const ReportUtils = await loadReportUtils();
    expect(typeof ReportUtils.calculateRating).toBe('function');
  });
  it('ReportUtils.showAsPassed should be a function', async () => {
    const ReportUtils = await loadReportUtils();
    expect(typeof ReportUtils.showAsPassed).toBe('function');
  });
});
