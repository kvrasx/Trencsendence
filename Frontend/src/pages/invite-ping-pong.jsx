import { Navigate, useParams } from "react-router-dom";
import Profile from "./profile";
import { get } from '@/lib/ft_axios';
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import Error404 from "./error404";
import Spinner from '@/components/ui/spinner';
import {Layout} from "@/components/custom/layout";
import PingPongGame from "../components/custom/ping-pong-game";
import { Game } from "./game";


export default function InvitePingPong({}) {

    const { id, tournament_id } = useParams();
    
    console.log("tourbament id", tournament_id);
    
    const [match, setMatch] = useState(null);
    const [error404, setError404] = useState(false);

    
    useEffect(() => {
        const getMatch = async () => {
            try {
                let res = await get('/check-match/' + id + (tournament_id !== undefined ? '/' + tournament_id : ""));
                setMatch(res);
            } catch (e) {
                if (e?.response?.status === 404) {
                    setError404(true);
                } else {
                    toast.error("Failed to get match info. Please try again.");
                    window.location.href = '/';
                }
            }
        }
        getMatch();
    }, [id]);

    if (error404) {
        return <Error404 />
    }

    return (
        <>
            {match ? (
                <Game RemoteGameComponent={PingPongGame} waitingstate={true} websocketUrl={`wss://${import.meta.env.VITE_HOST}/ws/ping_pong/` + id + '/' + (tournament_id !== undefined ? tournament_id + '/' : "")} />
            ) : (
                <div className="flex justify-center items-center">
                    <Spinner w="16" h="16" />
                </div>
            )}
            {/* <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose={1000} /> */}
        </>
    )
}