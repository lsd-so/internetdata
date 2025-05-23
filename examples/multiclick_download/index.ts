import drop from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const downloadSchema = z.array(
    z.object({
      text_file: z.string(),
    }),
  );

  const download = await trip
    // If you have the Bicycle installed you can control a browser locally https://lsd.so/bicycle
    // .on('TRAVERSER')
    .navigate("https://lsd.so/dummy_download")
    .click("#multiclick", 3)
    .select("FILE", "text_file")
    .extrapolate<typeof downloadSchema>(downloadSchema);

  console.log("What is the result of the download?");
  console.log(download);
};

run();
