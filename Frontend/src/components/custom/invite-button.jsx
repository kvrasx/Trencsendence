import { useEffect, useState } from "react";
import { get, post } from '@/lib/ft_axios';
import { Swords, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function InviteButton({ user_id, type, defaultStatus, ...props }) {
    
    const [status, setStatus] = useState(defaultStatus);


    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await get(`/invitation-status/${type}/${user_id}`);
                console.log("invite button", response);
                setStatus(`${type} Invite ${response.status}`);
            } catch (e) {
                if (e.response && e.response.status === 404) {
                    setStatus(defaultStatus);
                }
                console.log(e);
            }
        }

        fetchStatus();
    }, [])

    const sendInvite = async (target) => {
        try {
            let res = await post('/invite/', {
                "user1": target,
                "type": type
            });
            console.log(res);
            setStatus(`${type} Invite Pending`); // type will be capitalized by tailwind classname
            toast.success(type.charAt(0).toUpperCase() + type.slice(1) + " request sent successfully!");
        } catch (e) {
            console.log(e);
            toast.error("Failed to send " + type + " request. Please try again.");
        }

    }


    return (
        <Button onClick={() => sendInvite(user_id)} variant="outline" {...props} disabled={status !== defaultStatus}>
            {type === "game" ? <Swords /> : <UserPlus />} {status}
        </Button>
    )
}