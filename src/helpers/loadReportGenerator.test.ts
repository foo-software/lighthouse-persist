import loadReportGenerator from './loadReportGenerator';

describe('loadReportGenerator', () => {
  it('should load ReportGenerator', async () => {
    const ReportGenerator = await loadReportGenerator();
    expect(typeof ReportGenerator.generateReportHtml).toBe('function');
  });
});
