import { Navbar } from "./navbar";
import { ToastContainer } from 'react-toastify';
import SearchBar from "./searchbar";
import { useEffect, useState } from "react";
import Cookies from 'js-cookie';



export const Layout = ({ children }) => {
  const [count, setCount] = useState(0);
  
  const token = Cookies.get('access_token');
  const socket = new WebSocket(`ws://127.0.0.1:8000/ws/?token=${token}`);
  useEffect(() => {

    socket.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
        console.log("--------->", data);
        setCount(data.count);
    };

    socket.onerror = (e) => {
      console.log("error");
    }
    socket.onclose = (e) => {
      console.log("error");
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);
  return (
    <div className="min-h-screen bg-dark-image bg-cover bg-no-repeat bg-center relative flex flex-col">
      <SearchBar count={count} socket={socket} setCount={setCount} />
      <div className="flex flex-1">
        <Navbar />
        <main className="md:container pl-16 w-full h-full pt-16 overflow-auto">
          <div className="p-8 mx-5 flex-1 h-full py-8 animate-fade-in scrollbar">
            {children}
          </div>
        </main>
      </div>
      {/* <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose="2000" /> */}
    </div>
  );
};