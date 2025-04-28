// A strongly typed way to ingest the title of a page on LSD docs
import drop from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const googleSchema = z.array(
    z.object({
      result: z.string(),
    }),
  );
  type GoogleType = typeof googleSchema;

  const googleResults = await trip
    .on("BROWSER")
    .navigate(`https://www.google.com/search?q=what+is+lsd.so%3F`)
    .group("div#search a")
    .select("div#search a@href", "result")
    .extrapolate<GoogleType>(googleSchema);

  console.log("What is LSD.so according to Google?");
  console.log(googleResults);
};

run();
