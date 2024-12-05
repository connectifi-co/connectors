export interface ConnectorResponse {
  success: boolean;
  data: any;
}

export interface ConnectorConfig {
  config: Record<string, any>;
}

export interface Connector {
  type: string;
  name: string;
  description?: string;
  config: ConnectorConfig;
  getConfigProperty<T>(property: string): T | undefined;
  connect: () => Promise<ConnectorResponse>;
}

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

  getConfigProperty<T>(property: string): T | undefined {
    return this.config.config[property] as T | undefined;
  }

  connect: () => Promise<ConnectorResponse>;
}
