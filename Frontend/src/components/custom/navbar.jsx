import { Trophy, MessageSquare, Bell, User, Award, Gamepad2, LogOut, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import xo from "@/assets/xo.svg";
import { FaTableTennis } from "react-icons/fa";
import { TbTicTac } from "react-icons/tb";
import { useState } from "react";

import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const navItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Award, label: "Leaderboard", path: "/leaderboard" },
  { icon: FaTableTennis, label: "Game", path: "/ping-pong" },
  { icon: TbTicTac, label: "TicTacToe", path: "/tic-tac-toe" },
  { icon: Trophy, label: "Tournament", path: "/tournament" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
];

const normalizePath = (path) => path.replace(/\/+$/, '');

export const Navbar = () => {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);

  const [defaultTheme, setDefaultTheme] = useState(localStorage.getItem("theme"))

  return (
    <div className="fixed left-0 top-0 h-screen w-16 glass py-8">
      <div className="flex h-full flex-col items-center justify-between ">
        <div className="flex-1 flex flex-col items-center gap-8">
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`relative p-3 rounded-lg hover-glass group ${currentPath === normalizePath(path) ? "bg-primary/20" : ""}`}
            >

              <Icon className="h-6 w-6" />
              <span className="absolute left-14 rounded-md px-2 py-1 glass invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                {label}
              </span>
            </Link>
          ))}
        </div>


        <div className="flex flex-col items-center gap-2">

          <Dialog>
            <DialogTrigger>
              <div
                key="/logout"
                className="cursor-pointer relative p-3 rounded-lg hover-glass group"
              >
                <Settings className="h-6 w-6" />
                <span className="absolute left-14 rounded-md px-2 py-1 glass invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
                  Logout
                </span>
              </div>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="capitalize text-center">Customize your gaming experience</DialogTitle>
                <DialogDescription className="flex justify-center items-center">
                  <RadioGroup defaultValue={defaultTheme} className="p-5" onValueChange={(choice) => {
                    localStorage.setItem("theme", choice);
                    setDefaultTheme(choice);
                  }}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="default" id="r1" />
                      <Label htmlFor="r1">Default Theme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="theme1" id="r2" />
                      <Label htmlFor="r2">Theme 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="theme2" id="r3" />
                      <Label htmlFor="r3">Theme 2</Label>
                    </div>
                  </RadioGroup>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>


          </Dialog>
          <Link
            key="/logout"
            to="/logout"
            className={`relative p-3 rounded-lg hover-glass group ${currentPath === normalizePath("/logout") ? "bg-primary/20" : ""}`}
          >
            <LogOut className="h-6 w-6" />
            <span className="absolute left-14 rounded-md px-2 py-1 glass invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200">
              Logout
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};