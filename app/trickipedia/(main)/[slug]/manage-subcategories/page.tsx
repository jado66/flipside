// app/admin/categories/[id]/subcategories/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/client";
import { useAuth } from "@/contexts/auth-provider";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Subcategory {
  id: string;
  master_category_id: string;
  name: string;
  description: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  trick_count: number;
}

interface MasterCategory {
  id: string;
  name: string;
  color: string;
}

export default function SubcategoryManagementPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const { user, hasModeratorAccess } = useAuth();
  const [category, setCategory] = useState<MasterCategory | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    sort_order: 0,
    is_active: true,
  });
  const supabase = createClient();

  useEffect(() => {
    if (!hasModeratorAccess()) {
      alert("unauthorized");
    }
    loadData();
  }, [categoryId, user, hasModeratorAccess, router]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load master category
      const { data: categoryData } = await supabase
        .from("master_categories")
        .select("id, name, color")
        .eq("id", categoryId)
        .single();

      if (categoryData) {
        setCategory(categoryData);
      }

      // Load subcategories with trick count
      const { data: subcategoriesData } = await supabase
        .from("subcategories")
        .select(
          `
          *,
          tricks!inner(count)
        `
        )
        .eq("master_category_id", categoryId)
        .order("sort_order");

      if (subcategoriesData) {
        const formattedData = subcategoriesData.map((sub) => ({
          ...sub,
          trick_count: sub.tricks?.length || 0,
        }));
        setSubcategories(formattedData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      description: subcategory.description || "",
      slug: subcategory.slug,
      sort_order: subcategory.sort_order || 0,
      is_active: subcategory.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedSubcategory) return;

    try {
      const { error } = await supabase
        .from("subcategories")
        .delete()
        .eq("id", selectedSubcategory.id);

      if (error) throw error;

      toast.success("Subcategory deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedSubcategory(null);
      loadData();
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      toast.error("Failed to delete subcategory");
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedSubcategory) {
        // Update existing subcategory
        const { error } = await supabase
          .from("subcategories")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedSubcategory.id);

        if (error) throw error;
        toast.success("Subcategory updated successfully");
      } else {
        // Create new subcategory
        const { error } = await supabase.from("subcategories").insert([
          {
            ...formData,
            master_category_id: categoryId,
          },
        ]);

        if (error) throw error;
        toast.success("Subcategory created successfully");
      }

      setDialogOpen(false);
      setSelectedSubcategory(null);
      setFormData({
        name: "",
        description: "",
        slug: "",
        sort_order: 0,
        is_active: true,
      });
      loadData();
    } catch (error) {
      console.error("Failed to save subcategory:", error);
      toast.error("Failed to save subcategory");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/categories"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: category?.color }}
                />
                <h1 className="text-3xl font-bold">
                  {category?.name} Subcategories
                </h1>
              </div>
              <p className="text-muted-foreground">
                Manage subcategories for {category?.name}
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedSubcategory(null);
                setFormData({
                  name: "",
                  description: "",
                  slug: "",
                  sort_order: 0,
                  is_active: true,
                });
                setDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </div>
        </div>

        {/* Subcategories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subcategories</CardTitle>
            <CardDescription>
              {subcategories.length} subcategories total
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subcategories.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tricks</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell className="font-medium">
                        {subcategory.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {subcategory.slug}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {subcategory.description}
                      </TableCell>
                      <TableCell>{subcategory.sort_order}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            subcategory.is_active ? "default" : "secondary"
                          }
                        >
                          {subcategory.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{subcategory.trick_count}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(subcategory)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSubcategory(subcategory);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No subcategories found. Create your first subcategory to get
                started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>
                {selectedSubcategory
                  ? "Edit Subcategory"
                  : "Create New Subcategory"}
              </DialogTitle>
              <DialogDescription>
                {selectedSubcategory
                  ? "Update the subcategory details below"
                  : "Enter the details for the new subcategory"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="slug" className="text-right">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sort_order" className="text-right">
                  Sort Order
                </Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  Active
                </Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {selectedSubcategory ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Subcategory</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete &quot;
                {selectedSubcategory?.name}&quot;? This will also delete all
                tricks in this subcategory. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
