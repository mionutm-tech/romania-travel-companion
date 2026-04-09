import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 sm:mb-12", className)}>
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-forest">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
