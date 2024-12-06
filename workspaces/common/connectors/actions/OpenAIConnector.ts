import { Context } from "@finos/fdc3";
import {
  AbstractBaseConnector,
  ConnectorConfig,
  ConnectorRequest,
  ConnectorResponse,
} from "../Connector";
import OpenAI from "openai";


export class OpenAIConnectorConfig implements ConnectorConfig {
  apiKey: string;
  mockOpenAISDK?: any;
}

export class OpenAIConnectorRequest implements ConnectorRequest {
  context: Context;
  params: {
    systemPrompt: string,
    userPrompt: string,
    model: string,
  }
}

export class OpenAIConnector extends AbstractBaseConnector {
  private openAI: OpenAI;

  constructor(
    type: string,
    name: string,
    config: ConnectorConfig,
    description?: string
  ) {
    super(type, name, config, description);

    const apiKey = this.config.apiKey;
    if (!apiKey) {
      throw new Error("OpenAI API Key is required in the configuration.");
    }
    this.openAI = this.config.mockOpenAISDK ? this.config.mockOpenAISDK : new OpenAI({ apiKey });
  }
  
  //this is quick and dirty port of the 'findSimilar' openAI call - needs work to be generic
  async connect(request: OpenAIConnectorRequest): Promise<ConnectorResponse> {
    if (!request.context) {
      throw new Error("OpenAI Connector Error: Missing Context Data")
    }
    const context = request.context;
    const systemPrompt = request.params.systemPrompt;
    const tmpUserPrompt = request.params.userPrompt;

    const userPrompt = tmpUserPrompt
    ? `${tmpUserPrompt}\n${JSON.stringify(context)}`
    : `Context: ${JSON.stringify(context)}`;

    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
      [
        { role: "system", content: systemPrompt || "" },
        { role: "user", content: userPrompt},
      ];

    try {
      const chatCompletion = await this.openAI.chat.completions.create({
        messages,
        model: request.params.model,
      });

      if (chatCompletion?.choices.length > 0) {
        const itemsContent = chatCompletion?.choices[0].message.content;
        if (itemsContent) {
          const contexts = JSON.parse(itemsContent);
          const items = contexts.contexts as Array<Context>;
          return {
            success: true,
            response: {
              type: "connect.list",
              listType: context.type,
              items,
            },
          };
        }
      }
    } catch (error) {
      console.error("Error during OpenAI API call:", error);
      return { success: false, response: error };
    }

    return { success: false, response: "No valid response from API." };
  }
}
