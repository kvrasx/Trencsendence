import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { get } from '@/lib/ft_axios'
import { toast, ToastContainer } from 'react-toastify';
import Spinner from '@/components/ui/spinner';

export default function OAuthHandle() {

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const user = await get('/api/user/get-info');
                localStorage.setItem('user', JSON.stringify(user));
            } catch (e) {
                toast.error("Something went wrong. Please try again.");
                console.log(e);
            } finally {
                window.location.href = "/";
            }
        };

        fetchUserInfo();
    }, []);

    return (
        <>
            <div className="flex justify-center items-center h-screen">
                <Spinner h="16" w="16" />
            </div>
            {/* <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose={1000} /> */}
        </>
    );
}