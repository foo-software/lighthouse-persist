import { loadUtil } from './getOpportunities';

describe('Util', () => {
  it('Util.calculateRating should be a function', async () => {
    const Util = await loadUtil();
    expect(typeof Util.calculateRating).toBe('function');
  });
  it('Util.showAsPassed should be a function', async () => {
    const Util = await loadUtil();
    expect(typeof Util.showAsPassed).toBe('function');
  });
});
