import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Edit, Camera, UserPlus, Swords } from 'lucide-react';
import ProfileSettings from '@/components/custom/profile_settings';
import CreateTournament from '@/components/custom/create_tournament';
import defaultAvatar from '@/assets/profile.jpg';
import { post } from '@/lib/ft_axios';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

export default function Profile({ user, setUser }) {

    const updateProfile = async (data, successMsg) => {
        let res = await post('/api/user/update', data, {
            'Content-Type': 'multipart/form-data',
        })
        if (res?.user) {
            toast.success(successMsg);
            localStorage.setItem('user', JSON.stringify(res.user));
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

        <div className="space-y-6">
            <Card className="glass p-6">
                <div className="flex gap-6 items-start justify-center flex-wrap text-center md:text-left">
                    <div className="flex-initial relative">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={(user?.avatar) ?? defaultAvatar} />
                            <AvatarFallback>{"no avatar"}</AvatarFallback>
                        </Avatar>
                        {setUser &&
                            <div className="absolute bottom-0 right-0 cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
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
                        }
                    </div>

                    <div className="flex-1 flex-col flex space-y-4">
                        <span>
                            <h1 className="text-2xl font-bold">{user.username}</h1>
                            <p className="text-muted-foreground">online</p>
                        </span>

                        <div className="">
                            {setUser ? (
                                <>
                                    <ProfileSettings updateProfile={updateProfile} user={user} />
                                    <CreateTournament />
                                </>
                            ) : (
                                <>
                                    <Button variant="outline" className="mr-2 mb-2"> <UserPlus /> Add Friend</Button>
                                    <Button variant="outline" className="mr-2 mb-2"> <Swords /> Challenge to Match</Button>
                                </>
                            )}
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