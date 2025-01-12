import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios'

export default function Logout({ setUser }) {
  const [navigateTo, setNavigateTo] = useState(null);

  useEffect(() => {
    const req = async () => {
      try {
        const res = await axios.get(`http://${import.meta.env.VITE_HOST}/auth/logout`, { withCredentials: true });
        if (res?.data?.success) {
          console.log(res);
          toast.success("You've logged out! See you 👋");
          document.cookie = 'access_token=; Max-Age=0; path=/; domain=yourdomain.com';
          document.cookie = 'refresh_token=; Max-Age=0; path=/; domain=yourdomain.com';
        }
      } catch (e) {
        toast.error("You're already logged out.")
      }
      setNavigateTo('/');
    };
    setUser(null);
    req();
  }, []);
  return (
    <>
      {/* <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose={800} /> */}
      {navigateTo && <Navigate to={navigateTo} />}
    </>
  );
};