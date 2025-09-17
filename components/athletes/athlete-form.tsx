"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Athlete, SkillLevel, AthleteStatus } from "@/lib/types/athlete";
import { supabase } from "@/lib/supabase/supabase-client";

interface AthleteFormProps {
  athlete?: Athlete;
}

export function AthleteForm({ athlete }: AthleteFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: athlete?.name || "",
    bio: athlete?.bio || "",
    sport: athlete?.sport || "",
    status: athlete?.status || ("active" as AthleteStatus),
    years_experience: athlete?.years_experience?.toString() || "",
    country: athlete?.country || "",
    city: athlete?.city || "",
    date_of_birth: athlete?.date_of_birth || "",
    height_cm: athlete?.height_cm?.toString() || "",
    weight_kg: athlete?.weight_kg?.toString() || "",
    stance: athlete?.stance || "",
    profile_image_url: athlete?.profile_image_url || "",
    cover_image_url: athlete?.cover_image_url || "",
    instagram_handle: athlete?.instagram_handle || "",
    youtube_channel: athlete?.youtube_channel || "",
    tiktok_handle: athlete?.tiktok_handle || "",
    website_url: athlete?.website_url || "",
    notable_achievements: athlete?.notable_achievements || "",
  });

  const [signatureTricks, setSignatureTricks] = useState<string[]>(
    athlete?.signature_tricks || []
  );
  const [sponsors, setSponsors] = useState<string[]>(athlete?.sponsors || []);
  const [newTrick, setNewTrick] = useState("");
  const [newSponsor, setNewSponsor] = useState("");

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addTrick = () => {
    if (newTrick.trim() && !signatureTricks.includes(newTrick.trim())) {
      setSignatureTricks((prev) => [...prev, newTrick.trim()]);
      setNewTrick("");
    }
  };

  const removeTrick = (index: number) => {
    setSignatureTricks((prev) => prev.filter((_, i) => i !== index));
  };

  const addSponsor = () => {
    if (newSponsor.trim() && !sponsors.includes(newSponsor.trim())) {
      setSponsors((prev) => [...prev, newSponsor.trim()]);
      setNewSponsor("");
    }
  };

  const removeSponsor = (index: number) => {
    setSponsors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.sport.trim()) {
      toast.error("Name and sport are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const slug = generateSlug(formData.name);

      const athleteData = {
        name: formData.name.trim(),
        slug,
        bio: formData.bio.trim() || null,
        sport: formData.sport.trim(),
        status: formData.status,
        years_experience: formData.years_experience
          ? Number.parseInt(formData.years_experience)
          : null,
        country: formData.country.trim() || null,
        city: formData.city.trim() || null,
        date_of_birth: formData.date_of_birth || null,
        height_cm: formData.height_cm
          ? Number.parseInt(formData.height_cm)
          : null,
        weight_kg: formData.weight_kg
          ? Number.parseInt(formData.weight_kg)
          : null,
        stance: formData.stance.trim() || null,
        profile_image_url: formData.profile_image_url.trim() || null,
        cover_image_url: formData.cover_image_url.trim() || null,
        instagram_handle: formData.instagram_handle.trim() || null,
        youtube_channel: formData.youtube_channel.trim() || null,
        tiktok_handle: formData.tiktok_handle.trim() || null,
        website_url: formData.website_url.trim() || null,
        notable_achievements: formData.notable_achievements.trim() || null,
        signature_tricks: signatureTricks.length > 0 ? signatureTricks : null,
        sponsors: sponsors.length > 0 ? sponsors : null,
      };

      let result;
      if (athlete) {
        // Update existing athlete
        result = await supabase
          .from("athletes")
          .update(athleteData)
          .eq("id", athlete.id)
          .select()
          .single();
      } else {
        // Create new athlete
        result = await supabase
          .from("athletes")
          .insert(athleteData)
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      toast.success(
        athlete
          ? "Athlete updated successfully!"
          : "Athlete created successfully!"
      );
      router.push(`/athletes/${slug}`);
    } catch (error: any) {
      console.error("Error saving athlete:", error);
      if (error.code === "23505") {
        toast.error("An athlete with this name already exists");
      } else {
        toast.error("Failed to save athlete. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter athlete name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport *</Label>
              <Input
                id="sport"
                value={formData.sport}
                onChange={(e) => handleInputChange("sport", e.target.value)}
                placeholder="e.g., Skateboarding, BMX, Parkour"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about this athlete..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="years_experience">Years of Experience</Label>
              <Input
                id="years_experience"
                type="number"
                min="0"
                max="50"
                value={formData.years_experience}
                onChange={(e) =>
                  handleInputChange("years_experience", e.target.value)
                }
                placeholder="Years"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Details */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                placeholder="City"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) =>
                  handleInputChange("date_of_birth", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height_cm">Height (cm)</Label>
              <Input
                id="height_cm"
                type="number"
                min="100"
                max="250"
                value={formData.height_cm}
                onChange={(e) => handleInputChange("height_cm", e.target.value)}
                placeholder="Height in cm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                type="number"
                min="30"
                max="200"
                value={formData.weight_kg}
                onChange={(e) => handleInputChange("weight_kg", e.target.value)}
                placeholder="Weight in kg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stance">Stance (for board sports)</Label>
            <Select
              value={formData.stance}
              onValueChange={(value) => handleInputChange("stance", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select stance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-applicable">Not applicable</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="goofy">Goofy</SelectItem>
                <SelectItem value="switch">Switch</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile_image_url">Profile Image URL</Label>
            <Input
              id="profile_image_url"
              type="url"
              value={formData.profile_image_url}
              onChange={(e) =>
                handleInputChange("profile_image_url", e.target.value)
              }
              placeholder="https://example.com/profile.jpg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <Input
              id="cover_image_url"
              type="url"
              value={formData.cover_image_url}
              onChange={(e) =>
                handleInputChange("cover_image_url", e.target.value)
              }
              placeholder="https://example.com/cover.jpg"
            />
          </div>
        </CardContent>
      </Card>

      {/* Signature Tricks */}
      <Card>
        <CardHeader>
          <CardTitle>Signature Tricks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newTrick}
              onChange={(e) => setNewTrick(e.target.value)}
              placeholder="Add a signature trick"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addTrick())
              }
            />
            <Button type="button" onClick={addTrick} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {signatureTricks.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {signatureTricks.map((trick, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {trick}
                  <button
                    type="button"
                    onClick={() => removeTrick(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sponsors */}
      <Card>
        <CardHeader>
          <CardTitle>Sponsors</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newSponsor}
              onChange={(e) => setNewSponsor(e.target.value)}
              placeholder="Add a sponsor"
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), addSponsor())
              }
            />
            <Button type="button" onClick={addSponsor} variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {sponsors.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {sponsors.map((sponsor, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="flex items-center gap-1"
                >
                  {sponsor}
                  <button
                    type="button"
                    onClick={() => removeSponsor(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle>Social Media & Links</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram_handle">Instagram Handle</Label>
              <Input
                id="instagram_handle"
                value={formData.instagram_handle}
                onChange={(e) =>
                  handleInputChange("instagram_handle", e.target.value)
                }
                placeholder="username (without @)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube_channel">YouTube Channel</Label>
              <Input
                id="youtube_channel"
                value={formData.youtube_channel}
                onChange={(e) =>
                  handleInputChange("youtube_channel", e.target.value)
                }
                placeholder="channel name (without @)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tiktok_handle">TikTok Handle</Label>
              <Input
                id="tiktok_handle"
                value={formData.tiktok_handle}
                onChange={(e) =>
                  handleInputChange("tiktok_handle", e.target.value)
                }
                placeholder="username (without @)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website_url">Website URL</Label>
              <Input
                id="website_url"
                type="url"
                value={formData.website_url}
                onChange={(e) =>
                  handleInputChange("website_url", e.target.value)
                }
                placeholder="https://example.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Notable Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notable_achievements">Achievements</Label>
            <Textarea
              id="notable_achievements"
              value={formData.notable_achievements}
              onChange={(e) =>
                handleInputChange("notable_achievements", e.target.value)
              }
              placeholder="List major competitions, awards, or notable accomplishments..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit Buttons */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting
            ? "Saving..."
            : athlete
            ? "Update Athlete"
            : "Create Athlete"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
