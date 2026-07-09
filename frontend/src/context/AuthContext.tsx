import { createContext, useEffect, useState } from "react";
import type {AuthContextType, User} from "../types/user.types";
import axios from "axios";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";
axios.defaults.withCredentials = true;

export const AuthProvider = ({children}:{children:React.ReactNode})=>{
    const [user,setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(()=>{
        checkAuth();
    },[]);

    const checkAuth = async()=>{
        try {
            const res = await axios.get("/api/auth/me");
            setUser(res.data.user);
        }catch(error){
            console.log(error);
            setUser(null);
        }finally{
            setLoading(false);
        }
    }

    const login =async(email:string,password:string)=>{
        const res = await axios.post("/api/auth/login",{email,password});
        setUser(res.data.user);
    }

    const register = async(name:string,email:string,password:string)=>{
        const res = await axios.post("/api/auth/register",{name,email,password});
        return res.data ;
    }

    const logout = async ()=>{
        await axios.post("/api/auth/logout");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{user,login,register,logout,loading,checkAuth}}>
            {children}
        </AuthContext.Provider>
    )

}