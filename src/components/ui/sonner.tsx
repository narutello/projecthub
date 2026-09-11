import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card text-card-foreground shadow-[var(--shadow-border)]",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  );
}
