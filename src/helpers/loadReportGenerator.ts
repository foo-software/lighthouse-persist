// a bit of a hack until we only support ES Modules
// note the key here:
// https://github.com/microsoft/TypeScript/pull/44501#issue-914346744
const loadReportGenerator = async () => {
  const module = await import(
    'lighthouse/report/generator/report-generator.js'
  );
  return module.ReportGenerator;
};

export default loadReportGenerator;
