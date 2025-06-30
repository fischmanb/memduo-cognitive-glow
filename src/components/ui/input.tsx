
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md bg-black/30 border border-white/20 px-3 py-2 text-base text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:border-cyan-400 focus-visible:bg-black/40 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-300 backdrop-blur-sm",
          className
        )}
        ref={ref}
        {...props}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          ...props.style
        }}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
