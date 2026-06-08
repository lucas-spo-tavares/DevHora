import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div className={cn("rounded-[28px] border border-line/80 bg-white/82", className)} ref={ref} {...props} />
));

Card.displayName = "Card";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("p-6 md:p-8", className)} ref={ref} {...props} />
);

CardContent.displayName = "CardContent";

export { Card, CardContent };
