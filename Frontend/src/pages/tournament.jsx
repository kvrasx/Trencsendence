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
                                        <AvatarImage src={tournament?.position1?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center overflow-hidden">{tournament?.position1?.username}</div>
                                <div className="w-full h-1/2 flex justify-center items-center overflow-hidden">{tournament?.position1?.display_name}</div>
                            </div>
                            <div className="w-full h-1/3 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position2?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position2?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position2?.display_name}</div>
                            </div>
                        </div>

                        <div className='h-1/2 w-full  p-2 space-y-2'>
                            <div className="w-full h-1/3 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white mt-10">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position3?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position3?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position3?.display_name}</div>
                            </div>
                            <div className="w-full h-1/3 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position4?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position4?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position4?.display_name}</div>
                            </div>
                        </div>
                    </div>

                    <div className='  h-full w-1/4 flex justify-center items-center'>
                        <div className=' h-1/3 w-full p-4 space-y-2'>
                            <div className="w-full h-1/2 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position5?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position5?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position5?.display_name}</div>
                            </div>
                            <div className="w-full h-1/2 border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white">
                                <div className="w-full h-1/3 flex justify-center text-sm">
                                    <Avatar className="w-20 h-20">
                                        <AvatarImage src={tournament?.position6?.avatar} />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position6?.username ?? "Not known yet"}</div>
                            <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position6?.display_name}</div>
                            </div>
                        </div>
                    </div>

                    <div className='  h-full w-1/4 flex justify-center items-center p-4'>
                        <div className='border rounded-lg border-opacity-45 bg-white bg-opacity-15 p-2 border-white h-1/6 w-full'>
                            <div className="w-full h-1/3 flex justify-center text-sm">
                                <Avatar className="w-20 h-20">
                                    <AvatarImage src={tournament?.position7?.avatar} />
                                    <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position7?.username ?? "Not known yet"}</div>
                        <div className="w-full h-1/2 flex justify-center items-center">{tournament?.position7?.display_name}</div>
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