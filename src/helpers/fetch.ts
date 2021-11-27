// a bit of a hack until we only support ES Modules.
// at least this is the officially recommended hack
// https://github.com/node-fetch/node-fetch#commonjs
const fetch = (...args: any[]) =>
  import('node-fetch').then(({ default: module }: { default: any }) =>
    module(...args),
  );

export default fetch;
