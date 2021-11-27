// https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html#upload-property
export default ({
  params,
  s3bucket,
}: {
  params: any;
  s3bucket: any;
}): Promise<any> =>
  new Promise((resolve, reject) => {
    s3bucket.upload(params, (error: any, data: any) => {
      if (!error) {
        resolve(data);
      } else {
        reject(error);
      }
    });
  });
