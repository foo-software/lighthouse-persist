import upload from './upload';

describe('upload', () => {
  const params = {
    hello: 'world',
  };

  it('should resolve when data exists', async () => {
    const data = { data: true };
    const response = await upload({
      params,
      s3bucket: {
        upload: (params: any, callback: any) => {
          callback(null, data);
        },
      },
    });

    expect(response).toEqual(data);
  });

  it('should reject when error exists', async () => {
    const rejectionError = Error('something went wrong');
    await expect(
      upload({
        params,
        s3bucket: {
          upload: (params: any, callback: any) => {
            callback(rejectionError, null);
          },
        },
      }),
    ).rejects.toThrow('something went wrong');
  });
});
