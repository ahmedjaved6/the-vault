"use client";

import Link from "next/link";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function MagicLinkPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-teal/10 p-6 text-teal">
              <Mail className="h-12 w-12 animate-bounce" />
            </div>
          </div>
          <CardTitle className="text-2xl font-heading font-bold text-midnight dark:text-white">
            Check your email
          </CardTitle>
          <CardDescription className="text-base">
            We sent a magic link to your email address. Click the link to sign in instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Can't find it? Check your spam folder or try resending the link.
          </p>
          <Button variant="outline" className="w-full">
            <Send className="mr-2 h-4 w-4" />
            Resend Link
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <Link href="/signin" className="flex items-center text-sm text-muted-foreground hover:text-midnight dark:hover:text-white transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
