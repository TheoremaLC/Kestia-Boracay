
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { drinkCategories } from "@shared/schema";
import type { MenuItem, InsertMenuItem } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function AdminDrinks() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InsertMenuItem>>({
    name: "",
    description: "",
    price: 0,
    category: "coffee",
    imageUrl: "",
    isSpecial: false,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editDialogItemId, setEditDialogItemId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: drinkItems, isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/drinks"],
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: InsertMenuItem) => {
      await apiRequest("POST", "/api/drinks", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drinks"] });
      setIsAddDialogOpen(false);
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "coffee",
        imageUrl: "",
        isSpecial: false,
      });
      toast({
        title: "Success",
        description: "Drink added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add drink. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: MenuItem) => {
      await apiRequest("PUT", `/api/drinks/${item.id}`, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drinks"] });
      setIsEditDialogOpen(false);
      setEditDialogItemId(null);
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Drink updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update drink. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/drinks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/drinks"] });
      toast({
        title: "Success",
        description: "Drink deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete drink. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, isSpecial }: { id: number; isSpecial: boolean }) => {
      const item = drinkItems?.find(item => item.id === id);
      if (!item) throw new Error("Drink not found");
      
      const updatedItem = { ...item, isSpecial };
      await apiRequest("PUT", `/api/drinks/${id}`, updatedItem);
      return updatedItem;
    },
    onSuccess: (updatedItem) => {
      queryClient.invalidateQueries({ queryKey: ["/api/drinks"] });
      toast({
        title: "Updated",
        description: updatedItem.isSpecial 
          ? `${updatedItem.name} requires availability confirmation with server before serving.` 
          : `${updatedItem.name} no longer requires availability confirmation.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update drink status. Please try again.",
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
    if (confirm("Are you sure you want to delete this drink?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const handleToggleStar = (id: number, currentStarStatus: boolean) => {
    toggleStarMutation.mutate({ id, isSpecial: !currentStarStatus });
  };

  const groupedItems = drinkItems?.reduce((acc, item) => {
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-[#872519]" : ""}
            >
              All
            </Button>
            {drinkCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? "bg-[#872519]" : ""}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </Button>
            ))}
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#872519] hover:bg-[#a32a1d]" data-testid="button-add-drink">
                Add New Drink
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Drink</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Drink name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  data-testid="input-drink-name"
                />
                <Textarea
                  placeholder="Description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  data-testid="input-drink-description"
                />
                <Input
                  type="number"
                  placeholder="Price (in cents)"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                  data-testid="input-drink-price"
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category *</label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) => setNewItem({ ...newItem, category: value })}
                  >
                    <SelectTrigger data-testid="select-drink-category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {drinkCategories.map((category) => (
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
                  data-testid="input-drink-image"
                />
                <Button onClick={handleAddItem} className="w-full" data-testid="button-submit-drink">
                  Add Drink
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center">Loading drinks...</div>
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
                                data-testid={`button-edit-${item.id}`}
                              >
                                Edit
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Edit Drink</DialogTitle>
                              </DialogHeader>
                              {editingItem && (
                                <div className="space-y-4">
                                  <Input
                                    placeholder="Drink name"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    data-testid="input-edit-name"
                                  />
                                  <Textarea
                                    placeholder="Description"
                                    value={editingItem.description}
                                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                    data-testid="input-edit-description"
                                  />
                                  <Input
                                    type="number"
                                    placeholder="Price (in cents)"
                                    value={editingItem.price}
                                    onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                                    data-testid="input-edit-price"
                                  />
                                  <Select
                                    value={editingItem.category}
                                    onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                                  >
                                    <SelectTrigger data-testid="select-edit-category">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {drinkCategories.map((category) => (
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
                                    data-testid="input-edit-image"
                                  />
                                  <Button onClick={handleEditItem} className="w-full" data-testid="button-update-drink">
                                    Update Drink
                                  </Button>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteItem(item.id)}
                            data-testid={`button-delete-${item.id}`}
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
