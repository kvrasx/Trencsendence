import { useState, useContext, useEffect, useRef } from "react";
import { UserContext } from "@/contexts";
import { get } from "@/lib/ft_axios";
import Message from "@/components/ui/message";
import { toast } from "react-toastify";
import Spinner from '@/components/ui/spinner';


export default function OldMessages({ currentChat, user, messagesEndRef, setLoading }) {
    const [oldMessages, setOldMessages] = useState(null); // should start with the messages from the database
    
    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        };
        
        scrollToBottom();
    }, [oldMessages]);

    useEffect(() => {

        const fetchMessages = async () => {
            if (!currentChat) return;

            try {
                const res = await get(`/getMessages/${currentChat.chat_id}`);                
                setOldMessages(res);
            } catch (error) {
                console.log('Error fetching messages:', error);
                toast.error('Failed to load messages. Please try again.');
            } finally{
                setLoading(false);
            }
        };

        fetchMessages();

    }, [currentChat]);

    return (
        <>
            {oldMessages ? oldMessages.map((msg, index) => {
                return msg.msg && <Message
                    key={msg.id}
                    messageId={msg.id}
                    message={msg.msg}
                    isMine={msg.sender_id === user.id}
                    user={msg.sender_id === user.id ? user.username : currentChat.user2.username}
                    avatar={msg.sender_id === user.id ? user.avatar : currentChat.user2.avatar}
                    time={msg.sent_at}
                    userId={msg.sender_id}
                />;
            }) : (
                <div className="flex justify-center items-center h-48">
                    <Spinner />
                </div>
            )}

        </>
    );
}