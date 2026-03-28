import { cn } from "@/lib/utils";

export function StorePageHero({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-10 rounded-xl border border-white/[0.06] bg-gradient-to-br from-card via-card/90 to-background p-6 shadow-lg shadow-black/25 md:p-8",
        className
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
