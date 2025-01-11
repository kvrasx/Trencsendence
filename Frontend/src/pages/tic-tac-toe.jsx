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
import defaultAvatar from '@/assets/profile.jpg';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

export function TicTacToe() {

    const [symbol, setSymbol] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [socket, setSocket] = useState(null);
    const [board, setBoard] = useState({});
    const [waiting, setWaiting] = useState(false);
    const [started, setStarted] = useState(false);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        if (!waiting)
            return;

        const newSocket = connect_websocket('ws://localhost:8000/ws/game/random/', () => {
            setWaiting(false);
            setStarted(false);
            setSocket(null);
        });

        newSocket.onopen = () => {
            console.log('WebSocket connection established');
            setSocket(newSocket);
        };

        newSocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log(data);

            switch (data.action) {
                case "assign_symbol":
                    setSymbol(data.symbol);
                    setIsMyTurn(data.symbol === "X"); // X always starts
                    break;

                case "update_board":
                    console.log(data.board);

                    setBoard(data.board);
                    setIsMyTurn(data.symbol !== symbol);
                    break;

                case "game_over":
                    // Trigger game end dialog
                    data.status === "finished" && setWinner(data.winner);
                    setBoard(data.board);
                    setIsMyTurn(data.symbol !== symbol);
                    console.log(data.winner);

                    // document.getElementById("winner-dialog")?.click();
                    break;

                case "game_start":
                    // Optional: Add any game start logic
                    waiting && setStarted(true);
                    console.log("Game is ready to begin");
                    break;

                default:
                    console.log("Unknown action:", data.action);
            }
        };

        return () => {
            newSocket.close()
        };

    }, [waiting]);

    const handleCellClick = (event) => {
        // Ensure it's the player's turn and the cell is not already occupied
        const cellId = Number(event.currentTarget.id);
        if (!isMyTurn || board[cellId]) return;

        setIsMyTurn(false);

        if (socket == null) {
            console.log("the socket is null");
            return;
        }

        socket.send(
            JSON.stringify({
                "action": "move",
                cellId,
                symbol
            })
        );

    };

    const renderBoard = () => {
        const cells = [];
        for (let i = 0; i < 9; i++) {
            cells.push(
                <div
                    className="border border-white min-w-20 min-h-20 flex justify-center"
                    id={`${i}`}
                    key={i}
                    onClick={handleCellClick}
                >
                    <span className="text-center flex justify-center items-center text-3xl">{board[i]}</span>
                </div>
            );
        }
        return cells;
    };

    return (
        <>
            <div className="flex gap-6 h-[50vh]">

                <div className="p-5 flex-1 glass flex flex-row justify-center items-center">
                    {!winner ? (
                        waiting ? (
                            started ? (
                                <Card className="p-5 bg-transparent border-gray-500">
                                    <div className="grid grid-cols-3 gap-5 m-auto w-full">{renderBoard()}</div>
                                </Card>
                            ) : (
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-3xl font-bold text-center mb-4 text-gray-300">Waiting for opponent...</div>
                                    <Spinner />
                                </div>
                            )
                        ) : (
                            <>
                                <div onClick={(prev) => { setWaiting(true) }} className="cursor-pointer relative border-2 border-secondary rounded-lg overflow-hidden shadow-lg transform transition-transform duration-300 hover:scale-105">
                                    <img src={remote} alt="Remote Matchmaking Mode" className="h-[600px] w-[250px] object-cover shadow-lg" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-gray-300 text-3xl text-center font-bold" style={{ fontFamily: 'Roboto, sans-serif' }}>
                                        <span className="px-6">Join a Game</span>
                                    </div>
                                </div>
                            </>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center">
                            <div className="text-3xl font-bold text-center mb-4 text-gray-300">Game Over!</div>
                            <div className="text-2xl font-bold text-center mb-4 text-gray-300">{winner}</div>
                            <Button variant="outline" className="w-full hover:bg-secondary" onClick={() => { setWinner(null); setWaiting(false); setStarted(false); socket.close(); setBoard({}) }}>
                                New Game
                            </Button>
                        </div>
                    )}
                </div>


                <Card className="glass w-1/4 p-4 space-y-6 flex flex-col ">
                    {started ? (
                        <div className="flex flex-col gap-4">
                            <h2 className="text-xl font-semibold text-center text-gray-400">Challenge Friends</h2>
                            <div className="space-y-3 overflow-auto themed-scrollbar max-h-[45vh]">
                                {Array.from({ length: 10 }).map((_, index) => (
                                    <div key={index} className=" flex justify-between items-center p-3 rounded-lg border-secondary border hover:shadow-lg transition-shadow duration-300 space-x-4">
                                        <div className="flex items-center gap-3 cursor-pointer">
                                            <Avatar className="flex-none w-11 h-11">
                                                <AvatarImage src={null} alt="user avatar" />
                                                <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                            </Avatar>
                                            <span className="text-md font-medium">{"test"}</span>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button variant="ghost" className="rounded-md border border-gray-500 hover:bg-secondary px-3" size="lg">
                                                <MessageSquare className="" />
                                            </Button>
                                            <Button variant="ghost" className="rounded-md border border-gray-500 hover:bg-secondary px-3" size="lg">
                                                <Swords className="" />
                                            </Button>

                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
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
