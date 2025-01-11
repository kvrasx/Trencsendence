import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, UserPlus, Swords, MessageSquare } from 'lucide-react';
import ProfileSettings from '@/components/custom/profile_settings';
import CreateTournament from '@/components/custom/create_tournament';
import defaultAvatar from '@/assets/profile.jpg';
import { post, get } from '@/lib/ft_axios';
import { toast } from 'react-toastify';
import banner from '@/assets/banner.jpeg';
import { DonutChart } from '@/components/ui/donut-chart';
import MultiLineChart from '@/components/ui/multiline-chart';
import InviteButton from '../components/custom/invite-button';
import { ProgressDemo } from '@/components/ui/progress'
import { useEffect, useState } from 'react';

export default function Profile({ user, setUser }) {
    const [matches, setMatches] = useState(null);
    const [matchesData, setMatchesData] = useState(null);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                let res = await get('/api/match/get-all');
                setMatchesData({
                    playedPong: res.filter(match => match.game_type === 1).length,
                    playedXO: res.filter(match => match.game_type === 2).length,
                    winsPong: res.filter(match => match.winner_user.username === user.username).length,
                    lossesPong: res.filter(match => match.loser.username === user.username).length,
                    goalsPong: res.reduce((acc, match) => acc + parseInt(match.score.split(':')[0]), 0),
                    winsXO: res.filter(match => match.game_type === 2 && match.winner_user.username === user.username).length,
                    lossesXO: res.filter(match => match.game_type === 2 && match.loser.username === user.username).length
                })
                console.log(res);
                
                setMatches(res);
            } catch (e) {
                console.log(e);
                toast.error("Failed to fetch matches. Please try again.")
            }
        }
        fetchMatches();
    }, [])

    console.log(user);

    const updateProfile = async (data, successMsg) => {
        let res = await post('/api/user/update', data, {
            'Content-Type': 'multipart/form-data',
        })
        if (res?.user) {
            toast.success(successMsg);
            setUser(res.user);
        }
    }

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
            toast.error("No file selected. Please choose a file.");
            return;
        }
        let formData = new FormData();
        formData.append("avatar", file);
        try {
            await updateProfile(formData, "Avatar has been changed successfully!");
        } catch (e) {
            toast.error("Failed to change avatar. Please try again.")
        }
    };

    return (

        <div className="space-y-3 h-[90vh]">
            <div className="h-2/6 relative">
                <div style={{ backgroundImage: `url(${banner})` }} className="rounded-lg h-full w-full flex flex-col justify-end items-center bg-cover bg-center bg-no-repeat"> </div>
                <div className="absolute bottom-0 z-50 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <Avatar className="w-32 h-32">
                        <AvatarImage src={(user?.avatar) ?? defaultAvatar} className="" />
                        <AvatarFallback>{"no avatar"}</AvatarFallback>
                        {setUser &&
                            <div className="w-32 h-32 opacity-0 hover:opacity-100 rounded-full absolute items-center flex justify-center top-0 right-0 cursor-pointer hover:backdrop-blur-md">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id="avatar-upload"
                                    onChange={handleAvatarChange}
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="pointer-events-none cursor-pointer"
                                >
                                    <Camera className="h-4 w-4 cursor-pointer" />
                                </Button>
                            </div>
                        }
                    </Avatar>
                </div>

                <span className='mt-16 flex flex-col items-center'>
                    <h1 className="text-2xl font-bold">{user.username}</h1>
                    <p className="text-muted-foreground">{user?.online ? "online" : "offline"}</p>
                </span>
            </div>

            <div className="text-center mx-auto md:flex items-center md:-translate-y-10 justify-center content-center">

                <div className="md:flex md:justify-between md:space-x-40 space-y-4 md:space-y-0 mt-32 md:mt-0">

                    {setUser ? (
                        <>
                            <ProfileSettings updateProfile={updateProfile} user={user} />
                            <CreateTournament />
                        </>
                    ) : (
                        <>
                            <InviteButton user_id={user.id} type={"friend"} defaultStatus={"Invite Friend"} className="capitalize p-6 w-64 border-accent disabled:opacity-100 disabled:bg-accent" />
                            <InviteButton user_id={user.id} type={"game"} defaultStatus={"Challenge to Game"} className="capitalize p-6 w-64 border-accent disabled:opacity-100 disabled:bg-accent" />
                        </>
                    )}
                </div>

            </div>

            {matchesData && matches && 
            
            <div className="flex max-h-[50vh] flex-row justify-center min-w-full ">

                <div className="grid md:grid-cols-2 md:grid-rows-2  gap-x-20 pt-7  gap-4 flex-1 ">

                    <div className="glass border border-secondary p-4 rounded-lg shadow-2xl flex-auto flex-col flex ">
                        <h2 className="text-xl font-semibold text-gray-400">Stats</h2>
                        <div className="md:flex justify-center gap-4 items-center h-full w-full">
                            <div className="flex flex-col flex-1 gap-2 text-lg font-bold">
                                <div className="flex flex-row justify-center items-center gap-3">
                                    <span>Score</span>
                                    <ProgressDemo value={user.score} className="" />
                                    <span className='font-semibold text-sm'>{user.score}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-3 ">
                                    <span>Played/Pong</span>
                                    <ProgressDemo value={matchesData.playedPong} className="" />
                                    <span className='font-semibold text-sm'>{matchesData.playedPong}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-3 ">
                                    <span>Wins/Pong</span>
                                    <ProgressDemo value={matchesData.winsPong} className="" />
                                    <span className='font-semibold text-sm'>{matchesData.winsPong}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-3">
                                    <span>Losses/Pong</span>
                                    <ProgressDemo value={matchesData.lossesPong} className="" />
                                    <span className='font-semibold text-sm'>{matchesData.lossesPong}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-3">
                                    <span>Goals/Pong</span>
                                    <ProgressDemo value={matchesData.goalsPong} className="" />
                                    <span className='font-semibold text-sm'>{matchesData.goalsPong}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-3">
                                    <span>Played/XO</span>
                                    <ProgressDemo value={matchesData.playedXO} className="" />
                                    <span className='font-semibold text-sm'>{matchesData.playedXO}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-3">
                                    <span>Wins/XO</span>
                                    <ProgressDemo value={matchesData.winsXO} className="" />
                                    <span className='font-semibold text-sm'>{matchesData.winsXO}</span>
                                </div>
                                <div className="flex flex-row justify-center items-center gap-3">
                                    <span>Losses/XO</span>
                                    <ProgressDemo value={matchesData.lossesXO} className="" />
                                    <span className='font-semibold text-sm'>{matchesData.lossesXO}</span>
                                </div>
                            </div>
                            <DonutChart
                                wins={matchesData.winsPong + matchesData.winsXO}
                                losses={matchesData.lossesPong + matchesData.lossesXO}
                            />
                        </div>
                    </div>

                    <div className="glass border border-secondary p-4 rounded-lg shadow-2xl ">
                        <h2 className="text-xl font-semibold text-gray-400">Summary</h2>
                        <div className="">
                            <div className="-ml-8">

                                <MultiLineChart matches={matches} />
                            </div>
                        </div>

                    </div>


                    <div className="glass border border-secondary p-4 rounded-lg shadow-2xl min-h-[400px] md:min-h-none flex-initial overflow-y-auto themed-scrollbar flex-col flex gap-2">
                        <h2 className="text-xl font-semibold text-gray-400">Last Matches</h2>
                        <div className="space-y-3">
                            {matches.map((match, index) => (
                                <div
                                    key={match.match_id}
                                    className={`flex items-center justify-between p-4 rounded-lg  ${match.game_type === 1 ? 'glass' : 'bg-secondary'}`}
                                >
                                    <div>
                                        <div className="font-medium">vs {user.id === match.winner_user.id ? match.loser.username : match.winner_user.username}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {match.match_date}
                                        </div>
                                    </div>

                                    {match.game_type === 1 && <div className="text-lg font-semibold">
                                        {match.score.split(':').map(num => parseInt(num, 10)).join(' : ')}
                                    </div>}

                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${match.winner_user.id === user.id
                                            ? "bg-green-500/20 text-green-500"
                                            : "bg-red-500/20 text-red-500"
                                            }`}
                                    >
                                        {match.winner_user.id === user.id ? "Win" : "Loss"}
                                    </span>
                                </div>
                            ))}

                        </div>
                    </div>


                    <div className="glass border border-secondary p-4 rounded-lg shadow-2xl min-h-[400px] md:min-h-none flex-initial overflow-y-auto themed-scrollbar flex-col flex gap-2">
                        <h2 className="text-xl font-semibold text-gray-400">Last Tournaments</h2>
                        <div className="space-y-3">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 rounded-lg glass"
                                >
                                    <div>
                                        <div className="font-medium">vs {"Opponent"}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {"10-4"}
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-medium ${false
                                            ? "bg-green-500/20 text-green-500"
                                            : "bg-red-500/20 text-red-500"
                                            }`}
                                    >
                                        {"Loss"}
                                    </span>
                                </div>
                            ))}

                        </div>
                    </div>


                </div>
            </div>}


        </div>
    )
}