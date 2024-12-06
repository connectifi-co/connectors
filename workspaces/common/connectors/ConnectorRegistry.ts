import { Connector } from "./Connector";

/**
 * A singleton class responsible for managing and registering connectors.
 */
export class ConnectorRegistry {
  /**
   * Private static instance of ConnectorRegistry.
   */
  private static instance: ConnectorRegistry;

  /**
   * Map to store the registered connectors by their names.
   */
  private registry: Map<string, Connector> = new Map();

  /**
   * Private constructor to prevent instantiation from outside.
   */
  private constructor() {}

  /**
   * Returns the singleton instance of ConnectorRegistry.
   * @returns The instance of ConnectorRegistry.
   */
  static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  /**
   * Registers a connector in the registry.
   * @param connector - The connector to register.
   * @throws Error if a connector with the same name is already registered.
   */
  register(connector: Connector): void {
    if (this.registry.has(connector.name)) {
      throw new Error(`Connector '${connector.name}' is already registered.`);
    }

    if (connector.name === "") {
      throw new Error("Connector Error: connector.name is empty.");
    }
    if (connector.name === null || connector.name === undefined) {
      throw new Error("Connector Error: connector.name is null or undefined.");
    }

    if (connector.type === "") {
      throw new Error("Connector Error: connector.type is empty.");
    }
    if (connector.type === null || connector.type === undefined) {
      throw new Error("Connector Error: connector.type is null or undefined.");
    }

    this.registry.set(connector.name, connector);
  }

  /**
   * Retrieves a connector by its name from the registry.
   * @param name - The name of the connector to retrieve.
   * @returns The connector if found, null otherwise.
   */
  getConnector(name: string): Connector | null {
    return this.registry.get(name) || null;
  }
}
