import drop, { Trip } from "internetdata";
import { z } from "zod";

const run = async () => {
  const trip = await drop.tab();

  const caseDataSchema = z.array(
    z.object({
      link: z.string(),
      date: z.string(),
      docket: z.string(),
      case: z.string(),
    }),
  );

  const caseData = await trip
    // If you have the Bicycle installed you can control a browser locally https://lsd.so/bicycle
    .on("BROWSER")
    .assign("next_button", 'li.pagination-next a[aria-label="Next page"]!')
    .associate("get_possible_next_button", (trip: Trip) =>
      trip.group("next_button").select("next_button"),
    )
    .associate("gather_results", (trip: Trip) =>
      trip
        .group('div[role="row"]')
        .select({
          "a.modern-card-table__link@href": "link",
          'div[data-label="Date"]': "date",
          'div[data-label="Docket#"]': "docket",
        })
        .assign("possible_next_button", "get_possible_next_button |> {0}")
        .when("possible_next_button{length} > 0", (trip: Trip) =>
          trip.click("possible_next_button{0}").apply("gather_results"),
        ),
    )
    .navigate("https://caselaw.findlaw.com/court/ny-civil-court/2024")
    .around("ANYTIME")
    .apply("gather_results")
    .distinct("link")
    .dive("link")
    // Simple example of grabbing MARKDOWN from the subpage however different fields or "columns" could be requested here additionally
    .select("MARKDOWN", "case")
    .extrapolate<typeof caseDataSchema>(caseDataSchema);

  console.log("What is the case data for civil cases that took place in 2024?");
  console.log(caseData);
};

run();
