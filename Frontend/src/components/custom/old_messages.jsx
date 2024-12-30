import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/contexts";
import { get } from "@/lib/ft_axios";
import Message from "@/components/ui/message";



export default function OldMessages({ currentChat, user }) {
    const [oldMessages, setOldMessages] = useState([]); // should start with the messages from the database

    useEffect(() => {
        
        if (!currentChat)
            return;
        get(`/getMessages/${currentChat.chat_id}`)
            .then(res => {
                setOldMessages(res);
            })
            .catch(error => {
                console.log('Error fetching messages:', error);
            })
    }, [currentChat]);

    return (
        <>
            {oldMessages && oldMessages.map((msg, index) => {
                return msg.msg && <Message
                    key={msg.id}
                    messageId={msg.id}
                    message={msg.msg}
                    isMine={msg.sender_id === user.id}
                    user={msg.sender_id === user.id ? user.username : currentChat.user2.username}
                    avatar={msg.sender_id === user.id ? user.avatar : currentChat.user2.avatar}
                    time={msg.sent_at}
                />;
            })}
        </>
    );
}