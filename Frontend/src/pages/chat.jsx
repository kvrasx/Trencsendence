import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, X, UserPlus, Swords, Ban, User } from "lucide-react";
import Message from "@/components/ui/message";
import { useEffect, useState, useRef, useContext } from "react";
import axios from "axios";
import { get, post } from "@/lib/ft_axios";
import { UserContext } from "@/contexts";
import { toast } from "react-toastify";
import OldMessages from "../components/custom/old_messages";
import NewMessages from "../components/custom/new_messages";
import Spinner from "@/components/ui/spinner"  
import { Link } from "react-router-dom";
import defaultAvatar from "@/assets/profile.jpg";
import InviteButton from "../components/custom/invite-button";
import { useSearchParams } from 'react-router-dom';

export function Chat() {
    
    const user = useContext(UserContext);
    const [socket, setSocket] = useState(null);
    const [chats, setChats] = useState(null);
    const [currentChat, setCurrentChat] = useState(null);
    const isWsOpened = useRef(false);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    const [searchParams] = useSearchParams();
    const chat_id = !(Number(searchParams.get("chat_id"))) ? null : Number(searchParams.get("chat_id"));

    const [searchResults, setSearchResults] = useState(chats);
    const [userSearch, setUserSearch] = useState("");


    const fetchChats = async () => {
        try {
            const res = await get('/getChats/');
            const chatPromises = res.map(async (chat) => {
                const userRes = await get(`user/get-info?user_id=${chat.user2}`);
                chat.user2 = userRes;
                return chat;
            });
    
            const cchats = await Promise.all(chatPromises);
            setChats(cchats);
            setSearchResults(cchats);

            if (cchats.length !== 0 && chat_id) {
                let targetedCurrentChat = cchats.find(c => c.chat_id === chat_id);
                setCurrentChat(targetedCurrentChat);
            }
            else
                cchats.length !== 0 ? setCurrentChat(cchats[0]) : setCurrentChat("nothing");
    
        } catch (error) {
            console.log('Error fetching chats:', error);
            toast.error("Failed to load chats. Please try again.")
        }
    };
    
    const blockUser = async(target) => {
        try {
            await post('/blockFriend/', {
                "user1": target.id,
                "type": "friend"
            })
            toast.success("You have successfully blocked " + target.username + ".");
            fetchChats();
        } catch (e) {
            console.log(e);
            toast.error("Failed to block " + target.username + ". Please try again.");
        }

    };

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
        fetchChats();
    }, []);


    useEffect(() => {        
        if (!userSearch || userSearch.trim() === ""){
            setSearchResults(chats);
            return ;
        };
        setSearchResults(chats.filter(friend => friend.user2.username.match(new RegExp(`\\b${userSearch}`, 'i'))));
        
    }, [userSearch])


    return (
        <div className="flex gap-6 h-[calc(100vh-8rem)]">
            {/* Chat List */}
            <Card className="glass w-64 p-4 flex flex-col gap-3">
                <Input type="text flex-initial" placeholder="Search chats..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />

                {searchResults ? (
                    searchResults.length !== 0 ? (
                        searchResults.map((chat, index) => {
                            return (
                                <div
                                    key={index}
                                    onClick={() => setCurrentChat(chats[index])}
                                    className={`flex items-center gap-3 p-2 rounded-lg hover-glass cursor-pointer ${currentChat === chats[index] && 'glass'}`}
                                >
                                    <Avatar className="flex-none">
                                        <AvatarImage src={chat.user2.avatar} alt="@shadcn" />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Avatar>
                                    <span>{chat.user2.username}</span>
                                </div>
                            );
                        })
                    ) : (
                        <span className="mt-1.5 text-gray-500 text-center">You have no chats.</span>
                    )
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <Spinner h="8" w="8" />
                    </div>
                )}


            </Card>

            {/* Chat Messages */}
            <Card className="glass border flex-1 min-w-54 flex round flex-col">
                {currentChat === "nothing" ? (
                    <div className="text-center p-6">
                        <h3 className="text-xl font-semibold">No chat selected</h3>
                        <p className="text-gray-500">Select a chat to view messages</p>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 p-6 rounded-lg flex flex-col gap-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-background">
                            <OldMessages currentChat={currentChat} user={user} messagesEndRef={messagesEndRef} setLoading={setLoading} />
                            <NewMessages currentChat={currentChat} user={user} socket={socket} setSocket={setSocket} isWsOpened={isWsOpened} messagesEndRef={messagesEndRef} />
                            <div ref={messagesEndRef}></div>

                        </div>

                        {/* Text Bar */}
                        <div className="p-4 border-t">
                            <form action="">
                                <div className="flex w-full space-x-2">
                                    <Input className="bg-background" type="text" placeholder="Type a message..." disabled={loading ? true : false} />
                                    <Button onClick={sendHandler} disabled={loading ? true : false}>
                                        <Send />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </Card>

            {/* User Details */}
            <Card className="glass w-80 p-6 space-y-6">
                {currentChat ? (
                    currentChat === "nothing" ? (
                        <div className="text-center flex justify-center items-center h-full flex-col">
                            <h3 className="text-xl font-semibold">No chat selected</h3>
                            <p className="text-gray-500">Select a chat to view details</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center">
                                <Avatar className="w-20 h-20 mx-auto cursor-pointer">
                                    <Link to={`/profile/${currentChat?.user2?.id}`}>
                                        <AvatarImage src={currentChat?.user2?.avatar} alt="avatar" />
                                        <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                                    </Link>
                                </Avatar>
                                <h3 className="text-xl mt-4 font-semibold">
                                    <Link to={`/profile/${currentChat?.user2?.id}`}>
                                        <span>{currentChat?.user2?.username}</span>
                                    </Link>
                                </h3>
                                <p className="text-sm text-gray-500">{currentChat?.user2?.online ? "Online" : "Offline"}</p>
                            </div>
                            <div className="space-y-2">

                                <InviteButton user_id={currentChat?.user2?.id} type={"game"} defaultStatus={"Challenge to Game"} className="w-full capitalize" />
                                
                                <InviteButton user_id={currentChat?.user2?.id} type={"tournament"} defaultStatus={"Invite to tournament"} className="w-full capitalize" />

                                <Button variant="destructive" className="w-full" onClick={() => blockUser(currentChat?.user2)}>
                                    <Ban />
                                    Block User
                                </Button>
                                {/* <Button variant="destructive" className="w-full">
                                    <X />
                                    Delete Chat
                                </Button> */}
                            </div>
                        </>
                    )
                ) : (
                    <div className="flex justify-center items-center h-full">
                        <Spinner w="8" h="8" />
                    </div>
                )}

            </Card>
        </div>
    );
}

