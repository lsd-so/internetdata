# internetdata

![TypeScript logo but with blotter paper as the background](https://pub-662d5a25493347a99b839351ec266583.r2.dev/ts-blotter.png)

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

- [Quickstart](#quickstart)
  - [Hacker News](#hacker-news)
  - [Interacting with LSD docs](#interacting-with-lsd-docs)
- [Codegen under the hood](#codegen-under-the-hood)
- [Working with the local browser](#working-with-a-local-browser)
  - [Google](#google)
  - [McMaster-Carr](#mcmaster-carr)
- [Imitating a trip](#imitating-a-trip)
- [How much does this cost?](#how-much-does-this-cost)

**Important:** See the [`examples/`](https://github.com/lsd-so/internetdata/tree/main/examples) folder for complete code examples.

## Quickstart

Shown below are the necessary pieces for getting started after [installing](#installation). The guide also assumes you've created an [API key](https://lsd.so/docs/database/connect/authenticating).

**Note:** You must use either the API key provided to the [local browser](https://lsd.so/bicycle) after logging in or create one on your profile after you've logged into the browser. This is so we're able to correlate the correct browser to be facilitating instructions on. If you're still running into problems, feel free to schedule a [call](https://cal.com/yev-barkalov-m19qqp/).
).

### Hacker News

Go [here](https://github.com/lsd-so/internetdata/tree/main/examples/hn) for the full code example.

1. Import the default export from `internetdata` as well as [zod](https://zod.dev/).

```typescript
import drop from "internetdata";
import { z } from "zod";
```

2. Call the [`tab(connectionConfiguration?: ConnectionConfiguration)`](https://github.com/lsd-so/internetdata/blob/main/src/index.ts#L252) method to get a Promise for a trip.

```typescript
const trip = await drop.tab(); // Promise<Trip>
```

**Note:** The code snippet above assumes you've saved the username and API key to the `LSD_USER` and `LSD_PASSWORD` environment variables respectively. If you'd like to pass in a connection configuration object you can do so like below:

```typescript
const lsd = await drop.tab({
  user: "your@email.com",
  password: "<api key>",
}); // Promise<Trip>
```

3. Declare the zod schema you're interested in getting data from the web back in.

```typescript
const hnSchema = z.array(
  z.object({
    post: z.string(),
  }),
);
```

Additionally, you can infer a strong type definition for the objects you're interested in.

```typescript
type HNType = typeof hnSchema;
```

**Note:** If you're running into confusing Zod-related errors, see this [related guide](https://zod.dev/?id=writing-generic-functions) on working with generic functions and Zod.

4. Now you can effectively [pipeline](https://herecomesthemoon.net/2025/04/pipelining/) the web data you're looking to retrieve:

```typescript
const frontPage = await trip
  .navigate("https://news.ycombinator.com")
  .group("span.titleline")
  .select("a@href", "post")
  .extrapolate<HNType>(hnSchema);
```

Breaking this down line by line:

At the end when we call `extrapolate` we will be working with a promise for the results hence `await`ing here.

```typescript
const frontPage = await trip;
```

The URL we're interested in retrieving data from is [https://news.ycombinator.com](https://news.ycombinator.com).

```typescript
    .navigate('https://news.ycombinator.com')
```

On the page there is a repeating container for each post that can be matched with the CSS selector `span.titleline`.

```typescript
    .group('span.titleline')
```

The href [attribute](https://lsd.so/docs/database/language/attributes) is what we'd understand as being the "post".

```typescript
    .select('a@href', 'post_link')
```

Then finally we're going to extrapolate the object or list of objects from the trip.

```typescript
    .extrapolate<HNType>(hnSchema);
```

5. Now you have a strongly typed collection for the front page of Hacker News!

```typescript
console.log("What are the posts on the front page of HN?");
console.log(frontPage);
```

### Interacting with LSD docs

Go [here](https://github.com/lsd-so/internetdata/tree/main/examples/lsd_docs) for the full code example.

1. Like with [Hacker News](#hacker-news), import the default export from `internetdata` as well as [zod](https://zod.dev/).

```typescript
import drop from "internetdata";
import { z } from "zod";
```

2. Call the [`tab(connectionConfiguration?: ConnectionConfiguration)`](https://github.com/lsd-so/internetdata/blob/main/src/index.ts#L252) method to get a promise for a trip.

```typescript
const trip = await drop.tab(); // Promise<Trip>
```

**Note:** The code snippet above assumes you've saved the username and API key to the `LSD_USER` and `LSD_PASSWORD` environment variables respectively. If you'd like to pass in a connection configuration object you can do so like below:

```typescript
const trip = await drop.tab({
  user: "your@email.com",
  password: "<api key>",
}); // Promise<Trip>
```

3. Declare the zod schema you're interested in getting data from the web back in.

```typescript
const docsSchema = z.array(
  z.object({
    title: z.string(),
  }),
);
```

4. Now you can effectively [pipeline](https://herecomesthemoon.net/2025/04/pipelining/) the web data you're looking to retrieve:

```typescript
const docsTitle = await trip
  .on("TRAVERSER")
  .navigate(`https://lsd.so/docs`)
  .click('a[href="/docs/database"]')
  .select("title")
  .extrapolate<typeof docsSchema>(docsSchema);
```

Curious [what the "Traverser" means?](https://lsd.so/docs/internet/traverser)

5. Now you have a strongly typed collection for the title of the docs page!

```typescript
console.log("What is the tile of the database docs page?");
console.log(docsTitle);
```

## Codegen under the hood

There may be times where you just want to refer to the thing without having to actually uncover what the thing technically is exactly. We currently have AI natively embedded in the language for **SELECT** statements.

See the [Lobsters codegen example](https://github.com/lsd-so/internetdata/tree/main/examples/lobsters_codegen) for the full code example.

```typescript
const trip = await drop.tab();

const lobstersSchema = z.array(
  z.object({
    author: z.string(),
  }),
);

const authors = await trip
  .on("BROWSER")
  .navigate("https://lobste.rs")
  .group("ol.stories li")
  .select("author")
  .extrapolate<typeof lobstersSchema>(lobstersSchema);

console.log("Who are the authors on the front page of Lobsters?");
console.log(authors);
```

Most of the above code matches what you'll find in the other tutorials within this README except for the `.select()` call:

```typescript
  .select("author")
```

As you may notice, the word "author" is not a valid CSS selector but the program still comes out in the end with the requested data. This is due to two ingredients: the page HTML is accessible (by default LSD will not attempt to retrieve a page HTML solely for fulfilling an invalid selector). And, two, the page HTML's available at the step of selecting "author" because it was channeled through the local browser.

If you were to request data through a cloud browser and _then_ attempt to codegen a CSS selector like above, it'd then work thanks to the default 15 minute cache.

## Working with the local browser

There are a variety of reasons why you'd be interested in working with a local browser however this can be best understood as covering that "last mile" of web scraping thanks to the [LSD language](https://lsd.so/docs/database/language) being accomodating of both headless cloud browsers as well as [our own local "Bicycle" browser](https://lsd.so/bicycle).

After you've downloaded and logged in with the same account you created an API key for, all that's needed is to indicate you're interested in tripping `.on()` the `"BROWSER"`.

### Google

A while back we incorporated [local browser control](https://x.com/itisyev/status/1848810470364397604) into the LSD language, here's how that looks using the SDK.

1. Import the default export from `internetdata` as well as [zod](https://zod.dev/).

```typescript
import drop from "internetdata";
import { z } from "zod";
```

2. Call the [`tab(connectionConfiguration?: ConnectionConfiguration)`](https://github.com/lsd-so/internetdata/blob/main/src/index.ts#L252) method to get a Promise for a trip.

```typescript
const trip = await drop.tab(); // Promise<Trip>
```

3. Declare the zod schema you're interested in getting data from the web back in.

```typescript
const googleSchema = z.array(
  z.object({
    result: z.string(),
  }),
);

type GoogleType = typeof googleSchema;
```

4. Now you can effectively [pipeline](https://herecomesthemoon.net/2025/04/pipelining/) the web data you're looking to retrieve:

```typescript
const googleResults = await trip
  .on("BROWSER")
  .navigate(`https://www.google.com/search?q=what+is+lsd.so%3F`)
  .group("div#search a")
  .select("div#search a@href", "result")
  .extrapolate<GoogleType>(googleSchema);
```

5. Now you have a strongly typed collection for the title of the docs page!

```typescript
console.log("What is LSD.so according to Google?");
console.log(googleResults);
```

### McMaster-Carr

1. Import the default export from `internetdata` as well as [zod](https://zod.dev/).

```typescript
import drop from "internetdata";
import { z } from "zod";
```

2. Call the [`tab(connectionConfiguration?: ConnectionConfiguration)`](https://github.com/lsd-so/internetdata/blob/main/src/index.ts#L252) method to get a Promise for a trip.

```typescript
const trip = await drop.tab(); // Promise<Trip>
```

3. Declare the zod schema you're interested in getting data from the web back in.

```typescript
const mcmasterSchema = z.array(
  z.object({
    name_of_screw: z.string(),
  }),
);
```

4. 4. Now you can effectively [pipeline](https://herecomesthemoon.net/2025/04/pipelining/) the web data you're looking to retrieve:

```typescript
const screwResults = await trip
  .on("BROWSER")
  .navigate(`https://www.mcmaster.com/products/screws/`)
  .group('div[class*="TileLayout_textContainer"]')
  .select('div[class*="TileLayout_titleContainer"]', "name_of_screw")
  .extrapolate<McMasterType>(mcmasterSchema);
```

5. Now you have a strongly typed collection for the names of screws on McMaster-Carr!

```typescript
console.log("What screws are available on McMaster Carr?");
console.log(screwResults);
```

## Imitating a trip

There may be [flows that are accomplishable](https://lsd.so/docs/database/language/functions) in [the LSD language](https://lsd.so/docs/database/language/types/keywords/dive) that are not yet accomplishable via the SDK, for these scenarios we allow you to "imitate" the [trip that was defined before you](https://lsd.so/docs/database/trips).

For example, the trip `yev/hacker_news` has the following definition:

```
hn <| https://news.ycombinator.com/ |
container <| span.titleline |
post <| a |
post_link <| post@href |

front_page_of_hn <|> <|
FROM hn
|> GROUP BY container
|> SELECT post, post_link |

front_page_of_hn
```

Therefore, we can define the following Zod schema:

```typescript
const hnSchema = z.array(
  z.object({
    post: z.string(),
    post_link: z.string(),
  }),
);
```

And then imitate the trip detailed above:

```typescript
const frontPage = await trip
  .imitate("yev/hacker_news")
  .extrapolate<typeof hnSchema>(hnSchema);

console.log("What are the posts on the front page of HN?");
console.log(frontPage);
```

## How much does this cost?

We care about enabling and empowering developers to program the web they want to. In short, we're planning to be free as a developer-friendly [Wayback Machine](https://web.archive.org/) unless you're interested in receiving support or prioritization for working on specific features. [Reach out](mailto:yev@lsd.so) if this interests you.
