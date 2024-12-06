import { OpenAI } from "openai";
import { OpenAIConnector, OpenAIConnectorRequest } from "../OpenAIConnector";
import { ConnectorResponse } from "../../Connector";

const OPENAI_MODEL = "cfi-test-mini";

const createMockChatCompletion = (mockChatResponseContent: string): any => {
  return {
    id: "chatcmpl-123",
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: OPENAI_MODEL,
    choices: [
      {
        message: {
          role: "assistant",
          content: mockChatResponseContent,
          refusal: null,
        },
        finish_reason: "stop",
        index: 0,
        logprobs: null,
      },
    ],
  };
};

describe("OpenAIConnector tests", () => {
  let openai: OpenAI;
  let testConnector: OpenAIConnector;

  beforeEach(() => {
    jest.mock("openai");
    openai = new OpenAI({ apiKey: "cfi-test-key" } as any);
    jest.spyOn(openai.chat.completions, "create").mockResolvedValue(
      createMockChatCompletion(
        JSON.stringify({
          contexts: [
            { type: "fdc3.instrument", id: { ticker: "MSFT" } },
            { type: "fdc3.instrument", id: { ticker: "IBM" } },
          ],
        })
      )
    );

    testConnector = new OpenAIConnector(
      "openai",
      "OpenAI Connector",
      {
        apiKey: "cfi-test-key",
        mockOpenAISDK: openai
      },
      "Connects to the OpenAI API"
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully connect and return a response", async () => {
    const mockRequest: OpenAIConnectorRequest = {
      context: { type: "fdc3.instrument", id: { ticker: "AAPL" } },
      params: {
        systemPrompt: "You are an AI assistant.",
        userPrompt: "What is the current price of AAPL?",
        model: OPENAI_MODEL,
      },
    };

    const response: ConnectorResponse = await testConnector.connect(mockRequest);

    expect(response.success).toBe(true);
    expect(response.response.type).toBe("connect.list");
    expect(response.response.listType).toBe(mockRequest.context.type);
    expect(response.response.items.length).toBe(2);
  });

  it("should throw error due to missing context data", async () => {
    const mockRequest: OpenAIConnectorRequest = {
      context: null,
      params: {
        systemPrompt: "You are an AI assistant.",
        userPrompt: "get the correct fdc3 contexts",
        model: OPENAI_MODEL,
      },
    };
    await expect(testConnector.connect(mockRequest)).rejects.toThrow(
      "OpenAI Connector Error: Missing Context Data"
    );
  });

  it("should throw error due to invalid API key", async () => {
    const connectorWithInvalidKey = new OpenAIConnector(
      "openai",
      "OpenAI Connector",
      {
        apiKey: "invalid-key",
      },
      "Connects to the OpenAI API"
    );

    const mockRequest: OpenAIConnectorRequest = {
      context: { type: "fdc3.instrument", id: { ticker: "AAPL" } },
      params: {
        systemPrompt: "You are an AI assistant.",
        userPrompt: "What is the current price of AAPL?",
        model: OPENAI_MODEL,
      },
    };

    const response = await testConnector.connect(mockRequest);
    expect(response.success).toBe(false);
    expect(response.response.data).toContain("401");

    await expect(connectorWithInvalidKey.connect(mockRequest)).rejects.toThrow(
      "OpenAI API Key is required in the configuration."
    );
  });

  it("should handle malformed JSON response", async () => {
    jest
      .spyOn(openai.chat.completions, "create")
      .mockResolvedValue(createMockChatCompletion("invalid json"));

    const mockRequest: OpenAIConnectorRequest = {
      context: { type: "fdc3.instrument", id: { ticker: "AAPL" } },
      params: {
        systemPrompt: "You are an AI assistant.",
        userPrompt: "What is the current price of AAPL?",
        model: OPENAI_MODEL,
      },
    };

    const response = await testConnector.connect(mockRequest);
    expect(response.success).toBe(false);
    expect(response.response.message).toMatch("Unexpected token");
  });
});
