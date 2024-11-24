// openai-integration-tests.spec.ts
import { Context } from '@finos/fdc3';
import { findSimilar } from '../findSimilarStructuredOutput'; // Adjust the import path accordingly
import { List } from '../../../../lib/types';

// set this via your env and run
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

describe('OpenAI Integration Tests', () => {
  const apiKey = OPENAI_API_KEY;
  const context: Context = {
    type: 'fdc3.instrument',
    id: {
      ticker: 'AAPL',
    },
  };

  it('should return a list of similar entities', async () => {
    const result:List = await findSimilar(apiKey, context);
    console.log(`findSimilar response: ${JSON.stringify(result)}`);

    expect(result.type).toBe('connect.list');
    expect(result.listType).toBe('fdc3.instrument');
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0].type).toBe('fdc3.instrument');
    expect(result.items[0].id).toHaveProperty('ticker');
  }, 10_000);

  it.skip('should handle unexpected errors gracefully', async () => {
    // You might need to adjust this test case based on your actual error handling
    await expect(findSimilar(apiKey, context)).resolves.not.toThrow();
  }, 10_000);
});