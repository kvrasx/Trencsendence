import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, UserPlus, Swords, Ban } from "lucide-react";
import Message from "@/components/ui/message";
import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { get } from "@/lib/ft_axios";
import { UserContext } from "@/contexts";
import { toast } from "react-toastify";
import OldMessages from "../components/custom/old_messages";
import NewMessages from "../components/custom/new_messages";

export function Chat() {
    const user = useContext(UserContext);
    const [socket, setSocket] = useState(null);
    const [chats, setChats] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const isWsOpened = useRef(false);

    const sendHandler = (e) => {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]');
        const message = input.value;
        if (socket && socket.readyState === WebSocket.OPEN && message.trim()) {
            socket.send(JSON.stringify({ message }));
            input.value = '';
        } else {
            toast.error('Failed to send message. Please check your connection or try again.');
        }
    }


    useEffect(() => {
        get('/getChats/')
            .then(res => {
                let chatPromises = res.map((chat) => {
                    console.log(chat.user2);
                    
                    return (
                        get(`/api/user/getInfo?user_id=${chat.user2}`)
                            .then(userRes => {
                                chat.user2 = userRes;
                                return chat;
                            })
                    );
                });

                Promise.all(chatPromises).then(cchats => {
                    setChats(cchats);
                    setCurrentChat(cchats[0]);
                    console.log(cchats);
                });
            })
            .catch(error => {
                console.log('Error fetching chats:', error);
            });
    }, []);


    return (
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
            {/* Chat List */}
            <Card className="glass w-64 p-4 flex flex-col gap-3">
                <Input type="text flex-initial" placeholder="Search chats..." />

                {chats.length !== 0 ? chats.map((chat, index) => {

                    return (<div key={index} onClick={(() => setCurrentChat(chats[index]))} className="flex items-center gap-3 p-2 rounded-lg hover-glass cursor-pointer">
                        <Avatar className="flex-none">
                            <AvatarImage src="https://github.com/shacn.png" alt="@shadcn" />
                            <AvatarFallback>User</AvatarFallback>
                        </Avatar>
                        <span>{chat.user2.username}</span>
                    </div>)

                }) : <span className="mt-1.5 text-gray-500 text-center">You have no chats.</span>}


            </Card>

            {/* Chat Messages */}
            <Card className="glass border flex-1 min-w-54 flex round flex-col">
                <div className="flex-1 p-6 rounded-lg flex flex-col-reverse gap-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-background">

                    <OldMessages currentChat={currentChat} user={user} />
                    <NewMessages currentChat={currentChat} user={user} socket={socket} setSocket={setSocket} isWsOpened={isWsOpened} />

                </div>


                {/* Text Bar */}
                <div className="p-4 border-t">
                    <form action="">
                        <div className="flex w-full space-x-2">
                            <Input className="bg-background" type="text" placeholder="Type a message..."></Input>
                            <Button onClick={sendHandler}>
                                <Send />
                            </Button>
                        </div>
                    </form>
                </div>
            </Card>

            {/* User Details */}
            <Card className="glass w-80 p-6 space-y-6">

                <div className="text-center">
                    <Avatar className="w-20 h-20 mx-auto cursor-pointer">
                        <AvatarImage src="https://github.com/shacn.png" alt="@shadcn" />
                        <AvatarFallback>User</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl mt-4 font-semibold"><span className="cursor-pointer">Player 1</span></h3>
                    <p className="text-sm text-gray-500">Online</p>
                </div>
                <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                        <Swords />
                        Challenge to Match
                    </Button>
                    <Button variant="outline" className="w-full">
                        <UserPlus />
                        Add Friend
                    </Button>
                    <Button variant="destructive" className="w-full">
                        <Ban />
                        Block User
                    </Button>
                    <Button variant="destructive" className="w-full">
                        <X />
                        Delete Chat
                    </Button>
                </div>
            </Card>
        </div>
    );
}

