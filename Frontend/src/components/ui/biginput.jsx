import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";


export default function BigInput({ label, type = "text", ...props}) {

  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col mt-4 mb-2 w-full text-xl whitespace-nowrap">
      <div className="flex gap-10 justify-between items-center px-4 py-3.5 w-full rounded-xl border border-white border-solid">
        <label htmlFor={`${label.toLowerCase()}-input`} className="sr-only">{label}</label>
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          className="bg-transparent text-white border-none outline-none w-full"
          placeholder={label}
          aria-label={label}
          {...props}
        />
        {type === "password" && (
          <span className="cursor-pointer" onClick={() => setShowPassword(!showPassword)} >
            {showPassword ? <EyeOff /> : <Eye />}
          </span>
        )}
      </div>
    </div>
  );
};