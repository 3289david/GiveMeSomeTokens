import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-orange-500/20 text-orange-400",
        secondary: "border-transparent bg-zinc-800 text-zinc-400",
        outline: "border-zinc-700 text-zinc-400",
        claude: "border-transparent bg-orange-500/20 text-orange-400",
        openai: "border-transparent bg-green-500/20 text-green-400",
        gemini: "border-transparent bg-blue-500/20 text-blue-400",
        openrouter: "border-transparent bg-purple-500/20 text-purple-400",
        groq: "border-transparent bg-yellow-500/20 text-yellow-400",
        bronze: "border-transparent bg-amber-700/20 text-amber-500",
        silver: "border-transparent bg-zinc-400/20 text-zinc-300",
        gold: "border-transparent bg-yellow-500/20 text-yellow-400",
        platinum: "border-transparent bg-cyan-500/20 text-cyan-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
