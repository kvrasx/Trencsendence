import { Layout } from '@/components/custom/layout'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LocalTicTacToe, TicTacToe } from './pages/tic-tac-toe'
import { Chat } from './pages/chat'
import { Leaderboard } from './pages/leaderboard'
import Error404 from './pages/error404';
import Profile from './pages/profile';
import Auth from './pages/auth'
import { createContext, useState, useEffect } from 'react';
import { UserContext } from '@/contexts'
import Logout from './pages/logout';
import Spinner from '@/components/ui/spinner';
import { get } from '@/lib/ft_axios';
import OtherProfile from './pages/other-profile';
// import PingPong from './pages/ping-pong';
import InvitePingPong from './pages/invite-ping-pong';
import Canvas from './components/custom/localgame';

import { toast, ToastContainer } from 'react-toastify';
import { Game } from './pages/game';
import PingPongGame from './components/custom/ping-pong-game';
import Tournament from './pages/tournament';

function PingPongPage() {
  return <Game
    key="ping-pong"
    RemoteGameComponent={PingPongGame}
    websocketUrl={`ws://${import.meta.env.VITE_HOST}/ws/ping_pong/random/`}
<<<<<<< HEAD
    LocalGameComponent={Canvas}
=======
>>>>>>> master
  />
}

function TicTacToePage() {
  return <Game
    key="tic-tac-toe"
    RemoteGameComponent={TicTacToe}
    websocketUrl={`ws://${import.meta.env.VITE_HOST}/ws/game/random/`}
    LocalGameComponent={LocalTicTacToe}
  />
}

function App() {

  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {

    const starting = async () => {
      if (!user) {
        try {
          const storedUser = await get('user/get-info');
          if (storedUser) {
            setUser(storedUser);
          }
        } catch (e) {

          if (e === 401)
            setUser(null);

        } finally {
          setReady(true);
        }
      }
    };

    starting();
  }, []);

  return (
    <>
      {(ready) ? (
        <UserContext.Provider value={user}>
          <Routes>
            {user ? (
              <>
                <Route path="/" element={<Navigate to="/profile" />} />
                <Route path="/profile/:id" element={<Layout><OtherProfile myId={user.id} /></Layout>} />
                <Route path="/profile" element={<Layout><Profile user={user} setUser={setUser} /></Layout>} />
                <Route path="/chat" element={<Layout><Chat /></Layout>} />
                <Route path="/leaderboard" element={<Layout><Leaderboard /></Layout>} />
                <Route path="/ping-pong/:id" element={<Layout><InvitePingPong /></Layout>} />
<<<<<<< HEAD
                <Route path="/ping-pong" element={<Layout><PingPongPage  /></Layout>} />
=======
                <Route path="/ping-pong" element={<Layout><PingPongPage /></Layout>} />
>>>>>>> master
                <Route path="/tic-tac-toe" element={<Layout><TicTacToePage /></Layout>} />
                <Route path="/tournament" element={<Layout><Tournament /></Layout>} />
                <Route path="*" element={<Layout><Error404 /></Layout>} />
              </>
            ) : (
              <>
                <Route path="/" element={<Auth setUser={setUser} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
            <Route path="/logout" element={<Layout><Logout setUser={setUser} /></Layout>} />
          </Routes>
        </UserContext.Provider>
      ) : (

        <div className="flex justify-center items-center h-screen">
          <Spinner h="16" w="16" />
        </div>

      )}
      <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose={1500} />
    </>
  )
}

export default App