// a bit of a hack until we only support ES Modules.
export const chromeLauncher = (...args: any[]) =>
  import('chrome-launcher').then(({ launch: module }: { launch: any }) =>
    module(...args),
  );
