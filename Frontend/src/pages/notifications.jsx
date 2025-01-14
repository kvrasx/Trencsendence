import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Send, X, UserPlus, Swords, Ban, BellOff, LogIn, BellDot, Target } from "lucide-react";
import { get } from '@/lib/ft_axios';
import { post } from '@/lib/ft_axios';
import { Layout } from '@/components/custom/layout'


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useNavigate } from "react-router-dom";

export function Notifications({ setShowNotifications, socket }) {
  const [isSheetOpen, setIsSheetOpen] = useState(true);
  const [notifications, setNotifications] = useState([])
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        let res = await get('getNotifications/');  // Fetch notifications
        let chatPromises = res.map(async (d) => {
          // Fetch user info for each notification
          let userRes = await get(`user/get-info?user_id=${d.user1}`);
          d.user2 = userRes;  // Attach user info to the notification object
          return d;  // Return the updated notification
        });

        // Wait for all user info fetching promises to resolve
        let notificationsWithUserInfo = await Promise.all(chatPromises);

        // Now you can use the notificationsWithUserInfo array which contains the updated notifications
        // console.log(notificationsWithUserInfo);
        setNotifications(notificationsWithUserInfo);
        // console.log(notifications);
      } catch (e) {
      }

    };
    fetchNotifications();

  }, []);
  const toggleSheet = () => {
    setIsSheetOpen(!isSheetOpen);
  };

  // Handle when the sheet is opened or closed
  const handleSheetChange = (open) => {
    if (!open) {
      console.log("Sheet closed by the user");  // Handle the close action
      setShowNotifications(false);
      // You can perform additional actions here when the sheet is closed
    }
    setIsSheetOpen(open);  // Update the state to reflect the sheet's state
  };
  return (
    <div>
      <Sheet open={isSheetOpen} onOpenChange={handleSheetChange}>
        <SheetContent
          side="right"
          className="w-[90%] sm:w-[380px] md:w-[440px] lg:w-[600px] xl:w-[700px] min-h-[80vh] ml-16"
        >
          <SheetHeader>
            <SheetTitle className="text-4xl font-bold text-primary">Notifications</SheetTitle>
            <SheetDescription />
          </SheetHeader>
          <div className="grid gap-4">
            {notifications.length === 0 ? (
              <EmptyNotifications />
            ) : (
              <Card className="glass mt-4 h-screen w-auto p-4 flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-background">
                {notifications.map((notification, index) => (
                  notification.type === "friend" ? (
                    <NotificationItem
                      key={index}
                      index={index}
                      notifications={notifications}
                      notification={notification}
                      setNotifications={setNotifications}
                    />
                  ) : (
                    notification.type === "game" ? (
                      <GameItem
                        key={index}
                        index={index}
                        notifications={notifications}
                        notification={notification}
                        setNotifications={setNotifications}
                      />
                    ) : (
                      <JoinItem
                        key={index}
                        index={index}
                        notifications={notifications}
                        notification={notification}
                        setNotifications={setNotifications}
                      />
                    )
                  )
                ))}

              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>

  );



}


const EmptyNotifications = () => {
  return (
    <div className="flex flex-col items-center justify-center h-96 p-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <BellOff className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
      <p className="text-muted-foreground text-sm">
        When you get notifications, they'll show up here.
      </p>
    </div>
  );
};


export default EmptyNotifications;


const NotificationItem = ({ notifications, notification, index, setNotifications }) => {
  let userId = notification.user2.id
  let picture = notification.user2.avatar
  let name = notification.user2.username
  const defaultPicture =
    'https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg';

  const declineClick = async (id) => {
    let res = await post(`/decline/`, { "user1": id, "type": "friend" });
    setNotifications(prevNotifications =>
      prevNotifications.filter((_, i) => i !== index)
    )
  }

  const acceptClick = async (id) => {
    let res = await post(`/accept/`, { "user1": id, "type": "friend" });

    setNotifications(prevNotifications =>
      prevNotifications.filter((_, i) => i !== index)
    );
  }

  return (
    <div className="flex mt-2 items-center justify-between p-4 rounded-lg glass hover-glass border-l-4 border-primary">
      <div className="flex items-center gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-bell-dot h-16 w-16 text-primary"
        >
          <path d="M19.4 14.9C20.2 16.4 21 17 21 17H3s3-2 3-9c0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.3"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          <circle cx="18" cy="8" r="3"></circle>
        </svg>
        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <img
            className="aspect-square h-full w-full"
            src={picture || defaultPicture}
            alt={`${name}'s profile`}
          />
        </span>
        <div>
          <span className="font-medium">{name}</span>
          <span className="text-muted-foreground"> sent you a friend request</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={acceptClick.bind(null, userId)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-check h-4 w-4"
          >
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        </button>
        <button onClick={declineClick.bind(null, userId)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 rounded-md px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x h-4 w-4"
          >
            <path d="M18 6 6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};




const GameItem = ({ notifications, notification, index, setNotifications }) => {
  let userId = notification.user2.id
  let picture = notification.user2.avatar
  let name = notification.user2.username
  const defaultPicture =
    'https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg';

  const declineClick = async (id) => {
    let res = await post(`/decline/`, { "user1": id, "type": "game" });
    setNotifications(prevNotifications =>
      prevNotifications.filter((_, i) => i !== index)
    )
  }

  const acceptClick = async (id) => {
    let res = await post(`/accept/`, { "user1": id, "type": "game" });
    console.log("game groop name ->");
    console.log(res);
    const updatedNotification = { ...notification, type: "join" };

    const updatedNotifications = notifications.map((notif, i) =>
      i === index ? updatedNotification : notif
    );

    setNotifications(updatedNotifications);
  }

  return (
    <div className="flex mt-2 items-center justify-between p-4 rounded-lg glass hover-glass border-l-4 border-primary">
      <div className="flex items-center gap-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-bell-dot h-16 w-16 text-primary"
        >
          <path d="M19.4 14.9C20.2 16.4 21 17 21 17H3s3-2 3-9c0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.3"></path>
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
          <circle cx="18" cy="8" r="3"></circle>
        </svg>
        <span className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <img
            className="aspect-square h-full w-full"
            src={picture || defaultPicture}
            alt={`${name}'s profile`}
          />
        </span>
        <div>
          <span className="font-medium">{name}</span>
          <span className="text-primary"> invited you to a game</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={acceptClick.bind(null, userId)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-check h-4 w-4"
          >
            <path d="M20 6 9 17l-5-5"></path>
          </svg>
        </button>
        <button onClick={declineClick.bind(null, userId)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 rounded-md px-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x h-4 w-4"
          >
            <path d="M18 6 6 18"></path>
            <path d="M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  );
};





const   JoinItem = ({ notifications, notification, index, setNotifications }) => {
  let userId = notification.user2.id
  let picture = notification.user2.avatar
  let name = notification.user2.username
  const defaultPicture =
    'https://simplyilm.com/wp-content/uploads/2017/08/temporary-profile-placeholder-1.jpg';

  // const declineClick = async (id) => {
  //   let res = await post(`/decline/`, { "user1": id, "type": "game" });
  //   setNotifications(prevNotifications =>
  //     prevNotifications.filter((_, i) => i !== index)
  //   )
  // }

  const joinClick = async (id) => {
    // let res = await post(`/accept/`, { "user1": id, "type": "game" });
    // console.log(res);
    
    window.location.href = "/ping-pong/" + notification?.friendship_id
    console.log("game groop name ->");
    
  }

  return (
    <div className="flex items-center justify-between p-4 mt-2 rounded-lg backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3)] border-l-4 border-l-primary transition-all duration-200 hover:bg-white/10">
      <div className="flex items-center gap-4">
        <BellDot className="h-6 w-6 text-primary" />
        <div className="relative h-10 w-10 overflow-hidden rounded-full">
          <img
            className="aspect-square h-full w-full object-cover"
            src={picture || defaultPicture}
            alt={`${name}'s profile`}
          />
        </div>
        <div className="max-w-[45px] min-w-[39px]">
          <span className="font-medium truncate block">{name}</span>
        </div>
      </div>
      <div className="flex gap-2 ml-4">
        <Button
          onClick={() => joinClick(userId)}
          className="inline-flex items-center gap-1"
        >
          <Target className="h-4 w-4" />
          Join Match
        </Button>
      </div>
    </div>
  );
};


