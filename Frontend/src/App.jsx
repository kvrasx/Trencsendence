import { Layout } from '@/components/custom/layout'
import { Routes, Route, Navigate } from 'react-router-dom';
import { XOGame } from './pages/x_o'
import { Chat } from './pages/chat'
import { Notifications } from './pages/notifications'
import { Leaderboard } from './pages/leaderboard'
import Error404 from './pages/error404';
import Profile from './pages/profile';
import Auth from './pages/auth'
import { createContext, useState, useEffect } from 'react';
import { UserContext } from '@/contexts'
import Logout from './pages/logout';
import Spinner from '@/components/ui/spinner';
import Cookies from 'js-cookie';
import { get } from '@/lib/ft_axios';
import OAuthHandle from './pages/oauth';


function App() {
  
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const starting = () => {
      let storedUser = localStorage.getItem('user');
      if (storedUser) {
        storedUser = JSON.parse(storedUser);
        setUser(storedUser);
      }
      setReady(true);
    };
  
    starting();
  }, []);

  return (
    <>
      {(ready) ? (
        <UserContext.Provider value={user}>
          <Routes>
            <Route path="/" element={(user) ? <Navigate to="/profile" /> : <Auth setUser={setUser} />} />
            <Route path="/profile" element={<Layout><Profile user={user} setUser={setUser} /></Layout>} />
            <Route path="/chat" element={<Layout><Chat /></Layout>} />
            <Route path="/notifications" element={<Layout><Notifications/></Layout>} />
            <Route path="/logout" element={<Layout><Logout setUser={setUser} /></Layout>} />
            <Route path="/oauth-callback" element={<OAuthHandle />} />
            <Route path="/leaderboard" element={<Layout><Leaderboard/></Layout>} />
            <Route path="*" element={<Layout><Error404 /></Layout>} />
          </Routes>
        </UserContext.Provider>
      ) : (

        <div className="flex justify-center items-center h-screen">
          <Spinner h="16" w="16" />
        </div>

      )}
    </>
  )
}

export default App