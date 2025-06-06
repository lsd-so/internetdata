import drop from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const glassdoorSchema = z.array(
    z.object({
      rating: z.string(),
      ceo_approval: z.string(),
      would_recommend: z.string(),
    }),
  );

  const glassdoor: typeof glassdoorSchema = await trip
    .on("BROWSER")
    .navigate(
      "https://www.glassdoor.com/Overview/Working-at-Vercel-EI_IE6510369.11%2C17.htm",
    )
    .select({
      'p[class*="average_rating"]': "rating",
      'p[class*="ceoApproval"]': "ceo_approval",
      'p[class*="recommendLine"]': "would_recommend",
    })
    .extrapolate<typeof glassdoorSchema>(glassdoorSchema);

  console.log(
    `# Overall rating\n${glassdoor[0].rating}\n\n# CEO approval\n${glassdoor[0].ceo_approval}\n\n# Would recommend\n${glassdoor[0].would_recommend}`,
  );
};

run();
