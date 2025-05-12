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

  /**
   * Represents a browsing session or "trip" through web content.
   * Provides methods for navigation, interaction, and data extraction.
   * @property {Connection} connection - The connection to the LSD service.
   */
  export class Trip {
    connection: Connection;

    /**
     * Navigates to a specified URL.
     * @param {String} destination - The URL to navigate to.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    navigate: (destination: String) => Trip;
    /**
     * Clicks on an element matching the specified selector.
     * @param {String} selector - CSS selector for the element to click.
     * @param {number} [times] - Optional number of times to click the element. Defaults to 1 if not specified.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    click: (selector: String, times?: number) => Trip;
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
     * Applies a predefined skill or behavior pattern to the current browsing session.
     * This imports a published LSD program (think like npm/javascript but for a web interaction language)
     * @param {String} skillIdentifier - Identifier for the LSD trip to import.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    imitate: (skillIdentifier: String) => Trip;
    /**
     * Groups results by a repeating container (defining what delineates rows)
     * @param {String} groupingBy - Selector or attribute to group results by.
     * @returns {Trip} - Returns the Trip instance for method chaining.
     */
    group: (groupingBy: String) => Trip;
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
    select: (selecting: String, alias?: String) => Trip;
    extrapolate: <T extends z.ZodTypeAny>(schema: T) => Promise<T>;
    when: (condition: String, thenFlow: String, elseFlow?: String) => Trip;
  }

  const defaultExport: {
    tab: (connectionConfiguration?: ConnectionConfiguration) => Promise<Trip>;
  };

  export = defaultExport;
}
