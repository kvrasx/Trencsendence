import { useState, useEffect, createContext, useContext } from "react";
import { Card } from "@/components/ui/card";
import Spinner from "@/components/ui/spinner";
import Cookies from 'js-cookie';
import { RiWifiOffLine } from "react-icons/ri";
import { GiPerspectiveDiceSixFacesRandom } from "react-icons/gi";
import { GiTabletopPlayers } from "react-icons/gi";
import PingPongGame from "../components/custom/ping-pong-game";
import { BsEmojiSunglasses } from "react-icons/bs";
import useWebSocket from "react-use-websocket";
import Canvas from "../components/custom/localgame";





export default function PingPong({waitingstate, id=null}) {
    const token = Cookies.get('access_token');
    const [connectionUrl, setConnectionUrl] = useState(id ? `ws://127.0.0.1:8000/ws/ping_pong/${id}/?token=${token}` : null)
    const { sendMessage, lastMessage, readyState } = useWebSocket(connectionUrl, {
        onClose: (event) => {
            console.log('WebSocket closed with code:', event.code);
            console.log('Reason:', event.reason); // Optional: reason for closing
            
        },
    });
    const [started, setStarted] = useState(false);

    const [waiting, setWaiting] = useState(waitingstate);
    const [winner, setWinner] = useState(null);
    const [finish, setFinish] = useState(false);
    const [score, setScore] = useState(null);
    const [local, setLocal] = useState(null);
    const [countdownValue, setCountdownValue] = useState(5);
 

    
    useEffect(() => {
        if (!waiting) return;

        try {
            if (lastMessage != null) {
                const data = JSON.parse(lastMessage.data);
                if (data && data.type) {
                    if (data.type === 'game_started')
                        setStarted(true);
                    else if (data.type === 'game_finished'){
                        console.log(data.type);
                        setWinner(data.winner);
                        setScore(data.score)
                        setFinish(true);

                    }
                    else if (data.type === "freee_match"){
                        setWinner(data.winner);
                        setScore("Free Match");
                        setFinish(true);
                    }
                        
                }
            }
        }
        catch (error) {
            console.error(error);
        }
    }, [lastMessage])


    const handdleRandom = () => {
        const url = 'ws://127.0.0.1:8000/ws/ping_pong/random/?token=' + token;
        setConnectionUrl(url)
        setWaiting(true);
    }

    
    const handdleLocal = () => {
        setLocal(true);
        let countdown = 5;
    
        const countdownInterval = setInterval(() => {
            countdown--;
            setCountdownValue(countdown); // Update the state for countdown
      
            if (countdown === 0) {
              clearInterval(countdownInterval);
              setStarted(true);
            }
          }, 1000); 
    }
    return (

        <>
            <div className="flex gap-6">

                <div className="p-5 flex-1 glass flex flex-row justify-center items-center h-[50vh] space-x-16">

                    {!local ? (

                        !waiting ? (
                            
                            <>
                            <div className='inline space-y-4 space-x-'>
                                <div className='border-y-2 border-white border-opacity-40 rounded-lg white w-72 h-80 flex justify-center items-center'>
                                    <RiWifiOffLine className='size-44 animate-pulse' />
                                </div>
                                <div className='flex justify-center items-center'>
                                    <button onClick={handdleLocal} className='border-y-4 border-red-700 w-48 h-14 rounded-lg text-2xl hover:border-y-4 hover:border-blue-600 '>
                                        local mode
                                    </button>
                                </div>
                            </div>
                            <div className='inline space-y-4'>
                                <div className='border-y-2 p-3 flex space-x-3 justify-center items-center border-white border-opacity-40 rounded-lg white w-72 h-80'>
                                    <div className='w-28 h-full flex justify-center items-center'><GiPerspectiveDiceSixFacesRandom className='size-28 hover:animate-spin' /></div>
                                </div>
                                <div className='flex justify-center items-center space-x-7'>
                                    <button onClick={handdleRandom} className='border-y-4 border-green-700 w-32 h-14 rounded-lg text-lg hover:border-y-4 hover:border-blue-600 '>
                                        random match
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        
                        started ? (
                            finish ?(
                                <div className="border rounded-lg w-1/2 h-1/2 p-2 bg-violet-500 bg-opacity-20">
                                    <div className="flex justify-center items-center  w-full h-12   animate-bounc text-2xl font-mono animate-bounce">WINNER is {winner.player_username}</div>
                                    <div className="flex justify-center items-center  w-full h-10   animate-bounc text-2xl font-mono ">{score}</div>
                                    <div className="flex justify-center items-center  w-full h-52  animate-bounc text-amber-300 animate-bounce"><BsEmojiSunglasses className="size-32"/></div>
                                </div>
                            ):(
                                !start ?(
                                    <div ><p className="text-[70px] animate-ping text-ring">{countdownValue}</p></div>
                                ):(    
                                    <PingPongGame sendMessage={sendMessage} lastMessage={lastMessage} readyState={readyState} />
                                )
                            )
                        ) : (

                            <div className="flex flex-col items-center justify-center">
                                <div className="text-3xl font-bold text-center mb-4 text-gray-300">Waiting for opponent...
                                <button onClick={() => {sendMessage(JSON.stringify({"type": "cancel"})); setWaiting(false)}} className="border border-white border-opacity-30 bg-white hover:bg-white hover:text-black hover:text-opacity-60 hover:border-black hover:bg-opacity-75 bg-opacity-20 rounded-xl w-14 h-10 text-sm">
                                    cancel</button></div>
                                <Spinner />
                                
                            </div>
                        )
                        
                    )

                    ):(
                        !started ?(
                            <div ><p className="text-[70px] animate-ping text-ring">{countdownValue}</p></div>
                        ):(    
                            <Canvas/>
                        )
                    )}
                        
                        </div>





                <Card className="glass w-1/4 p-6 space-y-6">
                </Card>

            </div>

        </>
    );
}