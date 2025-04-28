import drop from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const mcmasterSchema = z.array(
    z.object({
      name_of_screw: z.string(),
    }),
  );
  type McMasterType = typeof mcmasterSchema;

  const screwResults = await trip
    .on("BROWSER")
    .navigate(`https://www.mcmaster.com/products/screws/`)
    .group('div[class*="TileLayout_textContainer"]')
    .select('div[class*="TileLayout_titleContainer"]', "name_of_screw")
    .extrapolate<McMasterType>(mcmasterSchema);

  console.log("What screws are available on McMaster Carr?");
  console.log(screwResults);
};

run();
