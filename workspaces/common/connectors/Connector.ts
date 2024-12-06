import { Context } from "@finos/fdc3";

/**
 * A connector request that requires at least one fdc3 context
 */
export interface ConnectorRequest {
  context: Context;
  params: object;
}

/**
 * A response from a connector operation.
 */
export interface ConnectorResponse {
  /**
   * Indicates if the operation was successful.
   */
  success: boolean;

  /**
   * The data returned from the operation, if any.
   */
  response: any;
}

/**
 * Configuration settings for a connector.
 */
export interface ConnectorConfig {
  [key: string]: any;
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
   * Initiates a connection and returns a response
   *
   * @param ConnectorRequest - A request, must contain at least one FDC3 context
   * @returns A promise that resolves with the connector's response.
   */
  connect(request: ConnectorRequest):Promise<ConnectorResponse>;
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

  abstract connect(request:ConnectorRequest): Promise<ConnectorResponse>
}
