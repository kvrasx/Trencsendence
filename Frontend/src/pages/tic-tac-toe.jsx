import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
// import local from '@/assets'


export function TicTacToe() {

    const [symbol, setSymbol] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [socket, setSocket] = useState(null);
    const [board, setBoard] = useState({});
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const newSocket = new WebSocket('ws://localhost:8000/ws/game/lobby/');
        newSocket.onopen = () => {
            console.log('WebSocket connection established');
            setSocket(newSocket);
        };
        newSocket.onerror = (error) => {
            console.log('WebSocket error:', error);
        };
        newSocket.onclose = (event) => {
            if (event.code == 4401)
                console.log('Not authorized.');
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
                    document.getElementById("winner-dialog")?.click();
                    break;

                case "game_start":
                    // Optional: Add any game start logic
                    console.log("Game is ready to begin");
                    break;

                default:
                    console.log("Unknown action:", data.action);
            }
        };

        return () => {
            newSocket.close()
        };

    }, []);

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
                    className="cell min-w-20 min-h-20 flex justify-center"
                    id={`${i}`}
                    key={i}
                    onClick={handleCellClick}
                >
                    {board[i]}
                </div>
            );
        }
        return cells;
    };

    return (
        <>
            <div className="flex gap-6">

                <div className="p-5 flex-1 glass flex flex-row justify-center items-center h-[50vh]">
                    {started ? (

                        <Card className="p-5 bg-transparent border-gray-500">
                            <div className="grid grid-cols-3 gap-5 m-auto w-full">{renderBoard()}</div>
                        </Card>
                    ) : (
                        <>
                        <div className="grid grid-cols-2 gap-3">

                            

                            <Card className="glass p-6 space-y-6">
                                <h2 className="text-center">Matchmaking Mode</h2>
                                <button className="btn btn-primary w-full" onClick>Play Online</button>
                            </Card>

                        </div>
                        </>
                    )}

                </div>


                <Card className="glass w-1/4 p-6 space-y-6">
                    user info
                </Card>

            </div>

        </>

    );
}
