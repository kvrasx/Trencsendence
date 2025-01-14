import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

export function TicTacToe({ websocket, setWinner, setOpponent }) {

    const [symbol, setSymbol] = useState(null);
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [board, setBoard] = useState({});

    const [bg, setBg] = useState("#000000");
    useEffect(() => {
        let choosenTheme = localStorage.getItem('theme');

        switch (choosenTheme) {
            case "theme1":
                setBg("#ff7f50");
                break;
            case "theme2":
                setBg("#006400");
                break;
        }
    }, [])

    useEffect(() => {

        websocket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            console.log(data);

            switch (data.action) {
                case "assign_symbol":
                    setSymbol(data.symbol);
                    setIsMyTurn(data.symbol === "X"); // X always starts
                    setOpponent(data.opponent);
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
                    className="border-2 border-white w-28 h-28 flex justify-center"
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
        <Card className={`p-8 bg-transparent border-white border-4`} style={{ backgroundColor: bg }} >
            <div className={`grid grid-cols-3 gap-5 m-auto w-full`}>{renderBoard()}</div>
        </Card>
    );
}

export function LocalTicTacToe({ setWinner, setOpponent }) {
    const [bg, setBg] = useState("#000000");
    useEffect(() => {
        let choosenTheme = localStorage.getItem('theme');

        switch (choosenTheme) {
            case "theme1":
                setBg("#ff7f50");
                break;
            case "theme2":
                setBg("#006400");
                break;
        }

        setOpponent({avatar: null, username: "Self", id: null});
    }, [])

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    const [symbol, setSymbol] = useState("X");
    const [board, setBoard] = useState({});

    const checkWinning = (arr) => {
        return winningCombinations.some((combination) => {
            return combination.every((value) => arr.includes(value));
        });
    };

    const handleCellClick = (event) => {

        const cellId = Number(event.currentTarget.id);
        if (board[cellId])
            return;


        let updatedBoard = { ...board };
        updatedBoard[cellId] = symbol;

        setBoard(updatedBoard)

        let tmp = []
        Object.keys(updatedBoard).forEach((key, index) => {
            if (updatedBoard[key] === symbol) {
                tmp.push(Number(key));
            }
        });

        if (checkWinning(tmp))
            setWinner(`Player using ${symbol}`);
        else if (Object.keys(updatedBoard).length === 9)
            setBoard({});

        setSymbol((prev) => prev === "X" ? "O" : "X");

    };

    const renderBoard = () => {
        const cells = [];
        for (let i = 0; i < 9; i++) {
            cells.push(
                <div
                    className="border-2 border-white w-28 h-28 flex justify-center"
                    id={`${i}`}
                    key={i}
                    onClick={handleCellClick}
                >
                    <span className="text-center flex justify-center items-center text-3xl font-bold">{board[i]}</span>
                </div>
            );
        }
        return cells;
    };

    return (
        <Card className={`p-8 bg-transparent border-white border-4`} style={{ backgroundColor: bg }} >
            <div className={`grid grid-cols-3 gap-5 m-auto w-full`}>{renderBoard()}</div>
        </Card>
    );
}
