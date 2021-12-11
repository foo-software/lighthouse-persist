import fs from 'fs';
import lighthouse from 'lighthouse';
import LighthouseResultInterface from 'lighthouse/types/lhr/lhr';
import * as chromeLauncher from 'chrome-launcher';
import AWS from 'aws-sdk';
import ReportGenerator from 'lighthouse/report/generator/report-generator';
import config from './config';
import defaultOptions from './options';
import upload from './helpers/upload';
import getOpportunities from './helpers/getOpportunities';
import getPageSpeedInsightsApiResult from './helpers/getPageSpeedInsightsApiResult';

const PROTOCOL_TIMEOUT = 'PROTOCOL_TIMEOUT';

const createTimeout = (time: number) =>
  new Promise(resolve => {
    setTimeout(resolve, time, PROTOCOL_TIMEOUT);
  });

export { ReportGenerator };

interface OpportunitiesInterface {
  id: string;
  result: {
    description: string;
    details: {
      headings: {
        key: string;
        label: string;
        valueType: string;
      }[];
      items: {
        fromProtocol: boolean;
        isCrossOrigin: boolean;
        node: any;
        totalBytes: number;
        url: string;
        wastedBytes: number;
        wastedWebpBytes: number;
      }[];
      overallSavingsMs: number;
      overallSavingsBytes: number;
      type: string;
    };
    displayValue: string;
    id: string;
    numericUnit: string;
    numericValue: number;
    rating: string;
    score: number;
    scoreDisplayMode: string;
    title: string;
    warnings: string[];
  };
  weight: number;
}

interface LoadingExperienceMetricInterface {
  percentile: number;
  distributions: {
    max: number;
    min: number;
    proportion: number;
  }[];
  category: string;
}

interface LoadingExperienceInterface {
  id: string;
  initial_url: string;
  metrics: {
    CUMULATIVE_LAYOUT_SHIFT_SCORE: LoadingExperienceMetricInterface;
    FIRST_CONTENTFUL_PAINT_MS: LoadingExperienceMetricInterface;
    FIRST_INPUT_DELAY_MS: LoadingExperienceMetricInterface;
    LARGEST_CONTENTFUL_PAINT_MS: LoadingExperienceMetricInterface;
  };
  overall_category: string;
}

interface LighthousePersistResultInterface {
  finalScreenshot?: string;
  loadingExperience?: LoadingExperienceInterface;
  localReport?: string;
  originLoadingExperience?: LoadingExperienceInterface;
  result: LighthouseResultInterface;
  report?: string;
  opportunities?: OpportunitiesInterface[];
}

// https://github.com/GoogleChrome/lighthouse/blob/master/docs/readme.md#using-programmatically
export default async ({
  awsAccessKeyId: accessKeyId,
  awsBucket: Bucket,
  awsRegion: region,
  awsSecretAccessKey: secretAccessKey,
  config: customConfig,
  finalScreenshotAwsBucket,
  isExperimental,
  launchedChrome,
  options: customOptions,
  outputDirectory,
  updateReport,
  psiKey,
  timeout,
  url,
}: {
  awsAccessKeyId?: string;
  awsBucket?: string;
  awsRegion?: string;
  awsSecretAccessKey?: string;
  config?: any;
  finalScreenshotAwsBucket?: string;
  isExperimental?: boolean;
  launchedChrome?: any;
  options?: any;
  outputDirectory?: string;
  updateReport?: (input: any) => void;
  psiKey?: string;
  timeout?: number;
  url: string;
}): Promise<LighthousePersistResultInterface> => {
  // will upload to S3?
  const isS3 = !!(accessKeyId && region && secretAccessKey);

  // if a URL, output directory, or S3 creds are missing - we got a problem.
  if (!outputDirectory && !url && !isS3) {
    throw new Error('Missing required params.');
  }

  // the default config combined with overriding query params
  const fullConfig = {
    ...config,
    ...customConfig,
  };

  const options = {
    ...defaultOptions,
    ...customOptions,
  };

  // we need to kill chrome if something goes wrong, so we pull it up
  // into the function scope to be accessible in the catch block.
  let chrome = launchedChrome;

  try {
    let results;
    let loadingExperience;
    let originLoadingExperience;

    // this changed in Lighthouse 7, but we should try to support those
    // who don't know about this obscure change.
    const formFactor =
      fullConfig.settings.formFactor || fullConfig.settings.emulatedFormFactor;

    // if we're getting results from the PageSpeed Insights API... else
    // run Lighthouse directly
    if (psiKey) {
      const strategy = formFactor === 'desktop' ? 'DESKTOP' : 'MOBILE';
      const psiResults = await getPageSpeedInsightsApiResult({
        psiKey,
        strategy,
        url,
      });

      if (psiResults.error) {
        throw Error(psiResults.error.message);
      }

      results = {
        lhr: psiResults.lighthouseResult,
        report: ReportGenerator.generateReportHtml(psiResults.lighthouseResult),
      };

      if (psiResults.loadingExperience) {
        loadingExperience = psiResults.loadingExperience;
      }

      if (psiResults.originLoadingExperience) {
        originLoadingExperience = psiResults.originLoadingExperience;
      }
    } else {
      if (!chrome) {
        chrome = await chromeLauncher.launch({
          chromeFlags: options.chromeFlags,
          port: options.port,
        });
      }

      options.output = 'html';

      results = !timeout
        ? await lighthouse(url, options, fullConfig)
        : await Promise.race([
            createTimeout(timeout),
            lighthouse(url, options, fullConfig),
          ]);

      if (results === PROTOCOL_TIMEOUT) {
        throw Error(PROTOCOL_TIMEOUT);
      }

      await chrome.kill();
    }

    // a remote URL
    let report;

    // a local file path
    let localReport;

    // the final thumbnail image
    let finalScreenshot;

    const reportContent = !updateReport
      ? results.report
      : updateReport(results.report);

    if (isS3) {
      if (Bucket && reportContent) {
        // upload to S3
        const s3Response = await upload({
          s3bucket: new AWS.S3({
            accessKeyId,
            region,
            secretAccessKey,
          }),
          params: {
            ACL: 'public-read',
            Body: reportContent,
            Bucket,
            ContentType: 'text/html',
            Key: `report-${Date.now()}.html`,
          },
        });

        report = s3Response?.Location;
      }

      if (finalScreenshotAwsBucket) {
        const finalScreenshotData =
          results?.lhr?.audits?.['final-screenshot']?.details?.data;

        if (finalScreenshotData) {
          const buffer = Buffer.from(
            finalScreenshotData.replace('data:image/jpeg;base64,', ''),
            'base64',
          );
          const s3Response = await upload({
            s3bucket: new AWS.S3({
              accessKeyId,
              region,
              secretAccessKey,
            }),
            params: {
              ACL: 'public-read',
              Body: buffer,
              Bucket: finalScreenshotAwsBucket,
              ContentEncoding: 'base64',
              ContentType: 'image/jpeg',
              Key: `final-screenshot-${Date.now()}.jpg`,
            },
          });
          finalScreenshot = s3Response.Location;
        }
      }
    }

    if (outputDirectory) {
      localReport = `${outputDirectory}/report-${Date.now()}.html`;
      fs.writeFileSync(localReport, reportContent);
    }

    const parsedResult = JSON.parse(JSON.stringify(results.lhr));

    let opportunities = [];
    if (isExperimental && parsedResult?.categories?.performance?.auditRefs) {
      try {
        opportunities = await getOpportunities(parsedResult);
      } catch (error) {
        console.error(error);
      }
    }

    return {
      finalScreenshot,
      loadingExperience,
      localReport,
      originLoadingExperience,
      result: parsedResult,
      report,

      // experimental features
      ...(!isExperimental
        ? {}
        : {
            opportunities,
          }),
    };
  } catch (error) {
    // make sure we kill chrome
    if (chrome) {
      await chrome.kill();
    }

    throw error;
  }
};
