import OpenAI from "openai";
import { validateChatCompletion } from "./validation-utils";
import { FDC3ContextSchema, FDC3InstrumentListSchema } from "./schemas";

const OPENAI_MODEL = "gpt-4o-mini";

describe("OpenAI Chat Completions - Structured Outputs", () => {
  jest.mock("openai");

  let openai: OpenAI = {} as any;

  const mockValidChatRequestContent = JSON.stringify({
    contexts: [
      { type: "fdc3.instrument", id: { ticker: "MSFT" } },
      { type: "fdc3.instrument", id: { ticker: "IBM" } },
    ],
  });

  beforeEach(() => {
    openai = new OpenAI({ apiKey: "cfi-test-key" } as any);
    jest.spyOn(openai.chat.completions, "create").mockResolvedValue({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: OPENAI_MODEL,
      choices: [
        {
          message: {
            role: "assistant",
            content: mockValidChatRequestContent,
            refusal: null,
          },
          finish_reason: "stop",
          index: 0,
          logprobs: null,
        },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should validate a successful structured response", async () => {
    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
      [];
    messages.push({
      role: "system",
      content: "you are a helpful assistant",
    });
    messages.push({
      role: "user",
      content: "FDC3_INSTRUMENT",
    });

    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: "gpt-4mini",
    });

    validateChatCompletion(
      chatCompletion,
      mockValidChatRequestContent,
      FDC3InstrumentListSchema
    );
  });
});

describe("OpenAI Chat Completions - Negative Tests", () => {
  jest.mock("openai");

  let openai: OpenAI = {} as any;

  beforeEach(() => {
    openai = new OpenAI({ apiKey: "cfi-test-key" } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should handle malformed JSON response", async () => {
    const mockMalformedChatResponseContent = "invalid json";

    jest.spyOn(openai.chat.completions, "create").mockResolvedValue({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: OPENAI_MODEL,
      choices: [
        {
          message: {
            role: "assistant",
            content: mockMalformedChatResponseContent,
            refusal: null,
          },
          finish_reason: "stop",
          index: 0,
          logprobs: null,
        },
      ],
    });

    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
      [];
    messages.push({
      role: "system",
      content: "you are a helpful assistant",
    });
    messages.push({
      role: "user",
      content: "FDC3_INSTRUMENT",
    });

    let chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
    });

    expect(() =>
      validateChatCompletion(
        chatCompletion,
        mockMalformedChatResponseContent,
        FDC3InstrumentListSchema
      )
    ).toThrow();
  });

  test("should handle incorrect schema (type mismatch)", async () => {
    const mockIncorrectSchemaChatResponseContent = JSON.stringify([
      { type: "wrong.type", id: { ticker: "MSFT" } },
      { type: "fdc3.instrument", id: { ticker: "IBM" } },
    ]);

    jest.spyOn(openai.chat.completions, "create").mockResolvedValue({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gpt-4mini",
      choices: [
        {
          message: {
            role: "assistant",
            content: mockIncorrectSchemaChatResponseContent,
            refusal: null,
          },
          finish_reason: "stop",
          index: 0,
          logprobs: null,
        },
      ],
    });

    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
      [];
    messages.push({
      role: "system",
      content: "you are a helpful assistant",
    });
    messages.push({
      role: "user",
      content: "FDC3_INSTRUMENT",
    });

    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
    });

    expect(() =>
      validateChatCompletion(
        chatCompletion,
        mockIncorrectSchemaChatResponseContent,
        FDC3InstrumentListSchema
      )
    ).toThrow();
  });

  test("should handle missing fields", async () => {
    const mockMissingFieldsChatResponseContent = JSON.stringify([
      { type: "fdc3.instrument" }, // Missing id field
      { type: "fdc3.instrument", id: {} }, // Empty id object
    ]);

    jest.spyOn(openai.chat.completions, "create").mockResolvedValue({
      id: "chatcmpl-123",
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: "gpt-4mini",
      choices: [
        {
          message: {
            role: "assistant",
            content: mockMissingFieldsChatResponseContent,
            refusal: null,
          },
          finish_reason: "stop",
          index: 0,
          logprobs: null,
        },
      ],
    });

    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
      [];
    messages.push({
      role: "system",
      content: "you are a helpful assistant",
    });
    messages.push({
      role: "user",
      content: "FDC3_INSTRUMENT",
    });

    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
    });

    expect(() =>
      validateChatCompletion(
        chatCompletion,
        mockMissingFieldsChatResponseContent,
        FDC3InstrumentListSchema
      )
    ).toThrow();
  });
});