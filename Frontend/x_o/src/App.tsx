import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";


export function App() {
    enum gameState {
        PLAYING,
        WIN,
        LOOSE,
        DRAW,
    }

    const [symbol, setSymbol] = useState<string | null>(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [board, setBoard] = useState<{ [id: number]: string }>({});


    useEffect(() => {

        const newSocket = new WebSocket('ws://localhost:8000/ws/game/lobby/');
        // const oSocket = new WebSocket('ws://localhost:8000/ws/game/room2/');

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

    // const winningCombinations = [
    //     [0, 1, 2],
    //     [3, 4, 5],
    //     [6, 7, 8],
    //     [0, 3, 6],
    //     [1, 4, 7],
    //     [2, 5, 8],
    //     [0, 4, 8],
    //     [2, 4, 6],
    // ];

    // const checkWinningCombination = () => {
    //     const xKeys: number[] = Object.keys(board)
    //         .filter((key) => board[Number(key)] === symbol)
    //         .map((key) => Number(key));

    //     let check: number[] | undefined = winningCombinations.find((combination) => {
    //         return combination.every((elementOfCombination) =>
    //             xKeys.includes(elementOfCombination)
    //         );
    //     });

    //     if (check !== undefined) return gameState.WIN;

    //     if (Object.keys(board).length >= 9) return gameState.DRAW;

    //     return gameState.PLAYING;
    // };

    const handleCellClick = (event: React.MouseEvent<HTMLDivElement>) => {
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

        // const status = checkWinningCombination();
        // if (status === gameState.WIN || status === gameState.DRAW) {
        //     socket.send(JSON.stringify({
        //         action: "end",
        //         status
        //     }));
        // }
    };

    const renderBoard = () => {
        const cells = [];
        for (let i = 0; i < 9; i++) {
            cells.push(
                <div
                    className="cell"
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
        <div className="flex flex-row min-h-screen justify-center items-center">
            <Card className="p-5">
                <div className="board">{renderBoard()}</div>
            </Card>

            <Dialog>
                <DialogTrigger asChild style={{ display: "none" }}>
                    <Button variant="outline" id="winner-dialog" style={{ display: "none" }}>
                        Edit Profile
                    </Button>
                </DialogTrigger>

                <DialogContent
                    className="sm:max-w-[425px] flex flex-col items-center justify-center text-center"
                    onInteractOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Game Over!</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <p>The player using '{symbol}' has won!</p>
                    <DialogFooter className="flex justify-center mt-4">
                        <div className="grid grid-cols-2 gap-12">
                            <Button>Home</Button>
                            <Button onClick={() => window.location.reload()}>
                                Rematch
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
