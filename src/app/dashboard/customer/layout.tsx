import RequireClientSessionForUser from "@/lib/api/RequireSession";
import React from "react";

const CustomerDashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  await RequireClientSessionForUser("customer");
  return children;
};

export default CustomerDashboardLayout;
