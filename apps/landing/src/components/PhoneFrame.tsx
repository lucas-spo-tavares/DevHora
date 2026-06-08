import { cn } from "@/lib/utils";

type PhoneFrameProps = {
  alt: string;
  className?: string;
  src: string;
};

export function PhoneFrame({ alt, className, src }: PhoneFrameProps) {
  return (
    <div className={cn("relative h-full min-h-0 rounded-[2.5rem] bg-[#151a14] p-3 shadow-float", className)}>
      <div className="absolute left-1/2 top-3 h-1.5 w-20 -translate-x-1/2 rounded-full bg-white/15" />
      <div className="h-full overflow-hidden rounded-[2rem] border border-white/5 bg-[#eef2e5]">
        <img alt={alt} className="block h-full w-full object-cover object-top" loading="lazy" src={src} />
      </div>
    </div>
  );
}
