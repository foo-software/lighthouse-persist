# `@foo-software/lighthouse-persist`

> A tool for persisting Lighthouse audit results for website monitoring and analysis. Performance, SEO, progressive web app, best practices are exposed in a results object and included in an HTML view, uploaded to your S3 account.

Lighthouse Persist uses `lighthouse@5.1.0` under the hood.

## Usage

```javascript
import lighthousePersist from 'lighthouse-persist';

const { report, result } = await lighthousePersist({
  url: 'https://www.foo.software',
  awsAccessKeyId: 'abc123',
  awsBucket: 'myBucket',
  awsRegion: 'us-east-1',
  awsSecretAccessKey: 'def456',
});
```

See [Response Payload](#response-payload) to find out what `report` and `result` are.

## Parameters

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Type</th>
    <th>Default</th>
  </tr>
  <tr>
    <td><code>awsAccessKeyId</code></td>
    <td>The AWS <code>accessKeyId</code> for an S3 account.</td>
    <td><code>string</code></td>
    <td><code>--</code></td>
  </tr>
  <tr>
    <td><code>awsBucket</code></td>
    <td>The AWS <code>Bucket</code> for an S3 account.</td>
    <td><code>string</code></td>
    <td><code>--</code></td>
  </tr>
  <tr>
    <td><code>awsRegion</code></td>
    <td>The AWS <code>region</code> for an S3 account.</td>
    <td><code>string</code></td>
    <td><code>--</code></td>
  </tr>
  <tr>
    <td><code>awsSecretAccessKey</code></td>
    <td>The AWS <code>secretAccessKey</code> for an S3 account.</td>
    <td><code>string</code></td>
    <td><code>--</code></td>
  </tr>
  <tr>
    <td><code>config</code></td>
    <td>The <a href="https://github.com/GoogleChrome/lighthouse/blob/master/docs/configuration.md">Lighthouse configuration</a>.</td>
    <td><code>object</code></td>
    <td>The default config should align with Chrome DevTools. See the <a href="src/config.js">exact default config here</a>.</td>
  </tr>
  <tr>
    <td><code>options</code></td>
    <td>The AWS <code>accessKeyId</code> for an S3 account.</td>
    <td><code>object</code></td>
    <td>See the <a href="src/options.js">exact default options here</a>.</td>
  </tr>
  <tr>
    <td><code>url</code></td>
    <td>The URL to run audits against.</td>
    <td><code>string</code></td>
    <td><code>--</code></td>
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
    <td><code>result</code></td>
    <td>A comprehensive result - the equivalent of what is returned when using the `lighthouse` module directly.</td>
    <td><code>object</code></td>
  </tr>
  <tr>
    <td><code>report</code></td>
    <td>A URL to the report HTML file.</td>
    <td><code>string</code></td>
  </tr>
</table>

## Credits

> <img src="https://s3.amazonaws.com/foo.software/images/logo-200x200.png" width="100" height="100" align="left" /> This package was brought to you by [Foo - a website performance monitoring tool](https://www.foo.software). Create a **free account** with standard performance testing. Automatic website performance testing, uptime checks, charts showing performance metrics by day, month, and year. Foo also provides real time notifications when performance and uptime notifications when changes are detected. Users can integrate email, Slack and PagerDuty notifications.
