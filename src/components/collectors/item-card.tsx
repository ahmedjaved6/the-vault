import Image from "next/image";
import Link from "next/link";
import { Package, Calendar, DollarSign, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Collectible {
  id: string;
  name: string;
  category: string;
  image_url: string | null;
  current_value: number | null;
  cost_price: number | null;
  properties?: Record<string, any>;
}

export function ItemCard({ item, priority = false }: { item: Collectible, priority?: boolean }) {
  return (
    <Card className="group overflow-hidden border-border transition-all hover:shadow-md hover:border-coral/20">
      <Link href={`/app/${item.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {item.image_url ? (
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              priority={priority}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <Package className="h-12 w-12 opacity-20" />
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs font-semibold">
              {item.category}
            </Badge>
          </div>
        </div>
        <CardContent className="p-4">
          <h3 className="font-heading font-bold text-midnight dark:text-white line-clamp-1 group-hover:text-coral transition-colors">
            {item.name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center text-sm font-bold text-teal">
              <DollarSign className="h-3 w-3 mr-0.5" />
              <span>{item.current_value?.toLocaleString() || item.cost_price?.toLocaleString() || "N/A"}</span>
            </div>
            {item.properties?.edition && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Tag className="h-3 w-3 mr-1" />
                <span>{item.properties.edition}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
