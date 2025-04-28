# internetdata

![TypeScript logo but with blotter paper as the background](/media/ts-blotter.png)

## Installation

Want internet data in your TypeScript application? Just install it with npm.

```bash
$ npm i internetdata
```

Or add it with yarn.

```bash
$ yarn add internetdata
```

## Contents

* [Quickstart](#quickstart)
  * [Hacker News](#hacker-news)
  * [Interacting with LSD docs](#interacting-with-lsd-docs)
* [Codegen under the hood](#codegen-under-the-hood)
* [Working with the local browser](#working-with-a-local-browser)
  * [Google](#google)
  * [McMaster-Carr](#mcmaster-carr)
  * [Shopify](#shopify)
* [Imitating a skill](#imitating-a-skill)
* [Explanation plus using LSD end to end with the SDK](#using-lsd-end-to-end-with-the-sdk)
* [How much does this cost?](#how-much-does-this-cost)

## Quickstart

See the [`examples/`](https://github.com/lsd-so/internetdata/tree/main/examples) folder for complete code examples but shown below are the necessary pieces for getting started after [installing](#installation). This guide also assumes you've created an [API key](https://lsd.so/docs/database/connect/authenticating).

### Hacker News

1. Import the default export from `internetdata` as well as [zod](https://zod.dev/).

```typescript
import drop from 'internetdata';
import { z } from 'zod';
```

2. Call the [`tab(connectionConfiguration?: ConnectionConfiguration)`](https://github.com/lsd-so/internetdata/blob/main/src/index.ts#L252) method to get an LSD object then connect to our [postgres-compatible](https://lsd.so/docs/database/postgres/postgres-compatible) database to receive a promise for a trip.

```typescript
const lsd = await drop.tab();
const trip = await lsd.connect(); // Promise<Trip>
```

3. Declare the zod schema you're interested in getting data from the web back in.

```typescript
const hnSchema = z.array(z.object({
  post: z.string(),
  post_link: z.string(),
}));
```

Additionally, you can infer a strong type definition for the objects you're interested in.

```typescript
type HNType = z.infer<typeof hnSchema>
```

**Note:** If you're running into confusing Zod-related errors, see this [related guide](https://zod.dev/?id=writing-generic-functions) on working with generic functions and Zod.

4. Now you can effectively [pipeline](https://herecomesthemoon.net/2025/04/pipelining/) the web data you're looking to retrieve:

```typescript
const frontPage = await trip
    .navigate('https://news.ycombinator.com')
    .group('span.titleline')
    .select('a', 'post')
    .select('a@href', 'post_link')
    .extrapolate<HNType>(hnSchema);
```

Distilling this line by line:

TODO each daisy chained line

5. Now you have a strongly typed collection for the front page of Hacker News!

```typescript
console.log("What are the posts on the front page of HN?");
console.log(frontPage);
```

### Interacting with LSD docs

Here is where we do similar to above but with the click keyword to then select title at end

## Codegen under the hood

There may be times where you just want to refer to the thing without having to actually uncover what the thing technically is exactly. We currently have AI natively-embedded in the language for **SELECT** statements.

## Working with the local browser



## Imitating a skill

## Explanation plus using LSD end to end with the SDK

## How much does this cost?

We care about enabling and empowering developers to program the web they want to. In short, we're planning to be free as a developer-friendly [Wayback Machine](https://web.archive.org/) unless you're interested in receiving support or prioritization for working on specific features. Reach out to [Yev](mailto:yev@lsd.so) if this interests you.
