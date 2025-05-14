import { z } from "zod";

/**
 * The module in which this SDK is defined
 * @module internetdata
 */
declare module "internetdata" {
  /**
   * Configuration for establishing a connection to the LSD service.
   * @property {String} user - The username for authentication. Can be provided via LSD_USER environment variable or .lsd config file.
   * @property {String} password - The password for authentication. Can be provided via LSD_PASSWORD environment variable or .lsd config file.
   */
  export interface ConnectionConfiguration {
    user: String;
    password: String;
  }

  /**
   * Manages the connection to the LSD service.
   * Handles authentication and maintains the database connection.
   * @property {String} host - The hostname of the LSD service.
   * @property {ConnectionConfiguration} connectionConfiguration - The configuration used for authentication.
   */
  export class Connection {
    host: String;
    connectionConfiguration: ConnectionConfiguration;
  }

  export interface AliasArgument {
    selecting: String;
    alias?: String;
  }

  /**
   * Represents a browsing session or "trip" through web content.
   * Provides methods for navigation, interaction, and data extraction.
   * @property {Connection} connection - The connection to the LSD service.
   */
  export class Trip {
    connection: Connection;

    /**
     * Filters data to only include items that occurred after the specified timestamp.
     * @param {String|number} timestamp - Unix timestamp (seconds since epoch) to use as the lower time boundary.
     * @param {String} [radius] - Optional time radius to include around the timestamp (e.g., "1 DAYS" for one day).
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    after: (timestamp: String | number, radius?: String) => Trip;

    /**
     * Calls a previously defined function by its name.
     * @param {String} target - The name of the function to call.
     * @param {Array<String>} [args] - Optional array of string arguments to pass to the function.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    apply: (target: String, args?: Array<String>) => Trip;

    /**
     * Filters data to include items that occurred around the specified timestamp (both before and after).
     * @param {"ANYTIME"|String|number} timestamp - Unix timestamp (seconds since epoch) to use as the center point, or "ANYTIME" to accept data regardless of time.
     * @param {String} [radius] - Optional time radius to include around the timestamp (e.g., "1 DAYS" for one day).
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    around: (timestamp: "ANYTIME" | String | number, radius?: String) => Trip;

    /**
     * Assembles the LSD query string based on all the actions and selections that have been called on this Trip.
     * @returns {string} - Returns the complete LSD query string ready for execution.
     */
    assembleQuery: () => string;

    /**
     * Assigns a value to a variable in the LSD language.
     * @param {String} name - The name of the variable to assign to.
     * @param {String} value - The value to assign to the variable.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    assign: (name: String, value: String) => Trip;

    /**
     * Associates a name with a function body that takes no arguments.
     * This is a convenience shorthand for define() when creating functions that don't require parameters.
     * @param {String} name - The name of the function to associate.
     * @param {Function} [body] - Optional function that takes a Trip and returns a modified Trip, defining the function's behavior.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    associate: (name: String, body?: (trip: Trip) => Trip) => Trip;

    /**
     * Filters data to only include items that occurred before the specified timestamp.
     * @param {String|number} timestamp - Unix timestamp (seconds since epoch) to use as the upper time boundary.
     * @param {String} [radius] - Optional time radius to include around the timestamp (e.g., "1 DAYS" for one day).
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    before: (timestamp: String | number, radius?: String) => Trip;

    /**
     * Clicks on an element matching the specified selector.
     * @param {String} selector - CSS selector for the element to click.
     * @param {number} [times] - Optional number of times to click the element. Defaults to 1 if not specified.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    click: (selector: String, times?: number) => Trip;

    /**
     * Defines a custom function in the LSD language that can be reused throughout the trip.
     * @param {String} name - The name of the function to define.
     * @param {Array<AliasArgument>} [args] - Optional array of arguments the function accepts.
     * @param {Function} [body] - Optional function that takes a Trip and returns a modified Trip, defining the function's behavior.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    define: (
      name: String,
      args?: Array<AliasArgument>,
      body?: (trip: Trip) => Trip,
    ) => Trip;

    /**
     * Navigates into a specific link or set of links from the current page to proceed with remaining instructions.
     * May be done in parallel with cloud browsers or in sequence on a local browser
     * @param {String} target - Selector or identifier for the variable/element to dive into.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    dive: (target: String) => Trip;

    /**
     * Enters text into an input field matching the specified selector.
     * @param {String} selector - CSS selector for the input element.
     * @param {String} textToEnter - The text to enter into the input field.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    enter: (selector: String, textToEnter: String) => Trip;

    /**
     * Executes a raw LSD query string directly.
     * This method allows running custom LSD code, which is a specialized language for web extraction and interaction.
     * Use with caution as it bypasses the structured API and type safety.
     * @param {string} code - The raw LSD query string to execute.
     * @returns {Promise<Array<Record<string, any>>>} - Returns a promise that resolves to the query results as an array of records.
     */
    execute: (code: string) => Promise<Array<Record<string, any>>>;

    /**
     * Executes the trip and parses the results according to the provided schema.
     * @param {T extends z.ZodTypeAny} schema - Zod schema to validate and parse the results.
     * @param {boolean} [showQuery] - Optional flag to print the assembled query to the console before execution.
     * @returns {Promise<T>} - Returns a promise that resolves to the parsed data matching the schema.
     */
    extrapolate: <T extends z.ZodTypeAny>(
      schema: T,
      showQuery?: boolean,
    ) => Promise<T>;

    /**
     * Groups results by a repeating container (defining what delineates rows)
     * @param {String} groupingBy - Selector or attribute to group results by.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    group: (groupingBy: String) => Trip;

    /**
     * Applies a predefined skill or behavior pattern to the current browsing session.
     * This imports a published LSD program (think like npm/javascript but for a web interaction language)
     * @param {String} skillIdentifier - Identifier for the LSD trip to import.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    imitate: (skillIdentifier: String) => Trip;

    /**
     * Navigates to a specified URL.
     * @param {String} destination - The URL to navigate to.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    navigate: (destination: String) => Trip;

    /**
     * Specifies the target environment for executing the trip.
     * @param {String} target - The target environment ("BROWSER" for local browser or "TRAVERSER" for cloud browser).
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    on: (target: String) => Trip;
    /**
     * Selects specific elements or data from the current page. Attempts to grab first from within the repeating container, than checks the container itself, then attempts to retrieve from the page itself.
     * @param {String} selecting - CSS selector or expression for the values to select.
     * @param {String} [alias] - Optional alias to assign to the selected data for reference in results.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    select: (
      selecting: String | Record<string, string>,
      alias?: String,
    ) => Trip;

    /**
     * Conditionally executes different flows based on a specified condition.
     * @param {String} condition - The condition to evaluate.
     * @param {Function} thenFlow - Function that takes a Trip and returns a modified Trip, defining the behavior if condition is true.
     * @param {Function} [elseFlow] - Optional function that takes a Trip and returns a modified Trip, defining the behavior if condition is false.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    when: (
      condition: String,
      thenFlow: (trip: Trip) => Trip,
      elseFlow?: (trip: Trip) => Trip,
    ) => Trip;
  }

  /**
   * Default export providing the main entry point to the LSD service.
   * @property {Function} tab - Drop a tab to start a new web browsing Trip.
   *                            Just like the real thing, dropping a tab returns a Promise for a Trip.
   * @param {ConnectionConfiguration} [connectionConfiguration] - Optional configuration for the connection.
   * @returns {Promise<Trip>} - Returns a promise that resolves to a new Trip instance.
   */
  const defaultExport: {
    tab: (connectionConfiguration?: ConnectionConfiguration) => Promise<Trip>;
  };

  export = defaultExport;
}
