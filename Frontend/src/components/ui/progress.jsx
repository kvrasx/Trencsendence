import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
      className
    )}
    {...props}>
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-[#628EFF] transition-all duration-500 ease-in-out"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }} />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

const ProgressDemo = ({value}) => {
  const [progress, setProgress] = React.useState(value/6)

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(value/2), 200)
    const timer2 = setTimeout(() => setProgress(value), 300)
    return () => {clearTimeout(timer); clearTimeout(timer2)}
  }, [])

  return <Progress value={progress} />
}

export { Progress, ProgressDemo }