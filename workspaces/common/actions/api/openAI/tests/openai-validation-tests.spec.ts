import OpenAI from "openai";
import { validateChatCompletion } from "./validation-utils";
import { FDC3ContextListSchema } from "./schemas";
import { ChatCompletion } from "openai/resources";

const OPENAI_MODEL = "gpt-4o-mini";

const createMockChatCompletionMessageParam =
  (): Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> => {
    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
      [];
    messages.push({
      role: "system",
      content: "you are a helpful assistant",
    });
    messages.push({
      role: "user",
      content: "a genAI FDC3 query...",
    });
    return messages;
  };

const createMockChatCompletion = (
  mockChatResponseContent: string,
): ChatCompletion => {
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

describe("OpenAI Chat Completions- validate", () => {
  jest.mock("openai");

  let openai: OpenAI = {} as any;
  let messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [];

  const mockValidChatResponseContent = JSON.stringify({
    contexts: [
      { type: "fdc3.instrument", id: { ticker: "MSFT" } },
      { type: "fdc3.instrument", id: { ticker: "IBM" } },
    ],
  });

  beforeEach(() => {
    openai = new OpenAI({ apiKey: "cfi-test-key" } as any);
    jest
      .spyOn(openai.chat.completions, "create")
      .mockResolvedValue(
        createMockChatCompletion(mockValidChatResponseContent),
      );
    messages = createMockChatCompletionMessageParam();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should validate a successful structured response", async () => {
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: "gpt-4mini",
    });

    validateChatCompletion(
      chatCompletion,
      mockValidChatResponseContent,
      FDC3ContextListSchema,
    );
  });
});

describe("OpenAI Chat Completions - Negative Tests", () => {
  jest.mock("openai");

  let openai: OpenAI = {} as any;
  const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [];

  beforeEach(() => {
    openai = new OpenAI({ apiKey: "cfi-test-key" } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should throw error due to malformed JSON response", async () => {
    const mockMalformedChatResponseContent = "invalid json";

    jest
      .spyOn(openai.chat.completions, "create")
      .mockResolvedValue(
        createMockChatCompletion(mockMalformedChatResponseContent),
      );

    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
    });

    expect(() =>
      validateChatCompletion(
        chatCompletion,
        mockMalformedChatResponseContent,
        FDC3ContextListSchema,
      ),
    ).toThrow();
  });

  test("should throw error due to incorrect schema (type mismatch)", async () => {
    const mockIncorrectSchemaChatResponseContent = JSON.stringify([
      { type: "wrong.type", id: { ticker: "MSFT" } },
      { type: "fdc3.instrument", id: { ticker: "IBM" } },
    ]);

    jest
      .spyOn(openai.chat.completions, "create")
      .mockResolvedValue(
        createMockChatCompletion(mockIncorrectSchemaChatResponseContent),
      );

    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
    });

    expect(() =>
      validateChatCompletion(
        chatCompletion,
        mockIncorrectSchemaChatResponseContent,
        FDC3ContextListSchema,
      ),
    ).toThrow();
  });

  test("should throw error due to missing fields", async () => {
    const mockMissingFieldsChatResponseContent = JSON.stringify([
      { type: "fdc3.instrument" }, // Missing id field
      { type: "fdc3.instrument", id: {} }, // Empty id object
    ]);

    jest
      .spyOn(openai.chat.completions, "create")
      .mockResolvedValue(
        createMockChatCompletion(mockMissingFieldsChatResponseContent),
      );

    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
    });

    expect(() =>
      validateChatCompletion(
        chatCompletion,
        mockMissingFieldsChatResponseContent,
        FDC3ContextListSchema,
      ),
    ).toThrow();
  });
});
