import { ServerError, Prompt } from '../../../../types';
import OpenAI from 'openai';
import { OPENAI_MODEL } from '..';
import { AssemblyRecord, AssemblyRecordList, assemblyRecordListSchema } from './types';

/*
  Respond to QueryAssemblies intent (from Prompt type)
  Returns AssemblyRecordList type
  Procedure:
  - match prompt to parts options and return the record(s)
  - empty list of no matches


  intent: QueryAssemblies
  "context": {
    "type": "connect.prompt",
    "text": "I'm using Model 12"
  }
*/
const assemblies: Array<AssemblyRecord> = [
    { "assemblyId": "a", "system": "Model-1" },
    { "assemblyId": "b", "system": "Model-2" },
    { "assemblyId": "c", "system": "Model-3" },
    { "assemblyId": "d", "system": "Model-4" },
    { "assemblyId": "e", "system": "Model-5" },
    { "assemblyId": "f", "system": "Model-6" },
    { "assemblyId": "g", "system": "Model-7" },
    { "assemblyId": "h", "system": "Model-8" },
    { "assemblyId": "i", "system": "Model-9" },
    { "assemblyId": "j", "system": "Model-10" },
    { "assemblyId": "k", "system": "Model-11" },
    { "assemblyId": "l", "system": "Model-12" },
    { "assemblyId": "m", "system": "Model-13" },
    { "assemblyId": "n", "system": "Model-14" },
    { "assemblyId": "o", "system": "Model-15" },
    { "assemblyId": "p", "system": "Model-16" },
    { "assemblyId": "q", "system": "Model-17" },
    { "assemblyId": "r", "system": "Model-18" },
    { "assemblyId": "s", "system": "Model-19" },
    { "assemblyId": "t", "system": "Model-20" },
    { "assemblyId": "u", "system": "Model-21" },
    { "assemblyId": "v", "system": "Model-22" },
    { "assemblyId": "w", "system": "Model-23" },
    { "assemblyId": "x", "system": "Model-24" },
    { "assemblyId": "y", "system": "Model-25" },
    { "assemblyId": "z", "system": "Model-26" }
];

//returns a connect.workflow.response context
const mainSystemPrompt: string = `
  You are an assistant helping to match user queries to a catalog of assemblies.
  This is the catalog:
  ${JSON.stringify(assemblies)}
`;

const multipleExample: AssemblyRecordList = {
  type: 'connect.demo.assemblyRecordList',
  items: [
    {
      assemblyId: 'abc-123',
      system: 'foo'
    },
    {
      assemblyId: 'efg-456',
      system: 'bar'
    }
  ]
};

const singleExample: AssemblyRecordList = {
    type: 'connect.demo.assemblyRecordList',
    items: [
      {
        assemblyId: 'abc-123',
        system: 'foo'
      }
    ]
  };
const noExample: AssemblyRecordList = {
    type: 'connect.demo.assemblyRecordList',
    items: []
  };

const responseDescription: string = `
  Return results in JSON using the AssemblyRecordList context data type.  
  Following are some examples of results.
  Multiple matches:
    ${JSON.stringify(multipleExample)}
  Single match:
    ${JSON.stringify(singleExample)}
  No matches:
    ${JSON.stringify(noExample)}
 `;

export const handleAssemblyQuery = async ( apiKey: string, prompt: Prompt ): Promise<AssemblyRecordList> => {
    console.log('**** handleAssemblyQuery called', prompt);
  const openai = new OpenAI({ apiKey: apiKey });

    //query openAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    messages.push({ 
      role: 'system', 
      content: `
      ${mainSystemPrompt}
      ${responseDescription}
      `
    });
    messages.push({ role: 'user', content: `
      Please find the best matches for the following query against the catalog of assemblies.
      Ensure that the assembly matched is consistent with the assemblyId options in the following Part Record:
      ${JSON.stringify(prompt.context)}

      If you can't find any matches, please offer suggestions of systems a user may choose from.
      ${prompt.text}
      ` });
  
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
      response_format: {type:"json_schema", json_schema: assemblyRecordListSchema}
    });

    console.log('*** Chat Completion Response', chatCompletion);
    
    if (chatCompletion?.choices.length > 0) {
      const assemblyResponse = chatCompletion.choices[0].message.content;
      if (assemblyResponse) {
        const assemblyList: AssemblyRecordList = JSON.parse(assemblyResponse);
        return assemblyList;
      }
    }
  
  throw new ServerError('assembly query could not be processed');
};
