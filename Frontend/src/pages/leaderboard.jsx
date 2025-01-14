
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { get, post } from '@/lib/ft_axios';
import { Link } from "react-router-dom";
import defaultPicture from "@/assets/profile.jpg";

export function Leaderboard() {

    const [Players, setPlayers] = useState([])
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                let res = await get('user/get-all');  // Fetch Players
                console.log(res);
                setPlayers(res);
            } catch (e) { console.log("Failed to fetch"); }
        };
        fetchPlayers();
    }, []);
    Players.sort((a, b) => b.score - a.score);
    return (
        <div className="container py-8 animate-fade-in">
            <h1 className="text-4xl font-bold text-primary">Leaderboard</h1>
            <Card className="glass mt-4 h-auto w-auto p-4 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-background">
                {Players.map((Player, key) => (
                    <Showplayer
                        index={key + 1}
                        Player={Player}
                        key={key}
                    />

                ))}
            </Card>
        </div>
    )
}

export function Showplayer({Player, index}) {
    
    return (
        <div className="flex items-center justify-between p-4 rounded-lg glass hover-glass">
            <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary w-8">#{index}</span>
                <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <img className="aspect-square h-full w-full" src={Player.avatar || defaultPicture}></img>
                </span>
                <Link to={"/profile/"+Player.id}>
                <span className="font-medium cursor-pointer">{Player.username}</span>
                </Link>
            </div>
            <span className="text-lg font-semibold">{Player.score}
            </span>
        </div>
    );
}