import { Navbar } from "./navbar";
import { ToastContainer } from 'react-toastify';
import SearchBar from "./searchbar";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark-image bg-cover bg-no-repeat bg-center relative flex flex-col">
      <SearchBar />
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