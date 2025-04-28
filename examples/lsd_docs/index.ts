// A strongly typed way to ingest the title of a page on LSD docs
import drop from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const docsSchema = z.array(
    z.object({
      title: z.string(),
    }),
  );

  const docsTitle = await trip
    .on("TRAVERSER")
    .navigate(`https://lsd.so/docs`)
    .click('a[href="/docs/database"]')
    .select("title")
    .extrapolate<typeof docsSchema>(docsSchema);

  console.log("What is the tile of the database docs page?");
  console.log(docsTitle);
};

run();
