// openai-integration-tests.spec.ts
import { Context } from '@finos/fdc3';
import { findSimilar } from '../findSimilar'; // Adjust the import path accordingly
import { List } from '../../../../types';

// set these via your env
const CFI_OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const CFI_OPENAI_INTEGRATION_TESTS = process.env.CFI_OPENAI_INTEGRATION || '';

describe('OpenAI Integration Tests', () => {
  if (CFI_OPENAI_INTEGRATION_TESTS === '') {
    it('Integration tests are disabled. Set env vars to enable them.', () => {
      console.log(
        'Integration tests are currently disabled. Please set the CFI_OPENAI_INTEGRATION and OPENAI_API_KEY environment variables to enable them.',
      );
    });
  } else {
    const apiKey = CFI_OPENAI_API_KEY;
    const context: Context = {
      type: 'fdc3.instrument',
      id: {
        ticker: 'AAPL',
      },
    };

    it('should return a list of similar instruments', async () => {
      const result: List = await findSimilar(apiKey, context);
      console.log(`findSimilar response: ${JSON.stringify(result)}`);

      expect(result.type).toBe('connect.list');
      expect(result.listType).toBe('fdc3.instrument');
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items[0].type).toBe('fdc3.instrument');
      expect(result.items[0].id).toHaveProperty('ticker');
    }, 10_000);

    it('should reject and throw due to incorrect API_KEY', async () => {
      await expect(findSimilar('badkey', context)).rejects.toThrow();
    }, 10_000);
  }
});
