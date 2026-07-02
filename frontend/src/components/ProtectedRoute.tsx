import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

export default function ProtectedRoutes({children}:{children:React.ReactNode}){
    const {user,loading} = useAuth();
    if (loading) {
        return (
        <div className="flex items-center justify-center min-h-[calc(100vh-73px)]">
            <p className="text-slate-500 text-sm">Loading...</p>
        </div>
        );
    }

    // if(!user){
    //     return <Navigate to='/login' replace/>
    // }

    return <>{children}</>;

}