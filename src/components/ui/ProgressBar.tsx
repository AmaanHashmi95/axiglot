import { Progress } from "@/components/ui/progress";

export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full">
      <Progress value={progress} max={100} />
    </div>
  );
}