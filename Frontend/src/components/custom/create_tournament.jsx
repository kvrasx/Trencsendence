import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {post} from '@/lib/ft_axios';

export default function CreateTournament() {
  
  const [tournamentName, setTournamentName] = useState('')

  const handleSubmit = async () => {
    try {
      await post('tournament/create', {
        tournament_name: tournamentName
      });
      toast.success("Tournament created successfully.");
    } catch (e) {
      console.log(e);
      toast.error("Failed to create tournament. Please try again.");
    }
  };

  return (
    <Dialog>

      <DialogTrigger asChild>
        <Button variant="outline" className="p-6 w-64 border-accent"> <Edit />Create Tournament</Button>
      </DialogTrigger>

      <DialogContent className="sm:min-w-[570px]">
        <DialogHeader>
          <DialogTitle>Create tournament</DialogTitle>
          <DialogDescription>
            Create a party, invite your friends, and have some fun.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">

            <Label htmlFor="name" className="text-right col-span-1">
              Tournament Name
            </Label>
            <Input id="name" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} placeholder="wlad ghanm" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">

            <Label htmlFor="name" className="text-right col-span-1">
              Players Number
            </Label>
            <Input id="name" value="4" className="col-span-3" disabled />
          </div>
          
        
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} >Create tournament</Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}
