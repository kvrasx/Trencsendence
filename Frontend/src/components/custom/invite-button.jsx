import { useEffect, useState } from "react";
import { get, post } from '@/lib/ft_axios';
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

export default function InviteButton({ user, type }) {

    const [status, setStatus] = useState(type === "friend" ? "Add Friend" : "Challenge to Match");

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await get(`/invitation-status/${type}/${user.id}`);
                console.log("invite button", response);
                setStatus(`${type} Invite ${response.status}`);
            } catch (e) {
                if (e.response && e.response.status === 404) {
                    setStatus(type === "friend" ? "Add Friend" : "Challenge to Match");
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
            setStatus(`${type} Invite Pending`);
            toast.success("Friend request sent successfully!");
        } catch (e) {
            console.log(e);
            toast.error("Failed to send friend request. Please try again.");
        }

    }


    return (
        <Button onClick={() => sendInvite(user.id)} variant="outline" className="capitalize p-6 w-64 border-accent disabled:opacity-100 disabled:bg-accent" disabled={status !== "Add Friend" || status !== "Challenge to Match"}>
            <UserPlus /> {status}
        </Button>
    )
}