import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import local from "@/assets/local.jpg"
import remote from "@/assets/remote.jpg"
import Spinner from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Cookies from 'js-cookie';
import connect_websocket from "../lib/connect_websocket";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Camera, UserPlus, Swords, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import defaultAvatar from '@/assets/profile.jpg';
import { RiWifiOffLine } from "react-icons/ri";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { Input } from '@/components/ui/input';
import { get } from "../lib/ft_axios";
import { toast } from "react-toastify";
import InviteButton from "../components/custom/invite-button";

export function Game({ websocketUrl, RemoteGameComponent, LocalGameComponent, waitingstate = false }) {

    const [waiting, setWaiting] = useState(waitingstate);
    const [started, setStarted] = useState(null);
    const [winner, setWinner] = useState(null);
    const [socket, setSocket] = useState(null);
    const [gamePongStartData, setPongGameStartData] = useState(null);
    const [friends, setFriends] = useState([])

    useEffect(() => {

        console.log(waiting);

        if (!waiting) {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }

        if (!waiting || started === "local")
            return;

        const websocket = connect_websocket(websocketUrl, () => {
            setWaiting(false);
            setStarted(null);
            setSocket(null);
        });


        websocket.onopen = (event) => {
            console.log("connected to websocket: ", event);

            setSocket(websocket)
        }

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data?.action === "game_start") {

                setStarted("remote");
                console.log("Game is ready to begin");

            } else if (data?.type === 'game_started') {

                console.log("Game is ready to begin");
                console.log(data);
                setPongGameStartData(data);
                setStarted("remote");
            };


            return () => {
                websocket.close();
            };
        }
    }, [waiting]);


    useEffect(() => {
        if (started) return;

        const fetchFriends = async () => {
            try {
                const res = await get('/getChats/');
                const chatPromises = res.map(async (chat) => {
                    const userRes = await get(`/api/user/get-info?user_id=${chat.user2}`);
                    chat.user2 = userRes;
                    return chat;
                });

                const cchats = await Promise.all(chatPromises);
                console.log(cchats);
                
                setFriends(cchats);

            } catch (error) {
                console.log('Error fetching chats:', error);
                toast.error("Failed to load chats. Please try again.")
            }
        };

        fetchFriends();

    }, [started])

    return (
        <>
            <div className="flex gap-6 h-[75vh]">

                <div className="p-5 flex-1 glass flex flex-row justify-center items-center">

                    {!winner ? (
                        waiting ? (
                            started ? (started === "remote" ? (
                                gamePongStartData ?
                                    <RemoteGameComponent websocket={socket} setWinner={setWinner} gameStartData={gamePongStartData} />
                                    :
                                    <RemoteGameComponent websocket={socket} setWinner={setWinner} />
                            ) : (
                                <LocalGameComponent setWinner={setWinner} />
                            )) : (

                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-3xl font-bold text-center mb-4 text-gray-300">Waiting for opponent...</div>
                                    <Spinner />
                                </div>
                            )
                        ) : (
                            <div className="flex gap-3">
                                <div className='inline space-y-4 space-x-'>
                                    <div className='border-y-2 border-white border-opacity-40 rounded-lg white w-72 h-80 flex justify-center items-center'>
                                        <RiWifiOffLine className='size-44 animate-pulse' />
                                    </div>
                                    <div className='flex justify-center items-center'>
                                        <button onClick={() => { setWaiting(true); setStarted("local") }} className='border-y-4 border-red-700 w-48 h-14 rounded-lg text-2xl hover:border-y-4 hover:border-blue-600 '>
                                            local mode
                                        </button>
                                    </div>
                                </div>
                                <div className='inline space-y-4'>
                                    <div className='border-y-2 p-3 flex space-x-3 justify-center items-center border-white border-opacity-40 rounded-lg white w-72 h-80'>
                                        <div className='w-28 h-full flex justify-center items-center'><GiPerspectiveDiceSixFacesRandom className='size-28 hover:animate-spin' /></div>
                                    </div>
                                    <div className='flex justify-center items-center space-x-7'>
                                        <button onClick={() => setWaiting(true)} className='border-y-4 border-green-700 w-32 h-14 rounded-lg text-lg hover:border-y-4 hover:border-blue-600 '>
                                            random match
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-3xl font-bold text-center mb-4 text-gray-300">Game Over!</div>
                            <div className="text-2xl font-bold text-center mb-4 text-gray-300">{winner}</div>
                            <Button variant="outline" className="w-full hover:bg-secondary" onClick={() => { setWinner(null); setWaiting(false); setStarted(false); socket && socket.close(); }}>
                                New Game
                            </Button>
                        </div>
                    )}





                </div>

                <Card className="glass w-1/4 px-5 py-8 space-y-6 flex flex-col ">
                    {!started ? (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-semibold text-center text-gray-400">Challenge Friends</h2>
                            <Input type="text flex-initial" placeholder="Search friends..." />
                            <div className="space-y-3 overflow-auto themed-scrollbar max-h-[63.4vh]">
                                {friends.map((friend, index) => (
                                    <div key={index} className=" flex justify-between items-center p-3 rounded-lg border-secondary border hover:shadow-lg transition-shadow duration-300 space-x-4">
                                        <div className="flex items-center gap-3 cursor-pointer">
                                            <Avatar className="flex-none w-11 h-11">
                                                <AvatarImage src={friend.user2.avatar} alt="user avatar" />
                                                <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                            </Avatar>
                                            <span className="text-md font-medium">{friend.user2.username}</span>
                                        </div>
                                        <div className="flex gap-3">

                                           <Link to={"/chat?chad_id="+friend.chat_id}>
                                                <Button variant="ghost" className="rounded-md border border-gray-500 hover:bg-secondary px-3" size="lg">
                                                    <MessageSquare className="" />
                                                </Button>
                                           </Link>
                                            
                                            <InviteButton type={"game"} defaultStatus={""} user_id={friend.user2.id} variant="ghost" className="rounded-md border border-gray-500 hover:bg-secondary px-3" size="lg" />


                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl text-center font-semibold text-gray-400">Match Recap</h2>
                                <div className="flex justify-between border border-gray-700 rounded-xl px-2 py-3">
                                    <div className="flex flex-col items-center gap-3 cursor-pointer">
                                        <Avatar className="flex-none w-16 h-16">
                                            <AvatarImage src={null} alt="user avatar" />
                                            <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                        </Avatar>
                                        <span className="text-md font-medium">{"ijaija"}</span>
                                    </div>
                                    <div className="text-center text-2xl font-bold text-gray-300 my-5">
                                        vs
                                    </div>
                                    <div className="flex flex-col items-center gap-3 cursor-pointer">
                                        <Avatar className="flex-none w-16 h-16">
                                            <AvatarImage src={null} alt="user avatar" />
                                            <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                        </Avatar>
                                        <span className="text-md font-medium">{"Ismail"}</span>
                                    </div>
                                </div>
                            </div>


                            <div className="flex flex-col gap-2">

                                <h3 className="text-md text-left font-semibold text-gray-300">Matches history</h3>
                                <div className="space-y-3 w-full  overflow-auto themed-scrollbar">

                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-3 rounded-lg  ${1 === 1 ? 'glass' : 'bg-secondary'}`}
                                        >
                                            <div>
                                                <div className="font-medium">vs {"sdfs"}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {"15/20/2025"}
                                                </div>
                                            </div>

                                            {1 === 1 && <div className="text-lg font-semibold">
                                                {"10:15".split(':').map(num => parseInt(num, 10)).join(' : ')}
                                            </div>}

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${true
                                                    ? "bg-green-500/20 text-green-500"
                                                    : "bg-red-500/20 text-red-500"
                                                    }`}
                                            >
                                                {true ? "Win" : "Loss"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </Card>

            </div>

        </>

    );
}
