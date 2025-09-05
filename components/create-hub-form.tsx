"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Plus, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase/supabase-client";

const SPORTS_OPTIONS = [
  "parkour",
  "trampoline",
  "tricking",
  "freerunning",
  "trampwall",
  "trampoline",
  "martial arts",
  "breakdancing",
];

const AMENITIES_OPTIONS = [
  "foam_pit",
  "spring_floor",
  "parking",
  "lockers",
  "showers",
  "outdoor_area",
  "beginner_section",
  "advanced_section",
  "equipment_rental",
];

export function CreateHubForm({
  initialData,
  isEdit = false,
}: {
  initialData?: any;
  isEdit?: boolean;
}) {
  // Initialize images from either new images array or legacy image_url
  const initialImages =
    initialData?.images?.length > 0
      ? initialData.images
      : initialData?.image_url
      ? [initialData.image_url]
      : [];

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    zip_code: initialData?.zip_code || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website_url: initialData?.website_url || "",
    images: initialImages,
    sports: initialData?.sports || [],
    amenities: initialData?.amenities || [],
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        throw new Error("You must be logged in to create or edit a hub");

      // Prepare the data, ensuring images is always an array
      const submitData = {
        ...formData,
        images: formData.images.filter((url) => url.trim() !== ""), // Remove empty URLs
      };

      let data, error;
      if (isEdit && initialData?.id) {
        // Update existing hub
        ({ data, error } = await supabase
          .from("hubs")
          .update(submitData)
          .eq("id", initialData.id)
          .select()
          .single());
      } else {
        // Create new hub
        ({ data, error } = await supabase
          .from("hubs")
          .insert([
            {
              ...submitData,
              owner_id: user.id,
            },
          ])
          .select()
          .single());
      }

      if (error) throw error;

      router.push(`/hubs/${data.id}`);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSportsChange = (sport: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, sports: [...formData.sports, sport] });
    } else {
      setFormData({
        ...formData,
        sports: formData.sports.filter((s) => s !== sport),
      });
    }
  };

  const handleAmenitiesChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, amenities: [...formData.amenities, amenity] });
    } else {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((a) => a !== amenity),
      });
    }
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl("");
    }
  };

  const removeImage = (indexToRemove: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, index) => index !== indexToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addImageUrl();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Edit Hub" : "Create New Hub"}</CardTitle>
          <CardDescription>
            {isEdit
              ? "Update your action sports facility information"
              : "Add your action sports facility to the Flipside community"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hub Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Images Section */}
            <div className="space-y-4">
              <Label>Images</Label>

              {/* Add new image input */}
              <div className="flex gap-2">
                <Input
                  type="url"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="https://example.com/image.jpg"
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addImageUrl}
                  disabled={!newImageUrl.trim()}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Display current images */}
              {formData.images.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Images:</Label>
                  <div className="space-y-2">
                    {formData.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                      >
                        <ImageIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{imageUrl}</p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="text-red-500 hover:text-red-700 flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {formData.images.length === 1
                      ? "1 image added"
                      : `${formData.images.length} images added`}
                    {formData.images.length > 0 &&
                      " - The first image will be used as the main display image."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  id="zip_code"
                  value={formData.zip_code}
                  onChange={(e) =>
                    setFormData({ ...formData, zip_code: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  value={formData.website_url}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Sports Offered *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SPORTS_OPTIONS.map((sport) => (
                  <div key={sport} className="flex items-center space-x-2">
                    <Checkbox
                      id={sport}
                      checked={formData.sports.includes(sport)}
                      onCheckedChange={(checked) =>
                        handleSportsChange(sport, checked as boolean)
                      }
                    />
                    <Label htmlFor={sport} className="text-sm font-normal">
                      {sport.charAt(0).toUpperCase() + sport.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITIES_OPTIONS.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity}
                      checked={formData.amenities.includes(amenity)}
                      onCheckedChange={(checked) =>
                        handleAmenitiesChange(amenity, checked as boolean)
                      }
                    />
                    <Label htmlFor={amenity} className="text-sm font-normal">
                      {amenity
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading
                ? isEdit
                  ? "Saving..."
                  : "Creating Hub..."
                : isEdit
                ? "Save Changes"
                : "Create Hub"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
