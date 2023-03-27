import loadLighthouse from './loadLighthouse';

describe('loadLighthouse', () => {
  it('should load lighthouse', async () => {
    const lighthouse = await loadLighthouse();
    expect(typeof lighthouse).toBe('function');
  });
});
