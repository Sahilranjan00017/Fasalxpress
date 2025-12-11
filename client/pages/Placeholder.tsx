import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface PlaceholderProps {
  title: string;
  description: string;
  features?: string[];
}

export function PlaceholderPage({
  title,
  description,
  features = [],
}: PlaceholderProps) {
  return (
    <>
      <Header />
      <main className="min-h-[calc(100vh-4rem)] bg-secondary/20 flex items-center justify-center">
        <div className="container max-w-2xl py-16">
          <div className="bg-white border border-border rounded-lg p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">🚀</div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {title}
            </h1>
            <p className="text-muted-foreground text-lg mb-8">{description}</p>

            {features.length > 0 && (
              <div className="bg-secondary/30 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold text-foreground mb-4">
                  Coming Soon:
                </p>
                <ul className="space-y-2">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
