import { Navbar } from "./navbar";
import { ToastContainer } from 'react-toastify';
import SearchBar from "./searchbar";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';
import connect_websocket from "@/lib/connect_websocket";


export const Layout = ({ children }) => {
  const [count, setCount] = useState(0);
  
  const socket = connect_websocket(`wss://${import.meta.env.VITE_HOST}/ws/`);
  const onlineStatusSocket = connect_websocket(`wss://${import.meta.env.VITE_HOST}/ws/online/`);
  useEffect(() => {

    socket.onopen = () => {
      console.log('Connected to WebSocket server notifs');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
        console.log("--------->", data);
        setCount(data.count);
    };

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);
  return (
    <div className="min-h-screen bg-dark-image bg-cover bg-no-repeat bg-center relative flex flex-col ">
      <SearchBar count={count} socket={socket} setCount={setCount} />
      <div className="flex flex-1">
        <Navbar />
        <main className="md:container pl-16 w-full h-full pt-16 overflow-auto themed-scrollbar">
          <div className="p-8 mx-5 flex-1 h-full py-8 animate-fade-in scrollbar ">
            {children}
          </div>
        </main>
      </div>
      {/* <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose="2000" /> */}
    </div>
  );
};