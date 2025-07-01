
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OfferItem {
  id: number;
  name: string;
  price: number;
  isActive: boolean;
}

interface InsertOfferItem {
  name: string;
  price: number;
  isActive: boolean;
}

export default function AdminOffers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<OfferItem | null>(null);
  const [newItem, setNewItem] = useState<Partial<InsertOfferItem>>({
    name: "",
    price: 0,
    isActive: true,
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: offerItems, isLoading } = useQuery<OfferItem[]>({
    queryKey: ["/api/offers"],
  });

  const addItemMutation = useMutation({
    mutationFn: async (item: InsertOfferItem) => {
      await apiRequest("POST", "/api/offers", item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsAddDialogOpen(false);
      setNewItem({
        name: "",
        price: 0,
        isActive: true,
      });
      toast({
        title: "Success",
        description: "Offer item added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add offer item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async (item: OfferItem) => {
      await apiRequest("PUT", `/api/offers/${item.id}`, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      setIsEditDialogOpen(false);
      setEditingItem(null);
      toast({
        title: "Success",
        description: "Offer item updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update offer item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offers"] });
      toast({
        title: "Success",
        description: "Offer item deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete offer item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatPrice = (price: number) => {
    return `₱${(price / 100).toFixed(2)}`;
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    addItemMutation.mutate(newItem as InsertOfferItem);
  };

  const handleEditItem = () => {
    if (!editingItem) return;
    updateItemMutation.mutate(editingItem);
  };

  const handleDeleteItem = (id: number) => {
    if (confirm("Are you sure you want to delete this offer item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#872519]">Happy Hour Offers Management</h2>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#872519] hover:bg-[#a32a1d]">
                Add New Offer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Offer Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Item name (e.g., SMB, Red Horse)"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Price (in cents, e.g., 7000 for ₱70)"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={newItem.isActive}
                    onChange={(e) => setNewItem({ ...newItem, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive">Active offer</label>
                </div>
                <Button onClick={handleAddItem} className="w-full">
                  Add Offer
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center">Loading offer items...</div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-[#872519]">
                Happy Hour Items ({offerItems?.length || 0} items)
              </CardTitle>
              <p className="text-sm text-gray-600">Available daily 16:00h - 19:00h</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {offerItems?.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {!item.isActive && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-[#E85303] mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingItem(item)}
                          >
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Offer Item</DialogTitle>
                          </DialogHeader>
                          {editingItem && (
                            <div className="space-y-4">
                              <Input
                                placeholder="Item name"
                                value={editingItem.name}
                                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              />
                              <Input
                                type="number"
                                placeholder="Price (in cents)"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({ ...editingItem, price: parseInt(e.target.value) || 0 })}
                              />
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="editIsActive"
                                  checked={editingItem.isActive}
                                  onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                                />
                                <label htmlFor="editIsActive">Active offer</label>
                              </div>
                              <Button onClick={handleEditItem} className="w-full">
                                Update Offer
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
                {(!offerItems || offerItems.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No offer items found. Add your first happy hour item!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}
