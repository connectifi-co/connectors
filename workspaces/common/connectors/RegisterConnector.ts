import { ConnectorRegistry } from './ConnectorRegistry';
import { Connector } from './Connector'; 

/**
 * A type representing a constructor function.
 * @template T - The type of object to construct.
 */
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * A decorator function that automatically registers a connector instance
 * with the provided registry.
 *
 * @param registry - The `ConnectorRegistry` instance where the connector will be registered.
 * @returns {Function} A function that takes a class (target) and, optionally, a context,
 *                     and returns a new class that registers an instance of itself upon instantiation.
 *
 * @example
 * '@registorConnector(registryInstance)`
 * class MyConnector extends AbstraceBaseConnector {
 *   // Implementation details...
 * }
 *
 */
export function registerConnector(registry: ConnectorRegistry) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function <T extends Constructor<Connector>>(target: T, context?: any): T | void { // context arg is required for execution within jest
    if (typeof target !== 'function') {
      throw new Error('Decorator applied to a non-class target.');
    }

    // Define a new class extending the target
    class NewConnector extends target {
      constructor(...args: any[]) {
        super(...args); // Call the original constructor
        registry.register(this); // Register the instance
      }
    }

    return NewConnector; // Return the modified class
  };
}