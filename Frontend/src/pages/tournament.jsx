import { Button } from '@/components/ui/button';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import defaultAvatar from "@/assets/profile.jpg";
import { useEffect, useState } from 'react';
import {get} from '@/lib/ft_axios';
import { toast } from 'react-toastify';

export default function Tournament() {

    const [tournament, setTournament] = useState(null);

    useEffect(() => {
        const fetchTournament = async () => {
            try {

                let res = await get('/tournament/get');
                setTournament(res.tournament);
                console.log(res);
            } catch (e) {
                console.log(e);
                if (e?.response?.status !== 404) {
                    toast.error('Failed to fetch tournament data. Please try again later.');
                }
            }
        };
        fetchTournament();
    }, [])

    return (

        <>
            {(tournament !== null) ? (
                <>
                <h2 className='text-accent text-center text-2xl font-semibold p-4'>{tournament?.tournament_name}</h2>
                <div className='w-[1/2] rounded-lg glass border-opacity-50 h-full flex p-12 justify-center items-center'>
                    <div className='h-full w-1/5 space-y-2 '>

                        <div className='h-1/2 w-full  p-2 space-y-2'>
                            <div className="w-full h-1/3 border rounded-lg border-opacity-45 p-2 bg-white bg-opacity-15 border-white mt-16">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position1_user?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center overflow-hidden">{tournament?.position1_user?.username}</div>
                                <div className="w-full h-1/2 flex justify-center items-center text-muted-foreground text-sm overflow-hidden">{tournament?.position1_user?.display_name}</div>
                            </div>
                            <div className="w-full h-1/3 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position2_user?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position2_user?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center text-muted-foreground text-sm overflow-hidden">{tournament?.position2_user?.display_name}</div>
                            </div>
                        </div>

                        <div className='h-1/2 w-full  p-2 space-y-2'>
                            <div className="w-full h-1/3 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white mt-10">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position3_user?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position3_user?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center text-muted-foreground text-sm overflow-hidden">{tournament?.position3_user?.display_name}</div>
                            </div>
                            <div className="w-full h-1/3 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position4_user?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position4_user?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center text-muted-foreground text-sm overflow-hidden">{tournament?.position4_user?.display_name}</div>
                            </div>
                        </div>
                    </div>

                    <div className='  h-full w-1/4 flex justify-center items-center'>
                        <div className=' h-1/3 w-full p-4 space-y-2'>
                            <div className="w-full h-1/2 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position5_user?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position5_user?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center text-muted-foreground text-sm overflow-hidden">{tournament?.position5_user?.display_name}</div>
                            </div>
                            <div className="w-full h-1/2 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position6_user?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position6_user?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center text-muted-foreground text-sm overflow-hidden">{tournament?.position6_user?.display_name}</div>
                            </div>
                        </div>
                    </div>

                    <div className='  h-full w-1/4 flex justify-center items-center p-4'>
                        <div className='border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white h-1/6 w-full'>
                            <div className="w-full h-1/3 flex justify-center text-sm">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={tournament?.position7_user?.avatar} />
                                    <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position7_user?.username ?? "Not known yet"}</div>
                        <div className="w-full h-1/2 flex justify-center items-center text-muted-foreground text-sm overflow-hidden">{tournament?.position7_user?.display_name}</div>
                        </div>
                    </div>

                </div>
                </>

            ) : (
                <div className='w-full h-full flex justify-center items-center'>
                    <p className='text-xl text-gray-300'>You are not part of an ongoing tournament.</p>
                </div>
            )}
        </>


    );
}