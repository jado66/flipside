"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Menu,
  X,
  UserIcon,
  Plus,
  LogOut,
  Settings,
} from "lucide-react";
import { UserNav } from "@/components/user-nav";

import { TrickipediaLogo } from "@/components/trickipedia-logo";

import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/supabase-client";

export function TrickipediaHeader({
  onMobileMenuClick,
}: {
  onMobileMenuClick?: () => void;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <TrickipediaLogo />
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/about"
              className="text-foreground hover:text-primary transition-colors"
            >
              About
            </Link>
            <Link
              href="/contribute"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contribute
            </Link>
            <Link
              href="/sports-and-disciplines"
              className="text-foreground hover:text-primary transition-colors"
            >
              Sports &amp; Disciplines
            </Link>
            <Link
              href="/faqs"
              className="text-foreground hover:text-primary transition-colors"
            >
              FAQs
            </Link>

            {/* <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Community
            </Link> */}
          </nav>
          {/* Search Bar */}
          {/* <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search tricks..."
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
          </div> */}
          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <UserNav user={user} />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/login">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/login">
                    <Plus className="h-4 w-4 mr-2" />
                    Join Now
                  </Link>
                </Button>
              </>
            )}
          </div>
          {/* Mobile Menu Button triggers sidebar for mobile navigation. */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMobileMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Menu removed. Use sidebar for mobile navigation. */}
      </div>
    </header>
  );
}
