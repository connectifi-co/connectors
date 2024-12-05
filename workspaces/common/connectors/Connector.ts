/**
 * Represents a response from a connector operation.
 */
export interface ConnectorResponse {
  /**
   * Indicates if the operation was successful.
   */
  success: boolean;

  /**
   * The data returned from the operation, if any.
   */
  data: any;
}

/**
 * Configuration settings for a connector.
 */
export interface ConnectorConfig {
  config: Record<string, any>;
}

/**
 * Connector with basic properties and methods.
 */
export interface Connector {
  /**
   * The type of the connector.
   */
  type: string;

  /**
   * The name of the connector.
   */
  name: string;

  /**
   * Optional description of the connector.
   */
  description?: string;

  /**
   * The configuration settings for the connector.
   */
  config: ConnectorConfig;

  /**
   * Retrieves a configuration property by name.
   *
   * @param property - The name of the configuration property to retrieve.
   * @returns The value of the configuration property, or undefined if not found.
   */
  getConfigProperty<T>(property: string): T | undefined;

  /**
   * Initiates a connection and returns a response
   *
   * @returns A promise that resolves with the connector's response.
   */
  connect: () => Promise<ConnectorResponse>;
}

/**
 * An abstract base class for connectors, providing common functionality.
 * Extend this class to create concrete connector implementations.
 */
export abstract class AbstractBaseConnector implements Connector {
  type: string;
  name: string;
  description?: string;
  config: ConnectorConfig;

  constructor(
    type: string,
    name: string,
    config: ConnectorConfig,
    description?: string
  ) {
    this.type = type;
    this.name = name;
    this.config = config;
    this.description = description;
  }

  /**
   * Retrieves a configuration property by name.
   *
   * @param property - The name of the configuration property to retrieve.
   * @returns The value of the configuration property, or undefined if not found.
   */
  getConfigProperty<T>(property: string): T | undefined {
    return this.config.config[property] as T | undefined;
  }

  connect: () => Promise<ConnectorResponse>;
}
