import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, UserPlus, Swords } from 'lucide-react';
import ProfileSettings from '@/components/custom/profile_settings';
import CreateTournament from '@/components/custom/create_tournament';
import defaultAvatar from '@/assets/profile.jpg';
import { post } from '@/lib/ft_axios';
import { toast } from 'react-toastify';
import banner from '@/assets/banner.jpeg';

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

        <div className="space-y-6 h-full">
            <div className="h-2/6 relative">
                <img src={banner} className="rounded-lg h-full w-full flex flex-col justify-end items-center bg-cover bg-center bg-no-repeat" />
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
                    <p className="text-muted-foreground">online</p>
                </span>
            </div>

            <div className="mx-auto flex items-center -translate-y-12 justify-center content-center">

                <div className="flex justify-between space-x-40">
                    {/* <div className="text-center flex space-y-4 mt-12"> */}

                    {setUser ? (
                        <>
                            <ProfileSettings updateProfile={updateProfile} user={user} />
                            <CreateTournament />
                        </>
                    ) : (
                        <>
                            <Button variant="outline" className="p-6 w-64 border-accent"> <UserPlus /> Add Friend</Button>
                            <Button variant="outline" className="p-6 w-64 border-accent"> <Swords /> Challenge to Match</Button>
                        </>
                    )}
                    {/* </div> */}
                </div>

            </div>


            <div className="grid grid-cols-1 md:grid-cols-2 pt-2 md:gap-24 gap-6">
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
                    <h2 className="text-xl font-semibold mb-4">Suggested Profiles</h2>
                    <div className="space-y-4">

                        <div className="flex justify-between items-center p-4 rounded-lg glass hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center gap-3 cursor-pointer">
                                <Avatar className="flex-none w-12 h-12">
                                    <AvatarImage src={null} alt="@shadcn" />
                                    <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                </Avatar>
                                <span className="text-md font-medium">{"test"}</span>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" className="border border-white hover:bg-secondary p-3" size="lg">
                                    <UserPlus className="w-6 h-6 mr-2" />
                                    Add Friend
                                </Button>
                                <Button variant="ghost" className="border border-white hover:bg-secondary p-3" size="lg">
                                    <Swords className="w-6 h-6 mr-2" />
                                    Challenge
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>


            </div>
        </div>
    )
}