import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
// import { Resend } from "resend";
import { admin } from "better-auth/plugins";

const globalForMongo = globalThis as unknown as { mongoClient?: MongoClient };

const client =
  globalForMongo.mongoClient ??
  new MongoClient(process.env.MONGODB_URI as string, {
    maxPoolSize: 5, // free Atlas has a connection limit
    serverSelectionTimeoutMS: 10000, // fail fast instead of waiting 30s
    maxIdleTimeMS: 5000, // drop idle connections before they go stale
  });

globalForMongo.mongoClient = client;
await client.connect();
const db = client.db("wedplan");
// const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_CLIENT_URL,
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_CLIENT_URL,
  ] as string[],
  emailAndPassword: {
    enabled: true,
    // sendResetPassword: async ({ user, url, token }, request) => {
    //   try {
    //     await resend.emails.send({
    //       from: "Acme <onboarding@resend.dev>",
    //       to: user.email,
    //       subject: "Reset your password",
    //       text: `<p>Click the link below to reset your password:</p><a href="${url}">Reset Password</a>`,
    //     });
    //   } catch (error) {
    //     console.error("Failed to send password reset email:", error);
    //     throw new Error("Could not send reset email");
    //   }
    // },
  },
  user: {
    additionalFields: {
      accountType: {
        type: ["customer", "vendor"],
        required: false,
        defaultValue: "customer",
        input: true,
      },
      /** Vendors supply the public business name at sign-up; customers leave it empty. */
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      /** Default plan; not user-editable at registration. */
      subscriptionPlan: {
        type: ["free", "premium"],
        required: false,
        defaultValue: "free",
        input: false,
      },
      /** Expiration date for premium subscription (e.g. 90 days). */
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
      /** Accounts start unblocked; only admins should flip this. */
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  database: mongodbAdapter(db, {
    client,
  }),
  plugins: [
    // jwt(),
    admin({
      defaultRole: "user",
    }),
  ],
  // session: {
  //   cookieCache: {
  //     enabled: true,
  //     strategy: "jwt",
  //     maxAge: 7 * 24 * 60 * 60,
  //   },
  // },
});
