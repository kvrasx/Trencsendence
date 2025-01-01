import { useState, useRef, useEffect, useCallback } from "react";
import { Search, User, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { get } from '@/lib/ft_axios';
import { Link } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Notifications } from "../../pages/notifications";

function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export default function SearchBar() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchContainerRef = useRef(null);
  const [showNotifications, setShowNotifications] = useState(false);

console.log(showNotifications);


  const handleSearch = async (query) => {
    if (!query) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await get(`/api/user/get-all?search=${query}`);
      setUsers(response);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Memoize the debounced function
  const debouncedSearch = useCallback(debounce(handleSearch, 500), []);

  const handleInputChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    debouncedSearch(query);
  };

  const handleClickOutside = (event) => {
    if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
      setSearch("");
      setUsers([]);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {showNotifications && <Notifications setShowNotifications={setShowNotifications} />}
      <div className="fixed top-0 left-16 right-0 h-16 glass z-50">
        <div ref={searchContainerRef} className="container h-full flex items-center justify-center gap-4">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={handleInputChange}
              placeholder="Search..."
              className="pl-10 bg-secondary/50"
            />

            {(isLoading || users.length > 0) && search && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-lg overflow-hidden">
                <ScrollArea className="max-h-[300px]">
                  {isLoading ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Loading...
                    </div>
                  ) : (
                    <div className="py-2">
                      {users.map((user) => (
                        <Link
                          key={user.id}
                          to={`/profile/${user.id}`}
                          className="flex rounded-lg mx-2 items-center gap-3 px-4 py-2 hover-glass"
                        >
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={user?.avatar} />
                              <AvatarFallback><User className="h-4 w-4 text-muted-foreground" /></AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user.username}
                            </span>
                            {user.display_name && (
                              <span className="text-xs text-muted-foreground">
                                {user.display_name}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>
            )}
          </div>
          {/* <Link to="/notifications"> */}
          <Button variant="ghost" size="icon" className="relative" onClick={() => { setShowNotifications(true) }} >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs flex items-center justify-center">
              3
            </span>
          </Button>
          {/* </Link> */}
        </div>
      </div>
    </>
  );
}
