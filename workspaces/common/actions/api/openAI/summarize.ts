import type { Context } from '@finos/fdc3';
import { Summary } from '../../../lib/types';
import OpenAI from "openai";

const contextDescriptors = [
    `Context type of 'fdc3.instrument' describes a stock or other financial instrument.  The 'id' property lists common identifiers for the instrument such as 'ticker'.`,
    `Context type of 'fdc3.contact' describes a person or contact - typically from a CRM or similar system.  The 'id' property lists common identifiers for the contact such as 'email'.`,
];

const createSystemPrompt = (): string => {
    return `You will be provided with a an FDC3 context data object.  You will generate a summary of the entity it describes.  
    For example: 
        If the context data is describing a company, provide a summary of the company.  
        If the context data is describing a country, provide a summary of the country.
        If the context data is a list or a portfolio, provide a summary of the contents of the list or portfolio.
    Here are some kinds of things that a context data object could describe, based on the context type:
    ${contextDescriptors.join('/n')}
    `;
};

const contextToPrompt = (context: Context): string => {
    return `
    The FDC3 context data is as follows:
    ${JSON.stringify(context)}
    `;
};

const dataReturnPrompt = `
    Return the summary as a JSON object using the following interface:
    "
        {
  type: 'connect.summary';
  title: string;
  text: string;
}
    "
`;

export const summarize = async (apiKey: string, context: Context):Promise<Summary> => {
   
    let items: Array<Context> = [];
    const openai = new OpenAI({
        apiKey: apiKey,
    });

    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [];
    messages.push({ role: "system", content: createSystemPrompt()});
    messages.push({ role: "user", content: contextToPrompt(context)});
    messages.push({ role: "user", content: dataReturnPrompt});

    const chatCompletion = await openai.chat.completions.create({
        messages,
        model: "gpt-3.5-turbo",
    });

    if (chatCompletion?.choices.length > 0){
        const message = chatCompletion.choices[0].message.content;
        if (message) {
            const summary: Summary = JSON.parse(message);
            if (summary){
                return summary;
            }
        }
       
    }
    
    return {
        type:'connect.summary',
        title: 'Error',
        text: 'Summary could not be generated'
    }
}

