import type { DataActionHandler } from '@connectifi/sdk';
import {
  Prompt,
  RequestError,
  ServerError,
} from '../../../types';
import { generate } from './generate';
import { summarize } from './summarize';
import { findSimilar } from './findSimilar';
import { generatePrompt } from './generatePrompt';
import { getEntities } from './getEntities';
import { getCompanySummary, getSimilarCompanies } from './financeAssistant';
import { getCompanyContrarianSummary, getSimilarContrarianCompanies } from './financeAssistant-contrarian';
import { getCompanyGrowthSummary, getSimilarGrowthCompanies } from './financeAssistant-growth';

const apiKey = process.env.OPEN_AI_API_KEY;

export const OPENAI_MODEL = 'gpt-4o-mini';

export const openAIHandler: DataActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('openAI api key missing');
  }
  
  const { context, intent } = params;
  switch (intent) {
    case "Generate":
      return generate(apiKey, context as Prompt);
    case "GeneratePrompt":
      return generatePrompt(apiKey, context);
    case "Summarize":
      return summarize(apiKey, context);
    case "FindSimilar":
      return findSimilar(apiKey, context);
    case "GetEntities":
      return getEntities(apiKey, context);
    default:
      throw new RequestError('intent not supported');
  }
};

export const openAIFinanceAssistantHandler: DataActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('openAI api key missing');
  }
  
  const { context, intent } = params;
  switch (intent) {
    case "Summarize":
      return getCompanySummary(apiKey, context);
    case "FindSimilar":
      return getSimilarCompanies(apiKey, context);
    default:
      throw new RequestError('intent not supported');
  }
};

export const openAIGrowthFinanceAssistantHandler: DataActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('openAI api key missing');
  }
  
  const { context, intent } = params;
  switch (intent) {
    case "Summarize":
      return getCompanyGrowthSummary(apiKey, context);
    case "FindSimilar":
      return getSimilarGrowthCompanies(apiKey, context);
    default:
      throw new RequestError('intent not supported');
  }
};

export const openAIContrarianFinanceAssistantHandler: DataActionHandler = async (params) => {
  if (!apiKey) {
    throw new ServerError('openAI api key missing');
  }
  
  const { context, intent } = params;
  switch (intent) {
    case "Summarize":
      return getCompanyContrarianSummary(apiKey, context);
    case "FindSimilar":
      return getSimilarContrarianCompanies(apiKey, context);
    default:
      throw new RequestError('intent not supported');
  }
};