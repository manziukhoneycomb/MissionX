import { Clerk } from '@clerk/clerk-js';

const clerkInstance = new Clerk(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

if (clerkInstance) {
  clerkInstance.load().catch((error) => {
    console.error('Error loading Clerk instance:', error);
  });
}

export default clerkInstance;
