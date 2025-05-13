import { existsSync, readFileSync } from "fs";
import { join } from "path";
import os from "os";

import postgres from "postgres";
import { z } from "zod";

export interface ConnectionConfiguration {
  user: String;
  password: String;
}

const getUserTouse = (
  connectionConfiguration?: ConnectionConfiguration,
): String => {
  const userFromConfigurationObject = connectionConfiguration?.user;
  if (userFromConfigurationObject) {
    return userFromConfigurationObject;
  }

  const userFromEnvVar = process.env.LSD_USER;
  if (userFromEnvVar) {
    return userFromEnvVar;
  }

  const lsdConfigExists = existsSync(join(os.homedir(), ".lsd"));
  if (lsdConfigExists) {
    const content = readFileSync(join(os.homedir(), ".lsd"), "utf-8");
    const asObject = z
      .object({
        user: z.string(),
        password: z.string(),
      })
      .parse(JSON.parse(content));
    if (asObject.user) {
      return asObject.user;
    }
  }

  return "";
};

const getPasswordToUse = (
  connectionConfiguration?: ConnectionConfiguration,
): String => {
  const passwordFromConfiguration = connectionConfiguration?.password;
  if (passwordFromConfiguration) {
    return passwordFromConfiguration;
  }

  const passwordFromEnvVar = process.env.LSD_PASSWORD;
  if (passwordFromEnvVar) {
    return passwordFromEnvVar;
  }

  const lsdConfigExists = existsSync(join(os.homedir(), ".lsd"));
  if (lsdConfigExists) {
    const content = readFileSync(join(os.homedir(), ".lsd"), "utf-8");
    const asObject = z
      .object({
        user: z.string(),
        password: z.string(),
      })
      .parse(JSON.parse(content));
    if (asObject.password) {
      return asObject.password;
    }
  }

  return "";
};

// LSDConnection abstracts the postgres connection in case there's a need to retry connecting in the middle of a run
export class Connection {
  host: String;
  connectionConfiguration: ConnectionConfiguration;
  sqlConn?: postgres.Sql;

  constructor(connectionConfiguration?: ConnectionConfiguration) {
    const userToUse = getUserTouse(connectionConfiguration);
    const passwordToUse = getPasswordToUse(connectionConfiguration);

    if (userToUse.length === 0) {
      throw new Error(
        "Missing an LSD user, specify [user] in the configuration object or set the [LSD_USER] environment variable",
      );
    }

    if (passwordToUse.length === 0) {
      throw new Error(
        "Missing an LSD password, specify [password] in the configuration object or set the [LSD_PASSWORD] environment variable",
      );
    }

    this.host = "lsd.so";
    this.connectionConfiguration = {
      user: userToUse,
      password: passwordToUse,
    };
    this.sqlConn = undefined;
  }

  async establishConnection(): Promise<postgres.Sql> {
    if (this.sqlConn !== undefined) {
      try {
        await this.sqlConn.unsafe(`FROM https://lsd.so |> SELECT title`);

        return this.sqlConn;
      } catch (e) {
        this.sqlConn = undefined;
      }
    }

    const connectionURI = `postgres://${this.connectionConfiguration.user}:${this.connectionConfiguration.password}@${this.host}:5432/${this.connectionConfiguration.user}`;
    this.sqlConn = postgres(connectionURI);
    return this.sqlConn;
  }
}
