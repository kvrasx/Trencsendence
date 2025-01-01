import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { get } from "@/lib/ft_axios"
import Spinner from "@/components/ui/spinner";

export default function CreateTournament({ updateProfile, user }) {

  const [two_factor_status, setTwoFactorStatus] = useState(user.two_factor_status ?? false);
  const [two_factor_secret, setTwoFactorSecret] = useState(null);

  useEffect(() => {
    if (!two_factor_status) return;

    const getTwoFactorSecret = async () => {
      try {
        let res = await get('/api/OTP/get-qr');
        setTwoFactorSecret(res.qr_code);        
      } catch (e) {
        toast.error("Failed to get 2FA QR code. Please try again.");
      }
    };
    getTwoFactorSecret();
  }, [])

  const [profile, setProfile] = useState({
    displayName: user.display_name ?? '',
    email: user.email ?? '',
    password: user.password ?? '',
    confirmPassword: user.confirmPassword ?? ''
  })

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  };

  const handleSubmit = async () => {
    try {

      if (profile.password === '' && profile.displayName === user.display_name && profile.email === user.email && user.two_factor_status === two_factor_status) {
        toast.error("No changes detected in your profile.");
        return;
      }

      if (profile.password !== profile.confirmPassword) {
        toast.error("Password and confirm password do not match.");
        return;
      }

      const updatedProfile = {};
      if (profile.displayName !== user.display_name) updatedProfile.display_name = profile.displayName;
      if (profile.email !== user.email) updatedProfile.email = profile.email;
      if (profile.password !== '') updatedProfile.password = profile.password;
      if (two_factor_status !== user.two_factor_status) updatedProfile.two_factor_status = two_factor_status;

      await updateProfile(updatedProfile, "Profile has been updated successfully!");
    } catch (e) {
      // console.log(e);
      toast.error(e?.response?.data?.password?.[0] ?? e?.response?.data?.display_name?.[0] ?? e?.response?.data?.email?.[0] ?? "Failed to update profile. Please try again.");
    }
  };


  return (
    <Dialog>

      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2 mb-2"> <Settings /> Edit Profile</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Display Name
            </Label>
            <Input name="displayName" value={profile.displayName} minLength="5" maxLength="24" placeholder="flitox" onChange={handleChange} className="col-span-3" />
          </div>
          {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input name="username" value={profile.username} onChange={handleChange} className="col-span-3" />
          </div> */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Email
            </Label>
            <Input name="email" value={profile.email} type="email" placeholder="flitox@mail.com" onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Password
            </Label>
            <Input name="password" type="password" minLength="8" value={profile.password} placeholder="••••••••" onChange={handleChange} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Confirm Password
            </Label>
            <Input name="confirmPassword" type="password" value={profile.confirmPassword} placeholder="••••••••" onChange={handleChange} className="col-span-3" />
          </div>
          <hr />

          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4 py-2">
              <Label htmlFor="2fa" className="text-right font-semibold ">
                2FA
              </Label>
              <Switch
                className="col-span-3"
                checked={two_factor_status}
                onCheckedChange={setTwoFactorStatus}
              />            
            </div>
          </div>


          {user.two_factor_status && (
            <div className="flex justify-center">
              {two_factor_secret ? (
                <img
                  className="max-w-64 max-h-64 text-center bg-white"
                  src={two_factor_secret}
                  alt="qr code example"
                />
              ) : (
                <Spinner h="8" w="8" />
              )}
            </div>
          )}


        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit}>Save changes</Button>
        </DialogFooter>
      </DialogContent>

    </Dialog>
  )
}
