import type { Context } from '@finos/fdc3';
import { Prompt } from '../../../types';
import OpenAI from "openai";
import { OPENAI_MODEL } from '.';

export const generatePrompt = async (apiKey: string, context: Context):Promise<Prompt> => {
  const openai = new OpenAI({ apiKey: apiKey });

  const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [];
  if (context){
    messages.push( { role: "system", content: createSystemPrompt(context)});
    messages.push({ role: "user", content: contextToPrompt(context)});
  }

  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: OPENAI_MODEL,
  });

  if (chatCompletion?.choices.length > 0){
    return  {
      type:'connect.prompt',
      text: chatCompletion.choices[0].message.content || '',
      context: context
    };
  }

  return {
    type:'connect.prompt',
    text: 'Error: Please Try Again'
  }
}

const contextDescriptors = [
  `Context type of 'fdc3.instrument' describes a stock or other financial instrument.  The 'id' property lists common identifiers for the instrument such as 'ticker'.`,
  `Context type of 'fdc3.contact' describes a person or contact - typically from a CRM or similar system.  The 'id' property lists common identifiers for the contact such as 'email'.`,
];

const createSystemPrompt = ( context: Context) => { return `
    You will be provided with a text prompt and a FDC3 context data object of type '${context.type}' as background for this prompt.  
    You will generate a new prompt by applying the text prompt to the context.  
    For example, if you are give a context of:
    {
        type: 'fdc3.instrument',
        name: 'Microsoft',
        id: {
            ticker: 'MSFT'
        }
    }
    and a prompt of 'Provide a summary of the context'
    The resulting prompt might be: 'Provide a summary of the company Microsoft with the ticker symbol "MSFT"'
    Do not return the original context as part of the resulting prompt. 
    Here are some kinds of things that a context data object could describe, based on the context type:
    ${contextDescriptors.join('/n')}
`};

const contextToPrompt = (context: Context): string => {
    return `Use the following FDC3 context data object of type '${context.type}' as background:
    ${JSON.stringify(context)}
    `;
};
