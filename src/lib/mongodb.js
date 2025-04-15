'use client';

import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

// Check if we're in production mode or if IS_DEMO is set to true
const isDemo = process.env.IS_DEMO === 'true';

if (!uri && !isDemo) {
  throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development' || isDemo) {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._mongoClientPromise) {
    // For demo mode, we'll provide mock functionality
    if (isDemo) {
      // Mock client that doesn't actually connect
      const mockClientPromise = Promise.resolve({
        connect: () => Promise.resolve(),
        db: () => ({
          // Add mock methods as needed
        }),
      });
      global._mongoClientPromise = mockClientPromise;
    } else {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  if (isDemo) {
    // Mock client for production demo mode
    clientPromise = Promise.resolve({
      connect: () => Promise.resolve(),
      db: () => ({
        // Add mock methods as needed
      }),
    });
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise; 