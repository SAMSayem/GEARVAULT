import { betterAuth } from "better-auth";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is required");
}

const globalMongo = globalThis as typeof globalThis & {
  gearVaultMongo?: MongoClient;
};

const client = globalMongo.gearVaultMongo ?? new MongoClient(uri);

if (process.env.NODE_ENV !== "production") {
  globalMongo.gearVaultMongo = client;
}

const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.0.110:3000",
  "https://gearvault-l12a.vercel.app",
];

export const auth = betterAuth({
  appName: "GearVault",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(client.db(process.env.DB_NAME || "test"), {
    client,
  }),

  trustedOrigins,

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },

  socialProviders:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {},

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      phone: { type: "string", required: false },
      address: { type: "string", required: false },
      photoURL: { type: "string", required: false },
    },
  },
});
