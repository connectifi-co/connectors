import type { Context } from '@finos/fdc3';
import { Prompt, Entities } from '../../../types';
import OpenAI from "openai";
import { OPENAI_MODEL } from '.';

export const getEntities = async (apiKey: string, context: Context):Promise<Entities> => {
  const openai = new OpenAI({ apiKey: apiKey });

  const messages: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [];
  messages.push({ role: "system", content: createSystemPrompt()});
  messages.push({ role: "user", content: contextToPrompt(context as Prompt)});
  messages.push({ role: "user", content: dataReturnPrompt});
  const chatCompletion = await openai.chat.completions.create({
    messages,
    model: OPENAI_MODEL,
  });

  if (chatCompletion?.choices.length > 0){
    const message = chatCompletion.choices[0].message.content;
    if (message) {
      const entities: Entities = JSON.parse(message);
      if (entities){
          return entities;
      }
    }    
  }

  return {
    type:'connect.entities',
    error: 'Summary could not be generated',
    companies:[],
    people: [],
    places: []
  }
}

const contextDescriptors = [
    `Context type of 'fdc3.instrument' describes a stock or other financial instrument.  The 'id' property lists common identifiers for the instrument such as 'ticker'.`,
    `Always include the common US stock ticker for the company as the 'ticker' property on the 'id' field for the context data object.`,
    `The 'fdc3.instrument' context type definition is as follows: 
    { 
        type: 'fdc3.instrument'; 
        name?: string; 
        id: { ticker?: string;}
    }`,
    `Context type of 'fdc3.contact' describes a person or contact - typically from a CRM or similar system.  The 'id' property lists common identifiers for the contact such as 'email'.`,
    `The 'fdc3.contact' context type definition is as follows: 
    { 
        type: 'fdc3.contact'; 
        name?: string; 
        id: { email: string;}
        }`,
    `Context type of 'connect.location' describes a geographic location - this could be an address, a geolocation, a city, country, or state.  A location can be identified either by a specific geolocation or by a set of address properties.`,
    `The 'connect.location' context type definition is as follows: {
	type:'connect.location';
	name: string;
	id: {
		geo?: {
			lat: number;
			long: number;
		};
		address: {
			street?: Array<string>;
			city?: string;
			state?: string;
			province?: string;
			country?: string;
			code?: string;
		}
	}
}`,
`Context type of 'connect.person' describes a Indicates a person who is not a contact, may be from news, for onboarding into a CRM, historical, etc.  It should carry as much information possible to positively identify the person.`,
`The 'connect.person' context type definition is as follows: {
	type:’connect.person’,
	id: {
    name: string;
    aka?: Array<string>;
	},
	dob?: date;
  pob?: Location; 
	company?: Company;
	location?: Location; 
}
The property 'dob' indicates Date of Birth for the person.
The property 'pob' indicates Place of Birth for the person.
The property 'company' indicates the current company the person is associated with or the company with the strongest association for the person.
The property 'location' indicates the current or primary location for the person.`,
    `The 'connect.entities' context data type describes a mixed collection of FDC3 context data that are common entities,
     specifically companies, people, and places. `,
     `The 'connect.entities' context type definition is as follows: {
	        type:’connect.entities’;
	        companies: Array<Context>;
	        people: Array<Context>;
	        places: Array<Context>;
    }`
];

const createSystemPrompt = (): string => {
    return `You will be provided with a block of text.  
    You will extract any number of entities for companies, people, and locations from the provided text and return them 
    as FDC3 context data of types 'fdc3.instrument' for companies, 'fdc3.contact' or 'connect.person' for people and  'connect.location' for locations. 
    If a person entity has an email address available, they should be an 'fdc3.contact' context.
    If there is no known email, they should be represented as a 'connect.person' context.
    Do not list the same entity twice.
    All resulting entities will be returned in a FDC3 context data type of 'connect.entities', with companies, contacts, persons, and locations each in a separate array.  
    The 'connect.entities' context data JSON looks like this:
    {   
        type:’connect.entities’;
        companies: Array<Context>;
        people: Array<Context>;
        places: Array<Context>;
    }

    Here are some kinds of things that a context data object could describe, based on the context type:
    ${contextDescriptors.join('/n')}
    `;
};

const contextToPrompt = (context: Prompt): string => {
    return `
    The text block is as follows is as follows:
    ${context.text}
    `;
};

const dataReturnPrompt = `
    Return the entities as a JSON object using the following interface:
    {   
        type:’connect.entities’;
        companies: Array<Context>;
        people: Array<Context>;
        places: Array<Context>;
    }

    Only provide JSON as a response.
    Do not include additional fields, markdown, or any explanatory text. Only return the JSON object in the specified format.
`;
