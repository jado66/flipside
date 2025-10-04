import Link from "next/link";
import { TrickipediaLogo } from "@/components/trickipedia-logo";
import { Mail, Heart, Shield, FileText, Eye } from "lucide-react";

export function TrickipediaFooter() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <TrickipediaLogo />
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 ">
              The world&apos;s most comprehensive database of action sports
              tricks, built by the community for the community. Discover, learn,
              and contribute to the future of movement.
            </p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500 mr-2" />
              <span>
                This site was hand-crafted by{" "}
                <a
                  href="https://platinumprogramming.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <strong>Platinum Programming</strong>&apos;s expert
                  development team.
                </a>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/contribute"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contribute
                </Link>
              </li>
              <li>
                <Link
                  href="/sports-and-disciplines"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Sports & Disciplines
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Help & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Legal & Support
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  <FileText className="h-3 w-3 mr-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  <Eye className="h-3 w-3 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/community-guidelines"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  <Shield className="h-3 w-3 mr-2" />
                  Community Guidelines
                </Link>
              </li>
              <li>
                <a
                  href="mailto:jd@platinumprogramming.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center"
                >
                  <Mail className="h-3 w-3 mr-2" />
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Trickipedia. All rights reserved.
              </div>
              <div className="text-xs text-muted-foreground">
                Content is licensed under{" "}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors underline"
                >
                  CC-BY-SA 4.0
                </a>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center xs:space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
              <span>Community-driven platform</span>
              <span className="hidden md:inline-block">•</span>
              <span>Free forever</span>
              <span className="hidden md:inline-block">•</span>
              <span>
                <Link
                  href="/dmca"
                  className="hover:text-primary transition-colors"
                >
                  DMCA
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
