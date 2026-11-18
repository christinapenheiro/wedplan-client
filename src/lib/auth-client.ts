// import { createAuthClient } from "better-auth/react";
// import { jwtClient } from "better-auth/client/plugins";
// export const authClient = createAuthClient({
//   plugins: [jwtClient()],
// });
import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});


