import BigInput from "@/components/ui/biginput"
import { useState } from "react"
import Logo42 from "@/assets/42.svg"
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const intraApiUrl = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-130a1202541bd6319e459cf8ad6a3b5974e3e6390afce2a70f081a497e7f8bbe&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Fapi%2Fauth%2FOAuth&response_type=code'

export default function Auth({ setUser }) {
  const [isSignup, setIsSignup] = useState(false);

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

      const response = await axios.post(`http://localhost:8000/${endpoint}`, payload, { withCredentials: true });
      isSignup ? toast.success("You've created an account successfully!") : toast.success("You've logged in successfully!");
      setIsSignup(false);

      if (response.data.user) {
        setTimeout(() => {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }, 1000);
      }
    } catch (err) {
      console.log(err);
      if (err.response && err.response.status === 400) {
        toast.error(`Invalid ${isSignup ? "registration" : "login"} form data.`);
      } else if (err.response && err.response.status === 404) {
        toast.error("Invalid username or password.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-image bg-cover bg-no-repeat bg-center relative flex items-center justify-center p-4">
      <div className="relative flex justify-center">
        <div className="flex flex-col items-center justify-center w-full md:w-[60%] rounded-lg md:rounded-l-lg md:rounded-r-none p-6 shadow-sm backdrop-blur-[26.5px] border border-solid border-accent">
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
        </div>

        <div className="hidden md:flex flex-col w-[44%]">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/6cf02da4bad24179a51f8a7eecbdc347/22567e203d7fccc709b8fdb4363ed7dd90b445c3bdff983c0814e065fd27302f?apiKey=6cf02da4bad24179a51f8a7eecbdc347&"
            alt=""
            className="object-contain grow w-full rounded-none aspect-[0.84]"
          />
        </div>
      </div>
      <ToastContainer pauseOnFocusLoss={false} theme="dark" position="bottom-right" autoClose={1000} />
    </div>
  );
}