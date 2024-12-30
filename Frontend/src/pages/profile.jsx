import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Camera } from 'lucide-react';
import ProfileSettings from '@/components/custom/profile_settings';
import CreateTournament from '@/components/custom/create_tournament';
import defaultAvatar from '@/assets/profile.png';
import { post } from '@/lib/ft_axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Profile({ user, setUser }) {

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        let formData = new FormData();
        formData.append("avatar", file);
        try {
            let res = await post('/api/user/update', formData, {
                'Content-Type': 'multipart/form-data',
            })
            if (res?.user) {
                toast.success("Avatar has been changed successfully!");
                localStorage.setItem('user', JSON.stringify(res.user));
                setUser(res.user);
            }
        } catch (e) {
            toast.error("Failed to update avatar. Please try again.")
        }

    };

    return (

        <div className="space-y-6">
            <Card className="glass p-6">
                <div className="flex gap-6 items-start justify-center flex-wrap text-center md:text-left">
                    <div className="flex-initial relative">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={(user?.avatar) ?? defaultAvatar} />
                            <AvatarFallback>{"no avatar"}</AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 cursor-pointer">
                            <input
                                type="file"
                                accept="image/png"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                id="avatar-upload"
                                onChange={handleAvatarChange}
                            />
                            <Button
                                size="icon"
                                variant="secondary"
                                className="pointer-events-none cursor-pointer"
                            >
                                <Camera className="h-4 w-4 cursor-pointer" />
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 flex-col flex space-y-4">
                        <span>
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            <p className="text-muted-foreground">{(user.online) ? "online" : "offline"}</p>
                        </span>

                        <div className="">
                            <ProfileSettings />
                            <CreateTournament />
                        </div>
                    </div>

                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass p-6">
                    <h2 className="text-xl font-semibold mb-4">Stats</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg glass">
                            <div className="text-muted-foreground text-sm">Games Played</div>
                            <div className="text-2xl font-bold">43</div>
                        </div>
                        <div className="p-4 rounded-lg glass">
                            <div className="text-muted-foreground text-sm">Wins</div>
                            <div className="text-2xl font-bold">43</div>
                        </div>
                        <div className="p-4 rounded-lg glass">
                            <div className="text-muted-foreground text-sm">Win Rate</div>
                            <div className="text-2xl font-bold">43</div>
                        </div>
                        <div className="p-4 rounded-lg glass">
                            <div className="text-muted-foreground text-sm">Tournament Wins</div>
                            <div className="text-2xl font-bold">43</div>
                        </div>
                    </div>
                </Card>

                <Card className="glass p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Matches</h2>
                    <div className="space-y-4">

                        <div
                            key={1}
                            className="flex items-center justify-between p-4 rounded-lg glass"
                        >
                            <div>
                                <div className="font-medium">vs {"Opponent"}</div>
                                <div className="text-sm text-muted-foreground">
                                    {"10-4"}
                                </div>
                            </div>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${true
                                    ? "bg-green-500/20 text-green-500"
                                    : "bg-red-500/20 text-red-500"
                                    }`}
                            >
                                {"Win"}
                            </span>
                        </div>
                        <div
                            key={2}
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

                    </div>
                </Card>


            </div>
        </div>
    )
}