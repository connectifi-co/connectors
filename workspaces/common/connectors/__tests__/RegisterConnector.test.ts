import { registerConnector } from "../RegisterConnector";
import { ConnectorRegistry } from "../ConnectorRegistry";
import {
  AbstractBaseConnector,
  ConnectorConfig,
  ConnectorResponse,
} from "../Connector";

describe("@RegisterConnector", () => {
  const registry: ConnectorRegistry = ConnectorRegistry.getInstance();

  @registerConnector(registry)
  class TestConnector extends AbstractBaseConnector {

    constructor(type: string, name: string, config: ConnectorConfig) {
      super(type, name, config);
    }

    connect = async (): Promise<ConnectorResponse> => {
      console.log(
        `${this.type} connect() called, with ${JSON.stringify(this.config)}`
      );
      return { success: true, data: { type: "cft.test" } };
    };
  }

  beforeEach(() => {
    registry["registry"].clear();
  });

  it("should automatically register the class instance in the registry", () => {
    const testConnectorInstance = new TestConnector(
      "test",
      "testConnector",
      {} as ConnectorConfig
    );
    expect(registry.getConnector("testConnector")).toBe(testConnectorInstance);
  });

  it("should throw an error when applied to a non class target", () => {
    const invalidTarget = {};
    expect(() => {
      registerConnector(registry)(invalidTarget as any);
    }).toThrow("Decorator applied to a non-class target.");
  });
});
