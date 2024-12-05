import { ConnectorRegistry } from './ConnectorRegistry';
import { Connector } from './Connector'; 

type Constructor<T = object> = new (...args: any[]) => T;

export function registerConnector(registry: ConnectorRegistry) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function <T extends Constructor<Connector>>(target: T, context?: any): T | void { // context arg is required for execution within jest
    if (typeof target !== 'function') {
      throw new Error('Decorator applied to a non-class target.');
    }

    // Define a new class extending the target
    class NewConstructor extends target {
      constructor(...args: any[]) {
        super(...args); // Call the original constructor
        registry.register(this); // Register the instance
      }
    }

    return NewConstructor; // Return the modified class
  };
}