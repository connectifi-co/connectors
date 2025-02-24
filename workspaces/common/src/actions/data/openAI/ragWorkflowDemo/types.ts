import type { Context } from '@finos/fdc3';
import { ResponseFormatJSONSchema } from 'openai/resources';
import { Completion, Prompt } from '../../../../types';

export const intentDetectionSchema: ResponseFormatJSONSchema.JSONSchema = {
  "name": "intentsdetected",
  "schema": {
    "type": "object",
    "properties": {
      "intent": {
        "type": "string",
        "enum": ["QueryParts", "QueryAssemblies","Unknown"]
      },
      "completion": {
        "type": "string"
      }
    },
    "required": ["intent"]
  }
};

export const partRecordListSchema: ResponseFormatJSONSchema.JSONSchema = {
    "name": "partRecordList",
    "schema": {
      "type": "object",
      "properties": {
        "type": {
            "const": "connect.demo.partRecordList"
        },
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "partId": {
                        "type": "string"
                    },
                    "assemblies": {
                        "type": "array",
                        "items": {
                            "type": "string"
                        }
                    },
                    "name": {
                        "type": "string"
                    },
                    "description": {
                        "type": "string"
                    }
                }
            }
        }
      },
      "required": ["partId", "assemblies", "name", "description"]
    }
  };

  export const assemblyRecordListSchema: ResponseFormatJSONSchema.JSONSchema = {
    "name": "assemblyRecordList",
    "schema": {
      "type": "object",
      "properties": {
        "type": {
            "const": "connect.demo.assemblyRecordList"
        },
        "items": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "assemblyId": {
                        "type": "string"
                    },
                    "system": {
                        "type": "string"
                    }
                }
            }
        }
      },
      "required": ["assemblyId", "system"]
    }
  };

  
export interface Part extends Context {
  type: "connect.demo.part";
  id: {
      partId?: string;
      assemblyId?: string;
      systemId?: string;
  };
  name?: string;
  description?: string;
}

export interface PartRecord {
    partId: string;
    assemblies: Array<string>;
    name: string;
    description: string;
}

export interface PartRecordList extends Context {
    type: "connect.demo.partRecordList";
    items: Array<PartRecord>;
}

export interface AssemblyRecord {
    assemblyId: string;
    system: string;
}

export interface AssemblyRecordList extends Context {
    type: "connect.demo.assemblyRecordList";
    items: Array<AssemblyRecord>;
}
//receives a connect.workflow.prompt context
//prompt is the prompt to be evaluated by the workflow
//result is the context result that may be persisted and appended to over multiple workflow steps
export interface WorkflowPrompt extends Context {
    type:'connect.workflow.prompt';
    id: {
      workflowId?: string;
    };
    prompt: Prompt;
    result?: Context;
}

//a step instructs an app on next step to take in the workflow - which is raising the supplied intent and context
export interface WorkflowStep extends Context {
  type: 'connect.workflow.step';
  id: {
    workflowId: string;
    stepName: string;
  };
  intent: string;
  context:  Context;
}


export interface WorkflowResponse extends Context {
  type: 'connect.workflow.response';
  id: {
    workflowId: string;
  };
  completion?: Completion;
  info?: string;
  step?: WorkflowStep;
  result?: Context;
}

export interface IntentDetectionResponse {
  intent: 'QueryParts' | 'QueryAssemblies' | 'Unknown';
  completion?: string;
}
