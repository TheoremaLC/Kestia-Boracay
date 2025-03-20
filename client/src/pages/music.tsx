import { Logo } from "@/components/ui/logo";

export default function Music() {
  return (
    <div>
      <Logo />
      <div className="container mx-auto px-4">
        <h1 className="mb-6 text-2xl font-bold text-center">Music & Entertainment</h1>
        <p className="text-lg text-muted-foreground">
          Coming soon! Stay tuned for our live music events and entertainment schedule.
        </p>
      </div>
    </div>
  );
}