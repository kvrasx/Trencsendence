import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

export function TicTacToe({ websocket, setWinner }) {

    const [symbol, setSymbol] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [board, setBoard] = useState({});
  

    useEffect(() => {
        
        websocket.onmessage = (event) => {
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


                default:
                    console.log("Unknown action:", data.action);
            }
        };

    }, []);

    const handleCellClick = (event) => {
        // Ensure it's the player's turn and the cell is not already occupied
        const cellId = Number(event.currentTarget.id);
        if (!isMyTurn || board[cellId]) return;

        setIsMyTurn(false);

        if (websocket == null) {
            console.log("the socket is null");
            return;
        }

        websocket.send(
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
            <Card className="p-5 bg-transparent border-gray-500">
                <div className="grid grid-cols-3 gap-5 m-auto w-full">{renderBoard()}</div>
            </Card>           

        </>

    );
}
