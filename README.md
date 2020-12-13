# `@foo-software/lighthouse-persist`

> A tool for persisting Lighthouse audit results for website monitoring and analysis. Performance, SEO, progressive web app, best practices are exposed in a results object and included in an HTML report. Save reports locally or upload to your AWS S3 bucket.

<img src="https://s3.amazonaws.com/foo.software/images/marketing/screenshots/lighthouse-audit-report.png" />

See a full [example report here](https://s3.amazonaws.com/foo-software-html/lighthouse-report-example.html). This HTML report is generated by `lighthouse`.

## What it Does

- Defines the `output` [option](https://github.com/GoogleChrome/lighthouse#cli-options) as `html`.
- Runs all Lighthouse audits - Performance, SEO, progressive web app, best practices. Parameters support custom Lighthouse options and configuration.
- Extracts content of the HTML report, populates it in a file and saves locally and / or uploads to the AWS S3 bucket specified by parameters.
- Exposes the result similar to that of using `lighthouse` directly.
- Uses `lighthouse@5.1.0` under the hood.

## Install

```bash
npm install @foo-software/lighthouse-persist
```

## Usage

Below are a few standard ways of using this module. See [parametes](#parameters) and [response payload](#response-payload) for more details.

## Save Report to Local Directory.

```javascript
const path = require('path');
const lighthousePersist = require('@foo-software/lighthouse-persist').default;

(async () => {
  const { localReport, result } = await lighthousePersist({
    url: 'https://www.foo.software',

    // example if you have an "artifacts" directory in your root directory
    outputDirectory: path.resolve('./artifacts')
  });

  console.log({ localReport, result });
})();
```

## Upload Report to S3

```javascript
const lighthousePersist = require('@foo-software/lighthouse-persist').default;

(async () => {
  const { report, result } = await lighthousePersist({
    url: 'https://www.foo.software',
    awsAccessKeyId: 'abc123',
    awsBucket: 'myBucket',
    awsRegion: 'us-east-1',
    awsSecretAccessKey: 'def456'
  });

  console.log({ report, result });
})();
```

## Run Lighthouse with PageSpeed Insights API

There are a few benefits of running Lighthouse via [PageSpeed Insights API](https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed).

1. Offload resource consumption to Google 🙌! If you haven't noticed [Lighthouse memory and CPU consumption is expensive](https://github.com/GoogleChrome/lighthouse/issues/11343).
2. Get consistent results by running Lighthouse in a stable, consistent environment.
3. Get additional data like `loadingExperience` and `originLoadingExperience` from the [CrUX API](https://web.dev/chrome-ux-report-api/) (under the hood).

The downside is that you won't have all the configuration options by not using Lighthouse directly, like specific network settings and `extraHeaders`. But in most cases, the default settings are all you need. You can still target `mobile` or `desktop` via `strategy`. If using `@foo-software/lighthouse-persist` `strategy` will be derived from `config.settings.emulatedFormFactor` and defaults to `mobile`.

This module will get results from PageSpeed Insights API, and generate an HTML (optionally), and provide the result consistently with the other examples. The only mandatory parameter to run with PageSpeed Insights API is `psiKey`.

```javascript
const lighthousePersist = require('@foo-software/lighthouse-persist').default;

(async () => {
  const { report, result } = await lighthousePersist({
    url: 'https://www.foo.software',
    awsAccessKeyId: 'abc123',
    awsBucket: 'myBucket',
    awsRegion: 'us-east-1',
    awsSecretAccessKey: 'def456',
    psiKey: 'ghi789',
  });

  console.log({ loadingExperience, report, result });
})();
```

## Parameters

There are two different ways to persist reports. Both ways have required params. Using both is also supported. The `url` param is required always.

1. Saving reports in a local directory requires the `outputDirectory` param.
2. Uploading reports to S3 requires `awsAccessKeyId`, `awsBucket`, `awsRegion`, and `awsSecretAccessKey` params.

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><code>awsAccessKeyId</code></td>
    <td>The AWS <code>accessKeyId</code> for an S3 bucket.</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <td><code>awsBucket</code></td>
    <td>The AWS <code>Bucket</code> for an S3 bucket.</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <td><code>awsRegion</code></td>
    <td>The AWS <code>region</code> for an S3 bucket.</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <td><code>awsSecretAccessKey</code></td>
    <td>The AWS <code>secretAccessKey</code> for an S3 bucket.</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <td><code>config</code></td>
    <td>The <a href="https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md">Lighthouse configuration</a>.</td>
    <td><code>object</code></td>
    <td>The default config should align with Chrome DevTools. See the <a href="src/config.js">exact default config here</a> or <a href="src/__snapshots__/config.test.js.snap">snapshot here</a>.</td>
  </tr>
  <tr>
    <td><code>finalScreenshotAwsBucket</code></td>
    <td>The AWS <code>Bucket</code> for an S3 bucket. If this is defined, the final screenshot will be uploaded here</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <td><code>options</code></td>
    <td>The <a href="https://github.com/GoogleChrome/lighthouse/tree/master/docs#differences-from-cli-flags">Lighthouse programmatic options</a>, similar to the CLI.</td>
    <td><code>object</code></td>
    <td>See the <a href="src/options.js">exact default options here</a> or <a href="src/__snapshots__/options.test.js.snap">snapshot here</a>.</td>
  </tr>
  <tr>
    <td><code>outputDirectory</code></td>
    <td>An absolute directory path to output report. You can do this an an alternative or combined with an S3 upload.</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <td><code>psiKey</code></td>
    <td>To run Lighthouse via PageSpeed Insights API, provide your API key. <strong>WARNING</strong>: some Lighthouse options are not available with PageSpeed Insights (example: <code>extraHeaders</code>). <code>strategy</code> will be derived from <code>config.settings.emulatedFormFactor</code> and defaults to <code>mobile</code>.</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
  <tr>
    <td><code>url</code></td>
    <td>The URL to run audits against.</td>
    <td><code>string</code></td>
    <td><code>undefined</code></td>
  </tr>
</table>

## Response Payload

The result of calling the default function with the parameters above is an object with the below properties.

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
  </tr>
  <tr>
    <td><code>finalScreenshot</code></td>
    <td>A URL to the final screenshot image. This will only be defined if <code>finalScreenshotAwsBucket</code> parameter was.</td>
    <td><code>string</code></td>
  </tr>
  <tr>
    <td><code>loadingExperience</code></td>
    <td>If <code>psiKey</code> was specified and the PageSpeed Insights response includes <code>loadingExperience</code> as documented, then this will be populated with an object per the shape described in the <a href="https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed#response-body">documentation</a>. It's possible this data will not exist for some URLs. Read more about the <a href="https://web.dev/chrome-ux-report-api/">CrUX API</a>.</td>
    <td><code>object</code></td>
  </tr>
  <tr>
    <td><code>localReport</code></td>
    <td>A local path to the report (if applicable).</td>
    <td><code>string</code></td>
  </tr>
  <tr>
    <td><code>result</code></td>
    <td>A comprehensive result - the equivalent of what is returned when using the <code>lighthouse</code> module directly.</td>
    <td><code>object</code></td>
  </tr>
  <tr>
    <td><code>originLoadingExperience</code></td>
    <td>If <code>psiKey</code> was specified and the PageSpeed Insights response includes <code>originLoadingExperience</code> as documented, then this will be populated with an object per the shape described in the <a href="https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed#response-body">documentation</a>. It's possible this data will not exist for some URLs. Read more about the <a href="https://web.dev/chrome-ux-report-api/">CrUX API</a>.</td>
    <td><code>object</code></td>
  </tr>
  <tr>
    <td><code>report</code></td>
    <td>A URL to the report HTML file.</td>
    <td><code>string</code></td>
  </tr>
</table>

## Taking it to Another Level

If you're interested running Lighthouse performance audits on your web pages automatically - check out [www.foo.software](https://www.foo.software). Foo runs audits automatically, stores results and provides charts in a timeline view. You can also trigger runs via Foo's public REST API and tag (with a build number for example). See [video demos about all of this here](https://www.foo.software/videos).

## Credits

> <img src="https://s3.amazonaws.com/foo.software/images/logo-200x200.png" width="100" height="100" align="left" /> This package was brought to you by [Foo - a website performance monitoring tool](https://www.foo.software). Create a **free account** with standard performance testing. Automatic website performance testing, uptime checks, charts showing performance metrics by day, month, and year. Foo also provides real time notifications when performance and uptime notifications when changes are detected. Users can integrate email, Slack and PagerDuty notifications.
