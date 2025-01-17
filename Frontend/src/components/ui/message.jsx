import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import { formatDistanceToNow } from 'date-fns';
import { Link } from "react-router-dom";
import defaultAvatar from "@/assets/profile.jpg";

const Message = ({ message, messageId, isMine, user, avatar, time, userId }) => {
    const timeAgo = formatDistanceToNow(new Date(time), { addSuffix: true });
    
    const renderMessageWithLinks = (text) => {
        const urlRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = urlRegex.exec(text)) !== null) {
            // Add text before the match
            if (match.index > lastIndex) {
                parts.push(text.slice(lastIndex, match.index));
            }

            const [fullMatch, href, linkText] = match;

        
            // Check if the URL matches our Vite host
            const isInternalUrl = href.startsWith(`https://${import.meta.env.VITE_HOST}/`);

            if (isInternalUrl) {
                // Extract the path part from the full URL
                const path = new URL(href).pathname;
                parts.push(
                    <Link 
                        key={`link-${match.index}`}
                        to={path}
                        className="text-blue-500 hover:underline"
                    >
                        {linkText}
                    </Link>
                );
            } else {
                parts.push(fullMatch);
            }

            lastIndex = match.index + fullMatch.length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push(text.slice(lastIndex));
        }

        return parts;
    };

    return (
        <div key={messageId} className={`my-1 flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}>
            <Avatar>
                <Link to={`/profile/${userId}`}>
                    <AvatarImage src={avatar} />
                    <AvatarFallback><img src={defaultAvatar} alt="default avatar" /></AvatarFallback>
                </Link>
            </Avatar>
            <div className="">
                <div className={`rounded-lg px-3 py-2 max-w-md ${isMine ? "bg-primary/20" : "glass"} break-words overflow-wrap`}>
                    <p>{renderMessageWithLinks(message)}</p>
                </div>
                <p className={`text-xs text-gray-500 mt-0.5 ${isMine ? "text-right" : "text-left"}`}>{timeAgo}</p>
            </div>
        </div>
    );
};

export default Message;