import { FarmManagement } from "@/components/farm-management";

export default function FarmsPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          My Farms
        </h1>
        <p className="text-muted-foreground">
          Manage your farm profiles and get AI-powered crop suggestions.
        </p>
      </div>
      <FarmManagement />
    </div>
  );
}
