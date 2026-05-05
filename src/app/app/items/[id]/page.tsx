import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Calendar, 
  DollarSign, 
  Tag, 
  ExternalLink,
  Share2,
  Package,
  History,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let item = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("collectibles")
      .select("*")
      .eq("id", id)
      .single();
    item = data;
  } catch (error) {
    return (
      <div className="flex h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Error Loading Item</h1>
          <p className="text-muted-foreground">There was a problem accessing your collection. Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  const profit = item.current_value && item.cost_price 
    ? item.current_value - item.cost_price 
    : 0;
  const profitPercentage = item.cost_price 
    ? (profit / item.cost_price) * 100 
    : 0;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild className="-ml-2">
          <Link href="/app">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Collection
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/app/items/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/card/${id}`} target="_blank">
              <Share2 className="mr-2 h-4 w-4" />
              Share Card
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image & Gallery */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border">
            {item.image_url ? (
              <Image
                src={item.image_url}
                alt={item.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="h-20 w-20 opacity-20" />
              </div>
            )}
          </div>
          
          {item.gallery_urls && item.gallery_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {item.gallery_urls.map((url: string, i: number) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  <Image
                    src={url}
                    alt={`${item.name} gallery ${i}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Info & Stats */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-coral/10 text-coral border-coral/20">
                {item.category}
              </Badge>
              {item.condition && (
                <Badge variant="outline">
                  {item.condition}
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-heading font-bold text-midnight dark:text-white mb-2">
              {item.name}
            </h1>
            <p className="text-lg text-muted-foreground line-clamp-3">
              {item.description || "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-teal/5 border-teal/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-teal flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Current Value
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal">
                  ${item.current_value?.toLocaleString() || "N/A"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Cost Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${item.cost_price?.toLocaleString() || "N/A"}
                </div>
              </CardContent>
            </Card>

            <Card className={profit >= 0 ? "bg-teal/5 border-teal/10" : "bg-coral/5 border-coral/10"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Profit/Loss
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={cn("text-2xl font-bold", profit >= 0 ? "text-teal" : "text-coral")}>
                  {profit >= 0 ? "+" : ""}${Math.abs(profit).toLocaleString()}
                  <span className="text-sm ml-1 opacity-70">
                    ({profit >= 0 ? "+" : ""}{profitPercentage.toFixed(1)}%)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Acquired:</span>
                  <span className="font-medium">
                    {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString() : "Unknown"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium capitalize">{item.category}</span>
                </div>
              </div>
              
              {item.properties && Object.keys(item.properties).length > 0 && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    {item.category === "hotwheel" ? (
                      <>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Model:</span>
                          <span className="ml-2 font-medium">{item.properties.model_name || "N/A"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Series:</span>
                          <span className="ml-2 font-medium">{item.properties.series || "N/A"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Year:</span>
                          <span className="ml-2 font-medium">{item.properties.year || "N/A"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Scale:</span>
                          <span className="ml-2 font-medium">{item.properties.scale || "1:64"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Color:</span>
                          <span className="ml-2 font-medium">{item.properties.color || "N/A"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Wheels:</span>
                          <span className="ml-2 font-medium">{item.properties.wheel_type || "N/A"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Toy #:</span>
                          <span className="ml-2 font-medium">{item.properties.toy_number || "N/A"}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Treasure Hunt:</span>
                          <span className="ml-2">
                            {item.properties.is_treasure_hunt ? (
                              <Badge className="bg-teal text-white border-none text-[10px] h-4">YES</Badge>
                            ) : "No"}
                          </span>
                        </div>
                      </>
                    ) : (
                      Object.entries(item.properties).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                          <span className="ml-2 font-medium">{String(value)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
