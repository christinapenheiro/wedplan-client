import { RequireAdminSessionForUser } from "@/lib/api/RequireSession";


const AdminDashBoardLayout = async({children}:{children:React.ReactNode}) => {
    await RequireAdminSessionForUser("admin");
    return children;
};

export default AdminDashBoardLayout;