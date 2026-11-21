// import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient({
//   plugins: [jwtClient()],
// });
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";



export const authClient = createAuthClient({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_CLIENT_URL || process.env.BETTER_AUTH_URL,
  plugins: [
    inferAdditionalFields({
      user: {
        accountType: {
          type: "string",
          required: false,
        },
        businessName: {
          type: "string",
          required: false,
        },
      },
    }),
    adminClient(),
    jwtClient(),
  ],
});


