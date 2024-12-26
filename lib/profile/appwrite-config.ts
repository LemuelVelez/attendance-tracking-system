import { Client, Account, Databases, Storage } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

// Initialize Appwrite Services
const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);

// Define environment variables
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "";
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const AVATAR_BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_AVATAR_BUCKET_ID || "";

// Helper function for environment validation
const validateEnvVariables = () => {
  if (!USERS_COLLECTION_ID || !DATABASE_ID || !AVATAR_BUCKET_ID) {
    throw new Error("Missing Appwrite environment variables. Please check your .env file.");
  }
};
validateEnvVariables();

export { client, account, databases, storage, USERS_COLLECTION_ID, DATABASE_ID, AVATAR_BUCKET_ID };

