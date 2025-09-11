"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HubSearchProps {
  onSearch: (filters: SearchFilters) => void;
}

interface SearchFilters {
  query: string;
  sport: string;
  city: string;
  state: string;
}

const SPORTS = [
  "parkour",
  "trampoline",
  "tricking",
  "freerunning",
  "trampoline",
  "martial arts",
  "breakdancing",
];

const STATES = ["CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"];

export function HubSearch({ onSearch }: HubSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    sport: "All Sports",
    city: "",
    state: "All States",
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: "",
      sport: "All Sports",
      city: "",
      state: "All States",
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search hubs by name or description..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button
          onClick={handleSearch}
          className="bg-orange-600 hover:bg-orange-700"
        >
          Search
        </Button>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select
          value={filters.sport}
          onValueChange={(value) => setFilters({ ...filters, sport: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sport" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Sports">All Sports</SelectItem>
            {SPORTS.map((sport) => (
              <SelectItem key={sport} value={sport}>
                {sport.charAt(0).toUpperCase() + sport.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="City"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-[150px]"
        />

        <Select
          value={filters.state}
          onValueChange={(value) => setFilters({ ...filters, state: value })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="State" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All States">All States</SelectItem>
            {STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} size="sm">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.query && (
            <Badge variant="secondary">Search: {filters.query}</Badge>
          )}
          {filters.sport && filters.sport !== "All Sports" && (
            <Badge variant="secondary">Sport: {filters.sport}</Badge>
          )}
          {filters.city && (
            <Badge variant="secondary">City: {filters.city}</Badge>
          )}
          {filters.state && filters.state !== "All States" && (
            <Badge variant="secondary">State: {filters.state}</Badge>
          )}
        </div>
      )}
    </div>
  );
}
