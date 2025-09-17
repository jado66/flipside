"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Eye,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  TrendingUp,
  Activity,
} from "lucide-react";
import { track } from "@vercel/analytics";

// Mock data - in a real app, this would come from your analytics API
const mockAnalyticsData = {
  visitors: 12543,
  pageViews: 18721,
  bounceRate: 34.2,
  topCountry: "United States",
  topPages: [
    { path: "/", views: 5432, percentage: 29 },
    { path: "/about", views: 3210, percentage: 17 },
    { path: "/contact", views: 2876, percentage: 15 },
    { path: "/blog", views: 2543, percentage: 14 },
    { path: "/services", views: 1876, percentage: 10 },
  ],
  referrers: [
    { source: "Direct", visits: 6543, percentage: 35 },
    { source: "Google", visits: 4321, percentage: 23 },
    { source: "Social Media", visits: 2876, percentage: 15 },
    { source: "Other", visits: 1987, percentage: 11 },
  ],
  recentEvents: [
    {
      event: "page_view",
      path: "/",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      event: "button_click",
      path: "/contact",
      timestamp: new Date(Date.now() - 1000 * 60 * 12),
    },
    {
      event: "form_submit",
      path: "/contact",
      timestamp: new Date(Date.now() - 1000 * 60 * 18),
    },
  ],
};

export default function AnalyticsPage() {
  const [isTracking, setIsTracking] = useState(false);
  const [customEvents, setCustomEvents] = useState<
    Array<{ event: string; timestamp: Date }>
  >([]);

  const trackCustomEvent = (eventName: string) => {
    track(eventName);
    setCustomEvents((prev) => [
      ...prev,
      { event: eventName, timestamp: new Date() },
    ]);
    setIsTracking(true);
    setTimeout(() => setIsTracking(false), 1000);
  };

  useEffect(() => {
    // Track page view when component mounts
    track("analytics_page_view");
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            View your website's performance and visitor insights
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => trackCustomEvent("demo_button_click")}
            variant="outline"
            disabled={isTracking}
          >
            {isTracking ? "Tracking..." : "Track Demo Event"}
          </Button>
          <Button asChild>
            <a
              href="https://vercel.com/dashboard/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              Open Vercel Analytics
            </a>
          </Button>
        </div>
      </div>

      {customEvents.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              Recent Custom Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customEvents.slice(-3).map((event, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <Badge variant="secondary">{event.event}</Badge>
                  <span className="text-muted-foreground">
                    {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalyticsData.visitors.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique visitors this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalyticsData.pageViews.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total page views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalyticsData.bounceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Visitors who left immediately
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Country</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalyticsData.topCountry}
            </div>
            <p className="text-xs text-muted-foreground">Most visitors from</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Pages
            </CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{page.path}</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${page.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">{page.views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {page.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
            <CardDescription>
              Where your visitors are coming from
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAnalyticsData.referrers.map((referrer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{referrer.source}</p>
                    <div className="w-full bg-secondary rounded-full h-2 mt-1">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${referrer.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium">
                      {referrer.visits.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {referrer.percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Custom Event Tracking
          </CardTitle>
          <CardDescription>
            Track custom events with @vercel/analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Use the buttons below to test custom event tracking. These events
              will be sent to Vercel Analytics.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => trackCustomEvent("newsletter_signup")}
              >
                Track Newsletter Signup
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => trackCustomEvent("download_click")}
              >
                Track Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => trackCustomEvent("contact_form_view")}
              >
                Track Form View
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Code Example:</h4>
              <code className="text-sm">
                {`import { track } from '@vercel/analytics'

// Track a custom event
track('button_click', { button: 'signup' })`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              How to Access Your Data
            </CardTitle>
            <CardDescription>
              Steps to view your analytics in Vercel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Visit Vercel Dashboard</p>
                  <p className="text-sm text-muted-foreground">
                    Go to your Vercel dashboard and select your project
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Navigate to Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Click on the "Analytics" tab in your project
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Explore Your Data</p>
                  <p className="text-sm text-muted-foreground">
                    View detailed insights and export data as CSV
                  </p>
                </div>
              </div>
            </div>
            <Button asChild className="w-full">
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to Vercel Dashboard
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Privacy & Data Collection
            </CardTitle>
            <CardDescription>
              How Vercel Analytics protects user privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-1">
              <div className="space-y-2">
                <h4 className="font-medium">Cookie-Free</h4>
                <p className="text-sm text-muted-foreground">
                  No cookies are used for tracking, ensuring user privacy
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Anonymized Data</h4>
                <p className="text-sm text-muted-foreground">
                  All visitor data is anonymized and aggregated
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Bot Filtering</h4>
                <p className="text-sm text-muted-foreground">
                  Automated traffic and bots are filtered out
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
