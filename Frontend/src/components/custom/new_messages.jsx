import { useState, useContext, useEffect, useRef } from "react";
import { get } from "@/lib/ft_axios";
import Message from "@/components/ui/message";
import Cookies from 'js-cookie';

export default function NewMessages({ currentChat, user, socket, setSocket, isWsOpened }) {
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };
    
    const [newMessages, setNewMessages] = useState([]); // should start with the messages from the database
    
    useEffect(() => {
        if ((isWsOpened.current && socket) || !currentChat)
            return;
        const token = Cookies.get('access_token');
        console.log(token);

        const newsocket = new WebSocket(`ws://localhost:8000/ws/chat/${currentChat.chat_id}/?token=${token}`);


        newsocket.onopen = () => {
            setNewMessages([]);
            console.log('WebSocket connection established.');
            setSocket(newsocket);
            isWsOpened.current = true;
        };

        newsocket.onmessage = (event) => {
            const receivedMessage = JSON.parse(event.data);
            console.log('Received message:', receivedMessage);

            setNewMessages((prevMessages) => [receivedMessage.message, ...prevMessages]);
        };

        newsocket.onerror = (_) => {
            // console.log("A websocket error has happened");
            if (isWsOpened.current) {
                console.log("reconnecting to the websocket after an error now..");
                isWsOpened.current = false;
                setSocket(null);
            }

        };


        return () => {
            newsocket.close();
            setSocket(null);
            isWsOpened.current = false;
        };
    }, [isWsOpened, currentChat]);

    return (
        <>
            {
                newMessages && newMessages.map((msg, index) => {
                    return msg.msg && <Message
                        key={msg.id}
                        messageId={msg.id}
                        message={msg.msg}
                        isMine={msg.sender_id === user.id}
                        user={msg.sender_id === user.id ? user.username : currentChat.user2.username}
                        avatar={msg.sender_id === user.id ? user.avatar : currentChat.user2.avatar}
                        time={formatDate(msg.sent_at)}
                    />;
                })
            }
        </>
    );
}