/**
 * @file client/src/app/pages/NotFoundPage.tsx
 * @description 404 error page displayed for unmatched routes
 */

import { Card, CardContent } from "@/shared/ui/primitives/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/shared/ui/primitives/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Card className="w-full max-w-md mx-4 shadow-sm border-border/60">
        <CardContent className="pt-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground mb-6">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
