import drop from "internetdata";
import { z, ZodTypeAny } from "zod";

export const numericString = (schema: ZodTypeAny) =>
  z.preprocess((a) => {
    if (typeof a === "string") {
      return parseInt(a, 10);
    } else if (typeof a === "number") {
      return a;
    } else {
      return undefined;
    }
  }, schema);

const run = async () => {
  const trip = await drop.tab();

  const substackSchema = z.array(
    z.object({
      post_link: z.string(),
      views: numericString(z.number()),
    }),
  );

  const substackPostViews = await trip
    .on("BROWSER")
    .navigate(`https://yevlsd.substack.com/publish/posts`)
    .group(`a.pencraft.pc-display-contents.pc-reset`)
    .select("a@href", "post_link")
    .dive("post_link")
    .select(
      "#publish-main > div > div > div > div.pencraft > div:nth-child(2) > div:nth-child(1) > div h2 span",
      "views",
    )
    .extrapolate<typeof substackSchema>(substackSchema);

  console.log("How many views do I have on my substack?");
  console.log(substackPostViews);
};

run();
