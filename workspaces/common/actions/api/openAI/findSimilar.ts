import type { Context } from '@finos/fdc3';
import { List } from '../../../lib/types';
import OpenAI from "openai";

const contextDescriptors = [
    `Context type of 'fdc3.instrument' describes a stock or other financial instrument.  The 'id' property lists common identifiers for the instrument such as 'ticker'.`,
    `Context type of 'fdc3.contact' describes a person or contact - typically from a CRM or similar system.  The 'id' property lists common identifiers for the contact such as 'email'.`,
];


const findSimilarPrompt = `
    You will be provided with an FDC3 context data object. Your task is to create a list of FDC3 context data objects most similar to the context data provided. Similarity is based on the content the provided context data is describing.

    Return the list of similar entities as a JSON object with the following structure:
    {
        "contexts": [
            {
                "type": "fdc3.instrument",
                "id": {
                    "ticker": "MSFT"
                }
            },
            {
                "type": "fdc3.instrument",
                "id": {
                    "ticker": "IBM"
                }
            }
        ]
    }

    Do not include additional fields or any explanatory text. Only return the JSON object in the specified format.
`;

const contextToPrompt = (context: Context): string => {
    return `Use the following FDC3 context data object and find similar entities to the one it describes.  
    Here are some kinds of things that a context data object could describe, based on the context type:
    ${contextDescriptors.join('/n')}
    The FDC3 context data is as follows:
    ${JSON.stringify(context)}
    `;
};

export const findSimilar = async (apiKey: string, context: Context):Promise<List> => {
   
    let items: Array<Context> = [];
    const openai = new OpenAI({
        apiKey: apiKey,
    });

    const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [];

    messages.push({ role: "system", content: findSimilarPrompt});
    messages.push({ role: "user", content: contextToPrompt(context)});
    console.log('calling chatGPT', messages);
    const chatCompletion = await openai.chat.completions.create({
        messages,
        model: "gpt-4o-mini",
    });

    console.log('****Chat Completion', chatCompletion);
    if (chatCompletion?.choices.length > 0){
        const itemsContent = chatCompletion?.choices[0].message.content;
        console.log('****Chat Completion - itemsContent', itemsContent);
        if (itemsContent){
            const contexts = JSON.parse(itemsContent);
            items = contexts.contexts;
        }
    }
    return  {
        type:'connect.list',
        listType: context.type,
        items
       };
    
    };

