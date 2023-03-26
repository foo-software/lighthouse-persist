// a bit of a hack until we only support ES Modules
// note the key here:
// https://github.com/microsoft/TypeScript/pull/44501#issue-914346744
const loadLighthouse = async () => {
  const module = await import('lighthouse');
  return module.default;
};

export default loadLighthouse;
