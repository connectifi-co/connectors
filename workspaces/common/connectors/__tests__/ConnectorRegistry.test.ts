import { ConnectorRegistry } from "../ConnectorRegistry";
import {
  AbstractBaseConnector,
  ConnectorConfig,
  ConnectorResponse,
} from "../Connector";

class TestConnector extends AbstractBaseConnector {
  constructor(
    type: string,
    name: string,
    config: ConnectorConfig,
    description?: string
  ) {
    super(type, name, config, description);
  }

  connect = async (): Promise<ConnectorResponse> => {
    console.log(
      `${this.type}-${this.name} connect() called with ${JSON.stringify(this.config)}`
    );
    return { success: true, data: { type: "fdc3.intrument" } };
  };
}

describe("ConnectorRegistry tests", () => {
  let registry: ConnectorRegistry;

  beforeEach(() => {
    registry = ConnectorRegistry.getInstance();
    registry["registry"].clear(); 
  });

  it("should register a connector successfully", () => {
    const testConnector = new TestConnector(
      "cfi.testConnector",
      "testConnector",
      { config: { apiKey: "cfi-23434" } }
    );
    registry.register(testConnector);
    const retrieved = registry.getConnector("testConnector");
    expect(retrieved).toBe(testConnector);
  });

  it("should throw an error if a connector with the same name is registered twice", () => {
    const testConnector = new TestConnector(
      "cfi.testConnector",
      "testConnector",
      { config: { apiKey: "cfi-23434" } }
    );
    registry.register(testConnector);
    expect(() => registry.register(testConnector)).toThrow(
      "Connector 'testConnector' is already registered."
    );
  });

  it("should return null for an unregistered connector", () => {
    const result = registry.getConnector("nonexistentConnector");
    expect(result).toBeNull();
  });

  it("should throw an error when registering a connector with an empty string name", () => {
    const testConnector = new TestConnector("cfi.testConnector", "", {
      config: { apiKey: "cfi-23434" },
    });
    expect(() => registry.register(testConnector)).toThrow(
      "Connector Error: connector.name is empty"
    );
  });

  it("should throw an error when registering a connector with null name", () => {
    const testConnector = new TestConnector("cfi.testConnector", null as any, {
      config: { apiKey: "cfi-23434" },
    });
    expect(() => registry.register(testConnector)).toThrow(
      "Connector Error: connector.name is null or undefined"
    );
  });

  it("should throw an error when registering a connector with undefined name", () => {
    const testConnector = new TestConnector(
      "cfi.testConnector",
      undefined as any,
      { config: { apiKey: "cfi-23434" } }
    );
    expect(() => registry.register(testConnector)).toThrow(
      "Connector Error: connector.name is null or undefined"
    );
  });

  it("should throw an error when registering a connector with an empty string type", () => {
    const testConnector = new TestConnector("", "testConnector", {
      config: { apiKey: "cfi-23434" },
    });
    expect(() => registry.register(testConnector)).toThrow(
      "Connector Error: connector.type is empty."
    );
  });

  it("should throw an error when registering a connector with null type", () => {
    const testConnector = new TestConnector(null as any, "testConnector", {
      config: { apiKey: "cfi-23434" },
    });
    expect(() => registry.register(testConnector)).toThrow(
      "Connector Error: connector.type is null or undefined"
    );
  });

  it("should throw an error when registering a connector with undefined type", () => {
    const testConnector = new TestConnector(undefined as any, "testConnector", {
      config: { apiKey: "cfi-23434" },
    });
    expect(() => registry.register(testConnector)).toThrow(
      "Connector Error: connector.type is null or undefined"
    );
  });
});
