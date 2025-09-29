"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Package, Grid3X3, List } from "lucide-react";
import { ProductCard } from "@/components/gym-management/store/product-card";
import { InventoryStats } from "@/components/gym-management/store/inventory-stats";
import { AddProductDialog } from "./add-product-dialog";
import { ProductListItem } from "./product-list-item";
import { useLocalStorage } from "@/hooks/use-local-storage";

export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  cost: number;
  sku: string;
  supplier?: string;
  reorderLevel: number;
  description?: string;
}

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Protein Powder - Vanilla",
    category: "Supplements",
    quantity: 45,
    price: 49.99,
    cost: 25.0,
    sku: "PROT-VAN-001",
    supplier: "NutriCorp",
    reorderLevel: 10,
    description: "Premium whey protein powder, vanilla flavor",
  },
  {
    id: "2",
    name: "Resistance Bands Set",
    category: "Accessories",
    quantity: 23,
    price: 29.99,
    cost: 12.5,
    sku: "BAND-SET-001",
    supplier: "FitGear Inc",
    reorderLevel: 5,
    description: "Complete set of resistance bands with handles",
  },
  {
    id: "3",
    name: "Gym Water Bottle",
    category: "Accessories",
    quantity: 67,
    price: 19.99,
    cost: 8.0,
    sku: "BOTTLE-001",
    supplier: "HydroFit",
    reorderLevel: 15,
    description: "32oz stainless steel water bottle",
  },
  {
    id: "4",
    name: "Pre-Workout Energy",
    category: "Supplements",
    quantity: 8,
    price: 39.99,
    cost: 18.0,
    sku: "PREWORK-001",
    supplier: "NutriCorp",
    reorderLevel: 12,
    description: "High-energy pre-workout supplement",
  },
  {
    id: "5",
    name: "Yoga Mat Premium",
    category: "Equipment",
    quantity: 15,
    price: 79.99,
    cost: 35.0,
    sku: "YOGA-PREM-001",
    supplier: "ZenFit",
    reorderLevel: 8,
    description: "Premium non-slip yoga mat, 6mm thick",
  },
];

export default function InventoryManagement() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useLocalStorage<"grid" | "list">(
    "inventory-view-mode",
    "grid"
  );

  const categories = [
    "all",
    ...Array.from(new Set(products.map((item) => item.category))),
  ];

  const filteredProducts = products.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.supplier &&
        item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = (newProduct: Omit<Product, "id">) => {
    const product_with_id = {
      ...newProduct,
      id: Date.now().toString(),
    };
    setProducts((prev) => [...prev, product_with_id]);
  };

  const handleUpdateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSellProduct = (id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity - quantity) }
          : item
      )
    );
  };

  const handleRestockProduct = (id: string, quantity: number) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + quantity } : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto ">
        <div>
          <h2 className="text-2xl font-bold mb-3">Store Inventory</h2>
          <p className="text-muted-foreground">
            Manage and track all store products
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {/* Stats Overview */}
          <InventoryStats products={products} />

          {/* Search and Filter Section */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    Store Inventory
                  </CardTitle>
                  <CardDescription>
                    Manage and track all store products
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="h-8 px-3"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className="h-8 px-3"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products, category, SKU, or supplier..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={
                        selectedCategory === category ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                      className="capitalize"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((item) => (
                    <ProductCard
                      key={item.id}
                      product={item}
                      onUpdate={handleUpdateProduct}
                      onDelete={handleDeleteProduct}
                      onSell={handleSellProduct}
                      onRestock={handleRestockProduct}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredProducts.map((item) => (
                    <ProductListItem
                      key={item.id}
                      product={item}
                      onUpdate={handleUpdateProduct}
                      onDelete={handleDeleteProduct}
                      onSell={handleSellProduct}
                      onRestock={handleRestockProduct}
                    />
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No products found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedCategory !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "Start by adding your first product"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AddProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddProduct}
      />
    </div>
  );
}
