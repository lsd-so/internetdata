// A strongly typed way to ingest the front page of HN in under 25 lines of TypeScript
import drop from "internetdata";
import { z } from "zod";

const run = async () => {
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
};

run();
