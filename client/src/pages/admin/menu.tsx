
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { categories } from "@shared/schema";
import type { MenuItem, InsertMenuItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { FaStar } from "react-icons/fa";

export default function AdminMenu() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InsertMenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "breakfast",
    imageUrl: "",
    isSpecial: false,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDialogItemId, setEditDialogItemId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: menuItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: InsertMenuItem) => {
      await apiRequest("POST", "/api/menu", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      setIsAddDialogOpen(false);
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "breakfast",
        imageUrl: "",
        isSpecial: false,
      });
      toast({
        title: "Success",
        description: "Menu item added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: MenuItem) => {
      await apiRequest("PUT", `/api/menu/${item.id}`, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      setIsEditDialogOpen(false);
      setEditDialogItemId(null);
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Menu item updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Success",
        description: "Menu item deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, isSpecial }: { id: number; isSpecial: boolean }) => {
      const item = menuItems?.find(item => item.id === id);
      if (!item) throw new Error("Item not found");
      
      const updatedItem = { ...item, isSpecial };
      await apiRequest("PUT", `/api/menu/${id}`, updatedItem);
      return updatedItem;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Success",
        description: updatedItem.isSpecial 
          ? `${updatedItem.name} is now marked as special!` 
          : `${updatedItem.name} is no longer marked as special.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return `₱${(price / 100).toFixed(2)}`;
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || !newItem.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    addItemMutation.mutate(newItem as InsertMenuItem);
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    updateItemMutation.mutate(editingItem);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleToggleStar = (id: number, currentStarStatus: boolean) => {
    toggleStarMutation.mutate({ id, isSpecial: !currentStarStatus });
  };

  const groupedItems = menuItems?.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>) || {};

  const filteredGroupedItems = selectedCategory === "all" 
    ? groupedItems 
    : Object.fromEntries(
        Object.entries(groupedItems).filter(([category]) => category === selectedCategory)
      );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-[#872519]">Menu Management</h2>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#872519] hover:bg-[#a32a1d]">
                Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Item name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Price (in cents)"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat !== "vegetarian").map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Image URL (optional)"
                  value={newItem.imageUrl || ""}
                  onChange={(e) => setNewItem({ ...newItem, imageUrl: e.target.value })}
                />
                <Button onClick={handleAddItem} className="w-full">
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center">Loading menu items...</div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredGroupedItems).map(([category, items]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="text-[#872519]">
                    {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} ({items.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{item.name}</h3>
                            {item.isSpecial && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Special
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <p className="font-semibold text-[#872519] mt-2">{formatPrice(item.price)}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStar(item.id, item.isSpecial || false)}
                            className="p-0 h-auto hover:bg-transparent"
                            disabled={toggleStarMutation.isPending}
                            data-testid={`star-button-${item.id}`}
                          >
                            <span className={`text-2xl ${item.isSpecial ? 'text-yellow-500' : 'text-gray-400'}`}>
                              {item.isSpecial ? '⭐' : '☆'}
                            </span>
                          </Button>
                          <Dialog 
                            open={isEditDialogOpen && editDialogItemId === item.id} 
                            onOpenChange={(open) => {
                              setIsEditDialogOpen(open);
                              if (open) {
                                setEditDialogItemId(item.id);
                                setEditingItem(item);
                              } else {
                                setEditDialogItemId(null);
                                setEditingItem(null);
                              }
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingItem(item);
                                  setEditDialogItemId(item.id);
                                }}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Menu Item</DialogTitle>
                              </DialogHeader>
                              {editingItem && (
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Item name"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                  />
                                  <Textarea
                                    placeholder="Description"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Price (in cents)"
                                    value={editingItem.price}
                                    onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                                  />
                                  <Select
                                    value={editingItem.category}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    placeholder="Image URL (optional)"
                                    value={editingItem.imageUrl || ""}
                                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                                  />
                                  <Button onClick={handleEditItem} className="w-full">
                                    Update Item
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
