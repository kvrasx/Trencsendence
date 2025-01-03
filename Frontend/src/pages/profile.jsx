import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
<<<<<<< HEAD
import { Edit, Camera, UserPlus, Swords } from 'lucide-react';
=======
import { Camera, UserPlus, Swords, MessageSquare } from 'lucide-react';
>>>>>>> master
import ProfileSettings from '@/components/custom/profile_settings';
import CreateTournament from '@/components/custom/create_tournament';
import defaultAvatar from '@/assets/profile.jpg';
import { post } from '@/lib/ft_axios';
<<<<<<< HEAD
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

export default function Profile({ user, setUser }) {

=======
import { toast } from 'react-toastify';
import banner from '@/assets/banner.jpeg';
import { DonutChart } from '@/components/ui/donut-chart';
import MultiLineChart from '@/components/ui/multiline-chart';
import { FaTableTennis, FaGamepad } from 'react-icons/fa';

export default function Profile({ user, setUser }) {

    const data = [
        { name: 'Jan', pingPong: 30, ticTacToe: 20 },
        { name: 'Feb', pingPong: 20, ticTacToe: 25 },
        { name: 'Mar', pingPong: 27, ticTacToe: 22 },
        { name: 'Apr', pingPong: 18, ticTacToe: 28 },
        { name: 'May', pingPong: 23, ticTacToe: 20 },
        { name: 'Jun', pingPong: 34, ticTacToe: 30 },
    ];

>>>>>>> master
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

<<<<<<< HEAD
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
=======
        <div className="space-y-3 h-[90vh]">
            <div className="h-2/6 relative">
                <img src={banner} className="rounded-lg h-full w-full flex flex-col justify-end items-center bg-cover bg-center bg-no-repeat" />
                <div className="absolute bottom-0 z-50 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                    <Avatar className="w-32 h-32">
                        <AvatarImage src={(user?.avatar) ?? defaultAvatar} className="" />
                        <AvatarFallback>{"no avatar"}</AvatarFallback>
                        {setUser &&
                            <div className="w-32 h-32 opacity-0 hover:opacity-100 rounded-full absolute items-center flex justify-center top-0 right-0 cursor-pointer hover:backdrop-blur-md">
>>>>>>> master
                                <input
                                    type="file"
                                    accept="image/png, image/jpeg, image/jpg"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    id="avatar-upload"
                                    onChange={handleAvatarChange}
                                />
                                <Button
                                    size="icon"
<<<<<<< HEAD
                                    variant="secondary"
=======
                                    variant="ghost"
>>>>>>> master
                                    className="pointer-events-none cursor-pointer"
                                >
                                    <Camera className="h-4 w-4 cursor-pointer" />
                                </Button>
                            </div>
                        }
<<<<<<< HEAD
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


=======
                    </Avatar>
                </div>

                <span className='mt-16 flex flex-col items-center'>
                    <h1 className="text-2xl font-bold">{user.username}</h1>
                    <p className="text-muted-foreground">online</p>
                </span>
            </div>

            <div className="mx-auto flex items-center -translate-y-10 justify-center content-center">

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


            <div className="grid grid-cols-1 md:grid-cols-2 pt-12 md:gap-24 gap-6">

                <Card className="bg-transparent border-none space-y-4">
                    <div className="glass border border-secondary p-4 rounded-lg shadow-2xl uniform-size1">
                        <h2 className="text-xl font-semibold mb-3">Stats</h2> <hr className='border-gray-700' />
                        <div className="block md:grid grid-cols-2 ">
                            <div className="grid text-center grid-cols-2 gap-4 h-fit">
                                <div className="p-4 rounded-lg glass hover:shadow-2xl transition-shadow duration-300">
                                    <div className="text-muted-foreground text-sm">Games Played (Tic Tac Toe)</div>
                                    <div className="text-2xl font-bold">43</div>
                                </div>
                                <div className="p-4 rounded-lg glass hover:shadow-2xl transition-shadow duration-300">
                                    <div className="text-muted-foreground text-sm">Wins (Tic Tac Toe)</div>
                                    <div className="text-2xl font-bold">43</div>
                                </div>
                                <div className="p-4 rounded-lg glass hover:shadow-2xl transition-shadow duration-300">
                                    <div className="text-muted-foreground text-sm">Games Played (Ping Pong)</div>
                                    <div className="text-2xl font-bold">43</div>
                                </div>
                                <div className="p-4 rounded-lg glass hover:shadow-2xl transition-shadow duration-300">
                                    <div className="text-muted-foreground text-sm">Wins (Ping Pong)</div>
                                    <div className="text-2xl font-bold">43</div>
                                </div>
                            </div>
                            
                            <DonutChart wins={190} losses={55} />
                        </div>
                    </div>
                    <div className="shadow-2xl glass border border-secondary p-4 rounded-lg uniform-size">
                        <h2 className="text-xl font-semibold ">Summary</h2> <hr className='border-gray-700' />
                        <MultiLineChart />
                    </div>
                </Card>

                <Card className="bg-transparent border-none space-y-4">
                    <div className="glass border border-secondary p-4 rounded-lg shadow-2xl uniform-size1">
                        <h2 className="text-xl font-semibold">My Friends</h2><br />
                        <div className="space-y-3 overflow-y-auto themed-scrollbar ">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <div key={index} className="overflow-x-auto flex justify-between items-center p-4 rounded-lg glass hover:shadow-lg transition-shadow duration-300 space-x-4">
                                    <div className="flex items-center gap-3 cursor-pointer">
                                        <Avatar className="flex-none w-10 h-10">
                                            <AvatarImage src={null} alt="user avatar" />
                                            <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                        </Avatar>
                                        <span className="text-md font-medium">{"test"}</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" di className="rounded-xl border border-gray-500 hover:bg-secondary px-2" size="lg">
                                            <MessageSquare className="" />
                                            {/* <span className='hidden md:block'>Message</span> */}
                                        </Button>
                                        <Button variant="ghost" className="rounded-xl border border-gray-500  hover:bg-secondary px-3" size="lg">
                                            <Swords className="w-6 h-6 mr-2" />
                                            <span className='hidden md:block'>Challenge</span>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                    <div className="glass border border-secondary p-4 rounded-lg shadow-2xl uniform-size">
                        <h2 className="text-xl font-semibold">Last Matches</h2><br />
                        <div className="space-y-3 overflow-y-auto themed-scrollbar ">
                            {Array.from({ length: 10 }).map((_, index) => (
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
                            ))}

                        </div>
                    </div>


                </Card>
>>>>>>> master
            </div>
        </div>
    )
}