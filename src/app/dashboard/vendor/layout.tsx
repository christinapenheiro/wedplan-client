import RequireClientSessionForUser from '@/lib/api/RequireSession';
import React from 'react';

const VendorDashboardLayout = async({children}:{children: React.ReactNode}) => {
    await RequireClientSessionForUser("vendor")
    return children;
};

export default VendorDashboardLayout;