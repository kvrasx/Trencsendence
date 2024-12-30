import { Navbar } from "./navbar";
import { ToastContainer } from 'react-toastify';

export const Layout = ({ children }) => {
  return (
    <div className="h-screen bg-dark-image bg-cover bg-no-repeat bg-center relative flex">
      <Navbar />
      <main className="pl-16 w-full h-screen py-5 overflow-auto">
        <div className="p-8 mx-5 flex-1 h-full py-8 animate-fade-in scrollbar">
          {children}
        </div>
      </main>
      <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose="2000" />
    </div>
  );
};