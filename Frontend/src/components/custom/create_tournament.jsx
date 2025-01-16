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
import { Edit, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { post, get } from '@/lib/ft_axios';
import { Link } from 'react-router-dom';

export default function CreateTournament() {

  const [tournamentName, setTournamentName] = useState('')
  const [ongoingTournament, setOngoingTournament] = useState(null);

  const handleSubmit = async () => {
    try {
      let res = await post('tournament/create', {
        tournament_name: tournamentName
      });
      console.log(res);
      toast.success("Tournament created successfully.");
      setOngoingTournament(res?.tournament);
    } catch (e) {
      console.log(e);
      toast.error("Failed to create tournament. Please try again.");
    }
  };

  const handleCancelTournament = async () => {
    try {
      await post('tournament/cancel');
      toast.success("Tournament deleted successfully.");
      setOngoingTournament(null);
    } catch (e) {
      console.log(e);
      toast.error("Failed to delete tournament. Please try again.");
    }
  };

  useEffect(() => {

    const fetchOngoingTournament = async () => {
      try {
        let res = await get('tournament/get');
        console.log(res);

        setOngoingTournament(res?.tournament);
      } catch (e) {
        if (e?.response?.status !== 404)
          toast.error("Failed to fetch ongoing tournament. Please try again.");

        console.log(e);
      }
    }

    fetchOngoingTournament();

  }, [])

  return (
    <>
      {ongoingTournament ? (
        <Dialog>

          <DialogTrigger asChild>
            <Button variant="outline" className="p-6 w-64 border-accent"> <Edit />Manage tournament</Button>
          </DialogTrigger>

          <DialogContent className="sm:min-w-[570px]">
            <DialogHeader>
              <DialogTitle>Manage tournament</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3  gap-4 py-4">

              <p className="border border-accent p-2">Joinded players: <span className="text-green-400">{ongoingTournament.available_players}/4</span></p>
              <p className="border border-accent p-2">Played matches: <span className="text-green-400">2/3</span></p>
              <p className="border border-accent p-2">Current round: <span className="text-green-400">{ongoingTournament.current_round}/3</span></p>
              <p className="border border-accent p-2 col-span-3">Tournament status: <span className="text-green-400">Waiting for players..</span></p>






            </div>
            <DialogFooter>
              <div className="flex justify-between gap-4 items-center w-full mx-auto">
                <Link to="/tournament" className="w-full">
                  <Button type="submit" variant="" className="w-full" >View tournament</Button>
                </Link>
                <Button type="submit" variant="destructive" className="w-full" onClick={handleCancelTournament} >Cancel tournament</Button>
              </div>
            </DialogFooter>
          </DialogContent>

        </Dialog>
      ) : (
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
      )}

    </>
  );

}
