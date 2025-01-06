import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import local from "@/assets/local.jpg"
import remote from "@/assets/remote.jpg"
import Spinner from "@/components/ui/spinner";
import {Button} from "@/components/ui/button";
import Cookies from 'js-cookie';

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

        const token = Cookies.get('access_token');
        const newSocket = new WebSocket(`ws://localhost:8000/ws/game/lobby/?token=${token}`);
        newSocket.onopen = () => {
            console.log('WebSocket connection established');
            setSocket(newSocket);
        };
        newSocket.onerror = (error) => {
            console.log('WebSocket error:', error);
        };
        newSocket.onclose = (event) => {
            console.log('WebSocket connection closed', event.code);
            if (event.code == 4008)
                console.log('Not authorized.');
            else if (event.code == 4009) {
                setWaiting(false);
                console.log('User already in another game');
            }
            else
                console.log('WebSocket connection closed', event.code);
            setSocket(null);
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
            <div className="flex gap-6">

                <div className="p-5 flex-1 glass flex flex-row justify-center items-center h-[50vh]">
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


                <Card className="glass w-1/4 p-6 space-y-6">
                    user info
                </Card>

            </div>

        </>

    );
}
