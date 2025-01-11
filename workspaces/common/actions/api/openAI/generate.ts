import type { Context } from '@finos/fdc3';
import { Prompt, Completion } from '../../../lib/types';
import OpenAI from 'openai';
/*
example prompts:
    {
        "type": "fdc3.prompt",
        "text": "What can you tell me about this company?",
        "context": {
            "type": "fdc3.instrument",
            "id": {
                "ticker": "IBM"
            }
        }
    }

    {
    "type": "fdc3.prompt",
    "text": "Write a cold email to send to this contact",
    "context": {
        "type": "fdc3.contact",
        "name": "John Smith",
        "id": {
            "email": "john.smith@example.com"
        }
    }
  }
*/
const contextDescriptors = [
  `Context type of 'fdc3.instrument' describes a stock or other financial instrument.  The 'id' property lists common identifiers for the instrument such as 'ticker'.`,
  `Context type of 'fdc3.contact' describes a person or contact - typically from a CRM or similar system.  The 'id' property lists common identifiers for the contact such as 'email'.`,
];

const createSystemPrompt = (context: Context) => {
  return `
    You will be provided with a text prompt and a FDC3 context data object of type '${context.type}' as background for this prompt.  
    Use the FDC3 context data object as background for the text you will generate in response to the prompt.  
    Here are some kinds of things that a context data object could describe, based on the context type:
    ${contextDescriptors.join('/n')}
`;
};

const contextToPrompt = (context: Context): string => {
  return `Use the following FDC3 context data object of type '${context.type}' as background:
    ${JSON.stringify(context)}
    `;
};

export const generate = async (
  apiKey: string,
  prompt: Prompt,
): Promise<Completion> => {
  const openai = new OpenAI({
    apiKey: apiKey,
  });

  const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> =
    [];
  if (prompt.context) {
    messages.push({
      role: 'system',
      content: createSystemPrompt(prompt.context),
    });
    messages.push({ role: 'user', content: contextToPrompt(prompt.context) });
  }
  messages.push({ role: 'user', content: prompt.text });

  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: 'gpt-4o-mini',
  });

  if (chatCompletion?.choices.length > 0) {
    return {
      type: 'connect.completion',
      text: chatCompletion.choices[0].message.content || '',
    };
  }

  return {
    type: 'connect.completion',
    text: 'Error: Please Try Again',
  };
};
