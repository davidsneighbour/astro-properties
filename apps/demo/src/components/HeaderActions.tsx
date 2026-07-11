import { Button } from "@/components/ui/button";

export function HeaderActions() {
  return (
    <Button
      variant="outline"
      onClick={() => window.alert("Compare view is coming in a later phase.")}
    >
      Compare listings
    </Button>
  );
}
