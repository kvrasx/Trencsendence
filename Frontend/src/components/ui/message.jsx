import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "./avatar"; // Adjust the import according to your library
import { formatDistanceToNow } from 'date-fns';
import { Link } from "react-router-dom";
import defaultAvatar from "@/assets/profile.jpg";

const Message = ({ message, messageId, isMine, user, avatar, time, userId }) => {
    const timeAgo = formatDistanceToNow(new Date(time), { addSuffix: true });
    console.log(user);
    
    return (
        <div key={messageId} className={`my-1 flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
            <Avatar>
                <Link to={`/profile/${userId}`}>
                    <AvatarImage src={avatar} />
                    <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                </Link>
            </Avatar>
            <div className="">
                <div className={`rounded-lg px-3 py-2 max-w-md ${isMine ? "bg-primary/20" : "glass"}`}>
                    <p>{message}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-0.5 ${isMine ? "text-right" : "text-left"}`}>{timeAgo}</p>
            </div>
        </div>
    );
};

export default Message;