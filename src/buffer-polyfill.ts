/**
 * Polyfill for Buffer in browser environment
 */

// Import the Buffer from the 'buffer' package
import { Buffer as BufferPolyfill } from 'buffer';

// Add Buffer to global environment if it doesn't exist
if (typeof window !== 'undefined') {
  window.global = window;
  window.process = window.process || { env: {} };
  
  // Make Buffer available globally
  if (typeof window.Buffer === 'undefined') {
    window.Buffer = BufferPolyfill;
  }
}

// Make available in the global scope
global.Buffer = global.Buffer || BufferPolyfill;

// Export for direct usage
export { BufferPolyfill as Buffer }; 