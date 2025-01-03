import { Trophy, MessageSquare, Bell, User, Award, Gamepad2, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import xo from "@/assets/xo.svg";
import { FaTableTennis } from "react-icons/fa";
import { TbTicTac } from "react-icons/tb";

const navItems = [
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Award, label: "Leaderboard", path: "/leaderboard" },
  { icon: FaTableTennis, label: "Game", path: "/game" },
  { icon: TbTicTac, label: "TicTacToe", path: "/tic-tac-toe" },
  { icon: Trophy, label: "Tournament", path: "/tournament" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
];

const normalizePath = (path) => path.replace(/\/+$/, '');

export const Navbar = () => {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);

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
  );
};