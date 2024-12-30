import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"; // Adjust the import according to your library

const Message = ({ message, messageId, isMine, user, avatar, time }) => {
    return (
        <div key={messageId} className={`my-1 flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
            <Avatar>
                <AvatarImage src={avatar} />
                <AvatarFallback>{user}</AvatarFallback>
            </Avatar>
            <div className="">
                <div className={`rounded-lg px-3 py-2 max-w-md ${isMine ? "bg-primary/20" : "glass"}`}>
                    <p>{message}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-0.5 ${isMine ? "text-right" : "text-left"}`}>{time}</p>
            </div>
        </div>
    );
};

export default Message;