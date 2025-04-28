// A strongly typed way to ingest the front page of HN in under 25 lines of TypeScript
import drop from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const hnSchema = z.array(
    z.object({
      post: z.string(),
      post_link: z.string(),
    }),
  );

  const frontPage = await trip
    .imitate("yev/hacker_news")
    .extrapolate<typeof hnSchema>(hnSchema);

  console.log("What are the posts on the front page of HN?");
  console.log(frontPage);
};

run();
