import { Client, Account } from "appwrite";

// Initialize the Appwrite Client
const client = new Client();
client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "") // Your Appwrite Endpoint
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ""); // Your Project ID

// Initialize Appwrite Services
const account = new Account(client);

// Helper function for environment validation
const validateEnvVariables = () => {
  if (
    !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
    !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
  ) {
    throw new Error(
      "Missing Appwrite environment variables. Please check your .env file."
    );
  }
};
validateEnvVariables();

/**
 * Send a password recovery email to the user.
 * @param email - The email address of the user who needs to recover their password.
 */
export const sendPasswordRecovery = async (email: string) => {
  try {
    // Validate email input
    if (!email) {
      throw new Error("Email is required for password recovery.");
    }

    // Send password recovery email
    const promise = account.createRecovery(
      email,
      `${process.env.NEXT_PUBLIC_APP_URL}/recover/reset-password` // Redirect URL after password reset
    );

    promise.then( 
      function(response) {
        console.log("Password recovery email sent:", response); // Success
      },
      function(error) {
        console.error("Error sending password recovery email:", error); // Failure
      }
    );

    return promise;
  } catch (error) {
    console.error("Error in sendPasswordRecovery:", error);
    throw error;
  }
};

/**
 * Send a password recovery email to the user.
 * @param email - The email address of the user who needs to recover their password.
 * @param url - The URL to redirect the user after they click the recovery link.
 */
export const forgotPassword = async (email: string, url: string) => {
  try {
    // Validate email input
    if (!email || !url) {
      throw new Error("Email and URL are required for password recovery.");
    }

    // Send password recovery email
    const promise = account.createRecovery(email, url);

    return promise.then(
      function(response) {
        console.log("Password recovery email sent:", response); // Success
      },
      function(error) {
        console.error("Error sending password recovery email:", error); // Failure
      }
    );
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    throw error;
  }
};

/**
 * Complete the password recovery process and reset the user's password.
 * @param userId - The user ID of the account to reset the password for.
 * @param secret - The secret token sent to the user during recovery.
 * @param pass - The new password to be set for the user.
 */
export const completePasswordRecovery = async (
  userId: string,
  secret: string,
  pass: string
) => {
  try {
    // Validate the inputs
    if (!userId || !secret || !pass) {
      throw new Error("All fields are required to complete password recovery.");
    }

    // Update the user's password using Appwrite Account service
    const promise = account.updateRecovery(userId, secret, pass);

    return promise.then(
      function(response) {
        console.log("Password recovery completed successfully:", response); // Success
      },
      function(error) {
        if (error.message.includes("Invalid `password` param")) {
          console.error(
            "Error completing password recovery: AppwriteException: Invalid `password` param: Password must be between 8 and 265 characters long, and should not be one of the commonly used passwords."
          ); // Detailed error handling for password issues
        } else {
          console.error("Error completing password recovery:", error); // General failure
        }
      }
    );
  } catch (error) {
    console.error("Error in completePasswordRecovery:", error);
    throw error;
  }
};
