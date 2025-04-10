
import { ServerError } from '../../../../types';
import OpenAI from 'openai';
import { OPENAI_MODEL } from '..';
import crypto from 'crypto';
import { 
  WorkflowPrompt, 
  WorkflowResponse, 
  WorkflowStep, 
  IntentDetectionResponse, 
  intentDetectionSchema, 
  Part, 
  PartRecordList, 
  AssemblyRecordList, 
  AssemblyRecord, 
  PartRecord } from './types';

/*
  Procedure:
  - analyze the prompt
     - No Context Provided:  we are on step one and need determine if there are keywords related to parts in the prompt 
      (prompt chatGPT with data, original prompt, instructions, and structured output)
     - send prompt back in next step - QueryParts (App will automatically move to the next step)
      - app calls QueryParts with original prompt.  This decorates the prompt context
      - then workflow agent is recalled with the new context, 
           workflow agent checks the context and now returns with the next step: call the assembly agent
      - the app calls the assembly agent and the context is again updated and the workflow agent is called again
      - the workflow agent checks the context one last time, and can now return the fully resolved part record
     - Context Provided: check what is missing in the context and return the next step (procedural)
     - Context complete: return the completion step.

*/

const validPartExample: Part = {
  type: 'connect.demo.part',
  id: {
    partId: 'partId',
    assemblyId: 'assemblyId'
  },
  name: 'partName',
  description: 'part description',
  isValid: true,
};

const completePartExample: Part = {
  type: 'connect.demo.part',
  id: {
    partId: 'partId',
    assemblyId: 'assemblyId'
  },
  name: 'partName',
  description: 'part description',
  isValid: false,
};

const QueryPartsResponseExample: IntentDetectionResponse = {
  intent: 'QueryParts',
};

const QueryAssembliesResponseExample: IntentDetectionResponse = {
  intent: 'QueryAssemblies',
};

const UnknownResponseExample: IntentDetectionResponse = {
  intent: 'Unknown',
  completion: 'Please ask me for information on parts in the catalog.'
};

//returns a connect.workflow.response context
const mainSystemPrompt: string = `
  You are an assistant helping users get information on electronics parts.
  You detect what kind of information the user is looking for in the form of intents.
`;

const supportedIntents: string = `
  It is your job to detect intents in the user prompt.
  For example, a user may ask 'I am looking for a diode part' and you would match this to the 'QueryParts' intent.  
  If a user asked 'What is the weather today?' you would match this to the 'Unknown' intent.  If the intent is 'Unknown', you will return a completion message redirecting the user to initiate a query for a part.
  You support the following intent definitions:
  - **QueryParts** The QueryParts intent is applied if the user is asking for information on a part or describing a part.
  - **QueryAssemblies** The QueryAssemblies intent is applied if the user is asking for information on an assembly or system or describing an assembly or system.
  - **Unknown** The Unknown intent is applied if neither the QueryParts or QueryAssemblies intent is matched.
`;

const completePartDescription: string = `
  A Part is complete when all properties for the part have values, 
  including a partId and assemblyId in the id field, and a name and description.  
  Here is an example of a complete Part JSON:
  ${JSON.stringify(completePartExample)}
`;

const validPartDescription: string = `
  A Part is valid when it is complete and all values have been validated and the isValid property is true.
  Here is an example of a valid Part JSON:
  ${JSON.stringify(validPartExample)}
`;

const isResultComplete = (result: Part) => {
  return  result.description &&
      result.name &&
      result.id.assemblyId &&
      result.id.partId;
};

const isResultValid = (result: Part) => {
  return  result.description &&
      result.name &&
      result.id.assemblyId &&
      result.id.partId && 
      result.isValid;
};

const isInvalid = (prompt: WorkflowPrompt) => {
  const part: PartRecordList = prompt.prompt.context as PartRecordList;
  return part.isValid === false;
};

const  getStepTarget = (prompt: WorkflowPrompt, intent: string): string => {
  if (prompt.targets?.[intent]){
    return prompt.targets[intent];
  }
  return undefined;
};

const listParts = (parts: Array<PartRecord>): string => {
  const result: Array<string> = [];
  parts.forEach((part) => {
    result.push(` - ${part.name}`);
  });
  return result.join(' ');
};

const listAssemblies = (assemblies: Array<AssemblyRecord>): string => {
  const result: Array<string> = [];
  assemblies.forEach((assembly) => {
    result.push(` - ${assembly.system}`);
  });
  return result.join(' ');
};
export const handleWorkflowPrompt = async ( apiKey: string, prompt: WorkflowPrompt ): Promise<WorkflowResponse> => {
  console.log('**** handleWorkflowPrompt called', prompt);
  const startCode = '```';
  const endCode = '```';
  const openai = new OpenAI({ apiKey: apiKey });
  //is there a result?  if so, check it
  if (prompt.result && isResultComplete(prompt.result as Part)){
    return {
      type: 'connect.workflow.response',
      id: {
        workflowId: prompt.id.workflowId
      },
      completion: {
        type: 'connect.completion',
        text: `🎉  We have found the details for your part! Here is the full record:
            ${startCode}
            ${JSON.stringify(prompt.result)}
            ${endCode}
        `
      },
      result: prompt.result
    };
  }

  /*if (prompt.result && isInvalid(prompt)){
    //remove the assembly
    const newResult: Part = {...(prompt.result as Part)};
    newResult.id.assemblyId = undefined;
      
    return {
      type: 'connect.workflow.response',
      id: {
        workflowId: prompt.id.workflowId
      },
      completion: {
        type: 'connect.completion',
        text: ` The system you gave doesn't match the assemblies that apply to the part. 
        Can you re-check your system and try again?
        `
      },
      step: {
        type:'connect.workflow.step',
        id: {
          workflowId: prompt.id.workflowId,
          stepName: 'QueryAssemblies',
        },
        intent: 'QueryAssemblies',
        context: {
          type:'connect.prompt',
          text: 'There are multiple assemblies for this part, which system do you have?'
        },
      },
      result: prompt.result
    };
  }

  if (prompt.result && isResultComplete(prompt.result as Part)){
    const step : WorkflowStep = {
      type: 'connect.workflow.step',
      id:  {
        workflowId: prompt.id.workflowId,
        stepName: 'QueryParts'
      },
      intent: 'QueryParts',
      target:  getStepTarget(prompt, 'QueryParts'),
      context: { 
        type: 'connect.prompt',
        text: 'Please validate this part record',
        context: prompt.result
      },
    }
    return {
      type: 'connect.workflow.response',
      id: {
        workflowId: prompt.id.workflowId
      },
      step: step,
      result: prompt.result
    };
  }*/

  //is there context attached to the prompt?
  const hasContext = prompt.prompt.context !==  undefined;
  if (hasContext){
    const context = prompt.prompt.context;
    //is it a parts response?
    if (context.type === 'connect.demo.partRecordList'){
      const partsList: PartRecordList =  context as PartRecordList;
      //are there parts in the list?
        //if list is empty, then prompt the user to try a different search
      if (partsList.items.length === 0){
        return {
          type: 'connect.workflow.response',
          id: {
            workflowId: prompt.id.workflowId
          },
          completion: {
            type: 'connect.completion',
            text: 'No parts found, please try a different query.'
          },
          result: prompt.result
        };
      }
      //is there more than one?
      if (partsList.items.length > 1){
        //prompt the user to refine their search
        return {
          type: 'connect.workflow.response',
          id: {
            workflowId: prompt.id.workflowId
          },
          completion: {
            type: 'connect.completion',
            text: `Multiple parts were found. 
              ${listParts(partsList.items)}
            Please refine your query.`
          },
          result: prompt.result
        };
      }
      //is there one - but multiple assemblies
      if (partsList.items.length === 1){
        //prompt user to 
        //build initial part context and return completion to query assembly
        const  part: Part = {
          id: {},
          type: 'connect.demo.part'
        };
        part.id.partId = partsList.items[0].partId;
        part.name = partsList.items[0].name;
        part.description = partsList.items[0].description;
        return {
          type: 'connect.workflow.response',
          id: {
            workflowId: prompt.id.workflowId
          },
          completion: {
            type: 'connect.completion',
            text: 'There are multiple assemblies for this part, which system do you have?'
          },
          step: {
            type:'connect.workflow.step',
            id: {
              workflowId: prompt.id.workflowId,
              stepName: 'QueryAssemblies',
            },
            intent: 'QueryAssemblies',
            context: {
              type:'connect.prompt',
              text: 'There are multiple assemblies for this part, which system do you have?'
            }
          },
          result: part
        };
      }
      
    }
    //is it an assembly response?
    if (context.type === 'connect.demo.assemblyRecordList'){
        const assemblyList: AssemblyRecordList = context as AssemblyRecordList;
        //are there parts in the list?
        //if list is empty, then prompt the user to try a different search
        if (assemblyList.items.length === 0){
          return {
            type: 'connect.workflow.response',
            id: {
              workflowId: prompt.id.workflowId
            },
            completion: {
              type: 'connect.completion',
              text: 'No matches found, please try a different query.'
            },
            step: {
              type:'connect.workflow.step',
              id: {
                workflowId: prompt.id.workflowId,
                stepName: 'QueryAssemblies',
              },
              intent: 'QueryAssemblies',
              context: {
                type:'connect.prompt',
                text: 'There are multiple assemblies for this part, which system do you have?'
              },
            },
            result: prompt.result
          };
        }
        //is there more than one?
        if (assemblyList.items.length > 1){
        //prompt the user to refine their search
        return {
          type: 'connect.workflow.response',
          id: {
            workflowId: prompt.id.workflowId
          },
          completion: {
            type: 'connect.completion',
            text: `Multiple assemblies were found.
            ${listAssemblies(assemblyList.items)}
            Please refine your query. `
          },
          step: {
            type:'connect.workflow.step',
            id: {
              workflowId: prompt.id.workflowId,
              stepName: 'QueryAssemblies',
            },
            intent: 'QueryAssemblies',
            context: {
              type:'connect.prompt',
              text: 'There are multiple assemblies for this part, which system do you have?'
            },
          },
          result: prompt.result
        };
      }
      //is there one - go to resolve step
      if (assemblyList.items.length === 1){
            //prompt user to 
            //build initial part context and return completion to query assembly
            const  part: Part = prompt.result as Part;
            part.id.assemblyId = assemblyList.items[0].assemblyId;
            return {
              type: 'connect.workflow.response',
              id: {
                workflowId: prompt.id.workflowId
              },
              step:{
                type: 'connect.workflow.step',
                id: {
                  stepName: 'CheckResult',
                  workflowId: prompt.id.workflowId
                },
                intent: 'StepWorkflow',
                context: {
                  type: 'connect.workflow.prompt',
                  id: {
                    workflowId: prompt.id.workflowId
                  },
                  prompt:{
                    type: 'connect.prompt',
                    text: '',
                    context: part
                  }    
                }
              },
              result: part
            };
        }
    }

  }
  if (!hasContext){
    //query openAI
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    messages.push({ 
      role: 'system', 
      content: `
      ${mainSystemPrompt}
      ${supportedIntents}
      Some example responses are:
      QueryParts: ${JSON.stringify(QueryPartsResponseExample)}
      QueryAssemblies: ${JSON.stringify(QueryAssembliesResponseExample)}
      Unknown: ${JSON.stringify(UnknownResponseExample)}
      `
    });
    messages.push({ role: 'user', content: `
      Please determine if the following text matches the QueryParts, QueryAssemblies, or Unknown intent.
      If the intent is unknown, include a message in the 'completion' prop redirecting the user to ask about parts.
      Return a response  in  a  JSON  format like this:
      interface IntentDetectionResponse {
        intent: 'QueryParts' | 'QueryAssemblies' | 'Unknown';
        completion?: string;
      }
      Here is the prompt from the user:
      ${prompt.prompt.text}
      ` });
  
    const chatCompletion = await openai.chat.completions.create({
      messages,
      model: OPENAI_MODEL,
      response_format: {type:"json_schema", json_schema: intentDetectionSchema}
    });

    if (chatCompletion?.choices.length > 0) {
      const detectionResponse = chatCompletion.choices[0].message.content;
      const workflowId = crypto.randomUUID()
      if (detectionResponse) {
        const detection: IntentDetectionResponse = JSON.parse(detectionResponse);
        let step: WorkflowStep | undefined;
        if (detection.intent === 'QueryParts'){
          step = {
            type: 'connect.workflow.step',
            id:  {
              workflowId,
              stepName: 'QueryParts'
            },
            intent: 'QueryParts',
            target:  getStepTarget(prompt, 'QueryParts'),
            context: prompt.prompt,
          }
        }
        if (detection.intent === 'QueryAssemblies'){
          step = {
            type: 'connect.workflow.step',
            id:  {
              workflowId,
              stepName: 'QueryAssemblies'
            },
            intent: 'QueryAssemblies',
            context: prompt.prompt
          }
         
        }
        const result: WorkflowResponse = {
          type: 'connect.workflow.response',
          id: {
            workflowId
          },
          step
        };
        if (detection.completion){
          result.completion = {
              type: 'connect.completion',
              text: detection.completion,
          };
        }
        return result;
      }

    }
  }




  throw new ServerError('request could not be handled');
};
