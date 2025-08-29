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

import { createClient } from "@/lib/client";
import type { User } from "@supabase/supabase-js";

export function TrickipediaHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null);

  const supabase = createClient();

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
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center">
              <div className="flex-shrink-0 flex items-center justify-center mr-3">
                <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <span className="text-black font-serif text-2xl">T</span>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-xl text-black uppercase font-serif">
                  <span>
                    <span
                      style={{ fontSize: "1.3em", verticalAlign: "middle" }}
                    >
                      T
                    </span>
                    <span
                      style={{
                        verticalAlign: "middle",
                        position: "relative",
                        top: "2px",
                      }}
                    >
                      rickipedi
                    </span>

                    <span
                      style={{ fontSize: "1.3em", verticalAlign: "middle" }}
                    >
                      A
                    </span>
                  </span>
                </span>
                <span
                  className="text-base text-muted-foreground font-serif italic"
                  style={{ marginTop: "-4px" }}
                >
                  The trick encyclopedia
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/trickipedia/tricks"
              className="text-foreground hover:text-primary transition-colors"
            >
              Tricks
            </Link>
            <Link
              href="/trickipedia/categories"
              className="text-foreground hover:text-primary transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors"
            >
              Community
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search tricks..."
                className="pl-10 bg-muted/50 border-border"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Button size="sm" asChild>
                  <Link href="/trickipedia/tricks/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Trick
                  </Link>
                </Button>
                <UserNav user={user} />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/signin">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">
                    <Plus className="h-4 w-4 mr-2" />
                    Join Now
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Search tricks..."
                  className="pl-10 bg-muted/50 border-border"
                />
              </div>

              {/* Mobile Navigation */}
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/trickipedia/tricks"
                  className="text-foreground hover:text-primary transition-colors py-2"
                >
                  Tricks
                </Link>
                <Link
                  href="/trickipedia/categories"
                  className="text-foreground hover:text-primary transition-colors py-2"
                >
                  Categories
                </Link>
                <Link
                  href="/"
                  className="text-foreground hover:text-primary transition-colors py-2"
                >
                  Community
                </Link>
                <Link
                  href="/about"
                  className="text-foreground hover:text-primary transition-colors py-2"
                >
                  About
                </Link>
              </nav>

              {/* Mobile Action Buttons */}
              <div className="flex flex-col space-y-2 pt-4 border-t">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 py-2">
                      Avatar
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Button size="sm" asChild>
                      <Link href="/trickipedia/tricks/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Trick
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/profile">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Profile
                      </Link>
                    </Button>
                    {user.role === "admin" && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin">
                          <Settings className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/auth/signin">
                        <UserIcon className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href="/auth/signup">
                        <Plus className="h-4 w-4 mr-2" />
                        Join Now
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
