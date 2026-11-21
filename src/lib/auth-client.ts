// import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient({
//   plugins: [jwtClient()],
// });
import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { jwtClient } from "better-auth/client/plugins";



export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_CLIENT_URL,
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


