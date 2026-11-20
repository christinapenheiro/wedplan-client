import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../auth";

const RequireClientSessionForUser = async(accountType:string) => {
    "use server";
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session || !session?.user?.accountType || accountType !== session?.user.accountType) {
        // Redirect to login page or show an error
        redirect("/unauthorized")
    }
};

export default RequireClientSessionForUser;



export const RequireAdminSessionForUser = async (role: string) => {
  "use server";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    !session ||
    !session?.user?.role ||
    session?.user?.accountType ||
    role !== session?.user?.role
  ) {
    // Redirect to login page or show an error
    redirect("/unauthorized");
  }
};
