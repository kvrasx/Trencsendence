import { Navigate, useParams } from "react-router-dom";
import Profile from "./profile";
import { get } from '@/lib/ft_axios';
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Error404 from "./error404";
import Spinner from '@/components/ui/spinner';
import {Layout} from "@/components/custom/layout";


export default function OtherProfile({myId}) {

    const { id } = useParams();
    
    if (id == myId)        
        return <Navigate to="/profile" />
        
    const [user, setUser] = useState(null);
    const [error404, setError404] = useState(false);

    
    useEffect(() => {
        const getUser = async () => {
            try {
                let res = await get('/api/user/get-info?user_id=' + id);
                setUser(res);
            } catch (e) {
                if (e?.response?.status === 404) {
                    setError404(true);
                } else {
                    toast.error("Failed to get user info. Please try again.");
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1000);
                }
            }
        }
        getUser();
    }, [id]);

    if (error404) {
        return <Error404 />
    }

    return (
        <>
            {user ? (
                <Profile user={user} setUser={null} />
            ) : (
                <div className="flex justify-center items-center">
                    <Spinner w="16" h="16" />
                </div>
            )}
            <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose={1000} />
        </>
    )
}