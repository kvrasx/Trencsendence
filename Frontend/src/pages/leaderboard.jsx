
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
<<<<<<< HEAD
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { get, post } from '@/lib/ft_axios';

export function Leaderboard() {

    const [Players, setPlayers] = useState([])
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                let res = await get('/api/user/get-all');  // Fetch Players
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
                    />

                ))}
            </Card>
        </div>
    )
}

export function Showplayer({Player, index}) {
    
    const defaultPicture = "https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg";
    console.log(index)
    return (
        <div className="flex items-center justify-between p-4 rounded-lg glass hover-glass">
            <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-primary w-8">#{index}</span>
                <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                    <img className="aspect-square h-full w-full" src={Player.avatar || defaultPicture}></img>
                </span>
                <span className="font-medium">{Player.username}
                </span>
            </div>
            <span className="text-lg font-semibold">{Player.score}
            </span>
        </div>
    );
=======


export function Leaderboard() {
    return (
        <div class="container py-8 animate-fade-in">
            <h1 class="text-4xl font-bold text-primary">Leaderboard</h1>
            <Card className="glass mt-4 h-auto w-auto p-4 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-background">
                <div class="flex items-center justify-between p-4 rounded-lg glass hover-glass">
                    <div class="flex items-center gap-4">
                        <span class="text-2xl font-bold text-primary w-8">#1</span>
                        <span class="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
                            <img class="aspect-square h-full w-full" src="https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg"></img>
                        </span>
                        <span class="font-medium">Player One
                        </span>
                    </div>
                    <span class="text-lg font-semibold">1200
                    </span>
                </div>
            </Card>
        </div>
    )
>>>>>>> master
}