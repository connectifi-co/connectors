import {  ServerError, Prompt } from '../../../../types';
import OpenAI from 'openai';
import { OPENAI_MODEL } from '..';
import { PartRecord, PartRecordList, partRecordListSchema } from './types';

const parts: Array<PartRecord> = [
  {
      "partId": "123abc-1",
      "assemblies": ["a","b","c"],
      "name": "Resistor (1kΩ, 1/4W)",
      "description": "A passive component that limits current flow in a circuit. Used to control voltage levels and protect sensitive components."
  },
  {
      "partId": "123abc-2",
      "assemblies": ["e","f","g"],
      "name": "Capacitor (100µF, 16V Electrolytic)",
      "description": "Stores and releases electrical energy, commonly used for filtering power supplies and stabilizing voltage."
  },
  {
      "partId": "123abc-3",
      "assemblies": ["h","i","j"],
      "name": "Diode (1N4007)",
      "description": "A semiconductor component that allows current to flow in only one direction, often used for rectification in power supplies."
  },
  {
      "partId": "123abc-4",
      "assemblies": ["l","m","n"],
      "name": "NPN Transistor (BC547)",
      "description": "A small-signal transistor used for switching and amplification in various electronic circuits."
  },
  {
      "partId": "123abc-5",
      "assemblies": ["o","p"],
      "name": "Operational Amplifier (LM741)",
      "description": "A general-purpose op-amp used in analog circuits for signal processing, filtering, and amplification."
  },
  {
      "partId": "123abc-6",
      "assemblies": ["q","r"],
      "name": "Microcontroller (ATmega328P)",
      "description": "A programmable IC used in embedded systems, most commonly found in Arduino boards."
  },
  {
      "partId": "123abc-7",
      "assemblies": ["s","t"],
      "name": "Voltage Regulator (LM7805)",
      "description": "Provides a stable 5V output from a higher voltage source, used in power supply circuits."
  },
  {
      "partId": "123abc-8",
      "assemblies": ["u","z"],
      "name": "LED (Red, 5mm)",
      "description": "A Light Emitting Diode that produces light when current flows through it, commonly used as indicators."
  },
  {
      "partId": "123abc-9",
      "assemblies": ["w","x"],
      "name": "Crystal Oscillator (16MHz",
      "description": "Generates a stable clock signal for microcontrollers and digital circuits."
  },
  {
      "partId": "123abc-10",
      "assemblies": ["y","z"],
      "name": "Relay (5V, SPDT)",
      "description": "An electromechanical switch that allows low-power control of high-power circuits."
  }
];


/*
  Respond to QueryParts intent (from Prompt type)
  Returns PartRecordList type
  Procedure:
  - match prompt to parts options and return the record(s)
  - empty list of no matches

  intent: QueryParts
  "context": {
    "type": "connect.prompt",
    "text": "I'm looking for a diode part"
  }
*/

//returns a connect.workflow.response context
const mainSystemPrompt: string = `
  You are an assistant helping to match user queries to a catalog of parts.
  This is the catalog:
  ${JSON.stringify(parts)}
`;

const multipleExample: PartRecordList = {
  type: 'connect.demo.partRecordList',
  items: [
    {
      partId: 'abc-123',
      assemblies: ['a','b','c'],
      name:'this is the part name',
      description: 'this is the part description'
    },
    {
      partId: 'efg-456',
      assemblies: ['q','r','s'],
      name:'this is the part name',
      description: 'this is the part description'
    }
  ]
};

const singleExample: PartRecordList = {
  type: 'connect.demo.partRecordList',
  items: [
    {
      partId: 'abc-123',
      assemblies: ['a','b','c'],
      name:'this is the part name',
      description: 'this is the part description'
    }
  ]
};

const noExample: PartRecordList = {
    type: 'connect.demo.partRecordList',
    items: []
};

const responseDescription: string = `
  Return results in JSON using the PartRecordList context data type.  Following are some examples.
  Multiple matches:
    ${JSON.stringify(multipleExample)}
  Single match:
    ${JSON.stringify(singleExample)}
  No matches:
    ${JSON.stringify(noExample)}
 `;

export const handlePartQuery = async ( apiKey: string, prompt: Prompt ): Promise<PartRecordList> => {
  console.log('**** handlePartQuery called', prompt);
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
      Please find the best matches for the following query against the catalog of parts.
      ${prompt.text}
      ` });
  
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
      response_format: {type:"json_schema", json_schema: partRecordListSchema}
    });

    console.log('*** Chat Completion Response', chatCompletion);

    if (chatCompletion?.choices.length > 0) {
      const partResponse = chatCompletion.choices[0].message.content;
      if (partResponse) {
        const partsList: PartRecordList = JSON.parse(partResponse);
        return partsList;
      }
    }
  
  throw new ServerError('part query could not be processed');
};
