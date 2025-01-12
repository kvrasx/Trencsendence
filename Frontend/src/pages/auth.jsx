import BigInput from "@/components/ui/biginput"
import { useEffect, useState } from "react"
import Logo42 from "@/assets/42.svg"
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import auth_img from "@/assets/auth.png"

const intraApiUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-c1875c5f2e6306bab3da45484c4d83553ef06bd9b5478c76476541d74d20ebb6&redirect_uri=http%3A%2F%2F167.99.138.209%3A80%2Fapi%2Fauth%2FOAuth&response_type=code'

export default function Auth({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isOtp, setIsOtp] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const qs = queryParams.get('otp');
    const otpTarget = queryParams.get('username');
    if (qs === "true" && otpTarget) {
      setUsername(otpTarget);
      setIsOtp(true);
    }
  }, [location.search]);

  const handleOTP = async (e) => {
    e.preventDefault();
    try {
      let res = await axios.post(`http://${import.meta.env.VITE_HOST}/OTP/verify`, {
        username: username,
        code: e.target.otp.value
      }, {withCredentials: true});
      if (res.status === 200) {
        toast.success("You've logged in successfully!");
        if (res.data.user) {
          setUser(res.data.user);
        }
      }
    } catch (e) {
      if (e.response?.data?.error) {
        toast.error(e.response?.data?.error);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (isSignup && password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const endpoint = isSignup ? "api/user/create" : "api/auth/login";
      const payload = isSignup
        ? { username, email, password }
        : { username, password };

      const response = await axios.post(`http://${import.meta.env.VITE_HOST}/${endpoint}`, payload, { withCredentials: true });
      isSignup ? toast.success("You've created an account successfully!") : toast.success("You've logged in successfully!");
      setIsSignup(false);

      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 301) {
        setUsername(username);
        setIsOtp(true);
        console.log("should verify OTP here");
      } else if (err.response && err.response.status === 400) {
        toast.error(`Invalid ${isSignup ? "registration" : "login"} form data.`);
      } else if (err.response && err.response.status === 404) {
        toast.error("Invalid username or password.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="h-screen bg-dark-image bg-cover bg-no-repeat bg-center relative flex items-center justify-center p-24">
      <div className="relative flex justify-center">
        <div className="flex flex-col items-center justify-center w-full md:w-[60%] rounded-lg md:rounded-l-lg md:rounded-r-none p-6 shadow-sm backdrop-blur-[26.5px] border border-solid border-accent">
          {!isOtp ? (
            <form onSubmit={handleSubmit} className="w-full max-w-md">
              <div className="flex flex-col">
                {!isSignup ? (
                  <>
                    <h1 className="text-3xl md:text-4xl font-semibold">Welcome Back</h1>
                    <p className="text-base font-small">Glad to see you again!</p>
                  </>
                ) : ""}
                <BigInput
                  label="username"
                  name="username"
                  minLength="5"
                  required
                />
                {isSignup ? <BigInput
                  label="email"
                  name="email"
                  type="email"
                  required
                /> : ""}
                <BigInput
                  label="password"
                  type="password"
                  name="password"
                  minLength="8"
                  required
                />
                {isSignup ? <BigInput
                  label="confirm password"
                  type="password"
                  name="confirmPassword"
                  required
                /> : ""}

                <button className="mt-3.5 py-3 md:py-4 font-semibold bg-gradient-to-r from-[#628EFF] via-[#8566FF] to-[#8566FF] rounded-lg auth-btn-hover">
                  {isSignup ? "Create an Account" : "Login"}
                </button>

                <div className="flex gap-5 mt-4 items-center justify-center">
                  <div className="shrink-0 self-stretch max-w-36 my-auto h-0.5 border-2 border-solid border-stone-50 w-[170px]" />
                  <div className="self-stretch my-auto">Or</div>
                  <div className="shrink-0 self-stretch max-w-36 my-auto h-0.5 border-2 border-solid border-stone-50 w-[170px]" />
                </div>

                <a
                  href={intraApiUrl}
                  className="flex auth-42btn-hover justify-center items-center px-2.5 py-3 md:py-4 mt-3.5 text-lg md:text-xl font-semibold text-black rounded-xl bg-gradient-to-r from-[#FFFFFF] via-[#DEDEDE] to-[#BFBFBF] hover:from-[#BFBFBF] hover:via-[#DEDEDE] hover:to-[#FFFFFF] transition-all duration-300 w-full"
                >
                  <div className="flex gap-2 items-center justify-center">
                    <img
                      loading="lazy"
                      src={Logo42}
                      alt=""
                      className="object-contain w-8 md:w-10 aspect-[1.5]"
                    />
                    <div>Sign in with 42 intra</div>
                  </div>
                </a>

                <div className="text-center mt-3 text-sm md:text-base font-medium text-white">
                  {!isSignup ? (
                    <span className="cursor-pointer" onClick={() => setIsSignup(true)}>Don't have an account? Signup</span>
                  ) : (
                    <span className="cursor-pointer" onClick={() => setIsSignup(false)}>Already have an account? Login</span>
                  )}
                </div>
              </div>
            </form>
          ) : (

            <div>
              <form onSubmit={handleOTP} className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-semibold">OTP Verification</h1>
                <p className="text-base font-small">Check your OTP authenticator app to get your code!</p>
                <BigInput
                  label="xxx xxx"
                  name="otp"
                  minLength="6"
                  maxLength="6"
                  required
                />

                <button className="mt-3.5 py-3 md:py-4 font-semibold bg-gradient-to-r from-[#628EFF] via-[#8566FF] to-[#8566FF] rounded-lg auth-btn-hover">
                  Verify OTP
                </button>
              </form>
            </div>

          )
          }
        </div>

        <div className="hidden md:flex flex-col w-[44%]">
          <img
            // loading="lazy"
            src={auth_img}
            alt=""
            className="object-contain grow w-full rounded-none aspect-[0.84]"
          />
        </div>
      </div>
      {/* <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose={1000} /> */}
    </div>
  );
}