/**
 * Crypto Polyfill for React Native
 * 
 * Provides a minimal crypto implementation for bcryptjs
 * bcryptjs uses crypto.randomBytes which we need to polyfill
 */

const {randomBytes: getRandomBytes} = require('react-native-get-random-values');

// Create a minimal crypto polyfill that matches Node.js crypto API
const cryptoPolyfill = {
  randomBytes: function(size, callback) {
    const bytes = new Uint8Array(size);
    getRandomBytes(bytes);
    const buffer = Buffer.from(bytes);
    
    // Support callback-style API
    if (callback) {
      callback(null, buffer);
    }
    
    return buffer;
  },
  createHash: function() {
    // Minimal hash implementation - bcryptjs may not need this
    throw new Error('createHash not implemented in React Native crypto polyfill');
  },
};

// Export as CommonJS module for bcryptjs compatibility
module.exports = cryptoPolyfill;
