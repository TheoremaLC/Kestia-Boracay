
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Reservation, MenuItem } from "@shared/schema";

interface VisitorStats {
  totalUniqueVisitors: number;
  returningVisitors: number;
  newVisitorsToday: number;
  returningVisitorsToday: number;
}

interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  type: string;
  displayOrder: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "food" as "food" | "drink",
    displayOrder: 0,
  });

  // const { data: reservations } = useQuery<Reservation[]>({
  //   queryKey: ["/api/reservations"],
  // });
  const reservations: Reservation[] = [];

  const { data: menuItems } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const { data: visitorStats } = useQuery<VisitorStats>({
    queryKey: ["/api/visitor-stats"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: allCategories = [] } = useQuery<MenuCategory[]>({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest("POST", "/api/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ description: "Category created successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ description: "Failed to create category", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<MenuCategory> }) => {
      return await apiRequest("PUT", `/api/categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ description: "Category updated successfully" });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ description: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ description: "Category deleted successfully" });
    },
    onError: () => {
      toast({ description: "Failed to delete category", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", type: "food", displayOrder: 0 });
    setEditingCategory(null);
  };

  const handleOpenDialog = (category?: MenuCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        type: category.type as "food" | "drink",
        displayOrder: category.displayOrder,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    setFormData({ ...formData, name, slug });
  };

  const todayReservations = reservations?.filter(r => {
    const today = new Date();
    const reservationDate = new Date(r.date);
    return reservationDate.toDateString() === today.toDateString();
  }) || [];

  const pendingReservations = reservations?.filter(r => r.status === "pending") || [];

  const foodCategories = allCategories.filter(c => c.type === 'food');
  const drinkCategories = allCategories.filter(c => c.type === 'drink');

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Categories Management Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#872519]">Categories Management</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Food Categories */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Food Categories</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => { setFormData({ ...formData, type: "food" }); handleOpenDialog(); }}
                  data-testid="button-add-food-category"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {foodCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className="flex justify-between items-center p-2 border rounded-md"
                      data-testid={`category-item-${category.id}`}
                    >
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-category-name-${category.id}`}>{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDialog(category)}
                          data-testid={`button-edit-${category.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteMutation.mutate(category.id)}
                          data-testid={`button-delete-${category.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {foodCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No food categories</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Drink Categories */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Drink Categories</CardTitle>
                <Button 
                  size="sm" 
                  onClick={() => { setFormData({ ...formData, type: "drink" }); handleOpenDialog(); }}
                  data-testid="button-add-drink-category"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {drinkCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className="flex justify-between items-center p-2 border rounded-md"
                      data-testid={`category-item-${category.id}`}
                    >
                      <div>
                        <p className="font-medium text-sm" data-testid={`text-category-name-${category.id}`}>{category.name}</p>
                        <p className="text-xs text-muted-foreground">{category.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDialog(category)}
                          data-testid={`button-edit-${category.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteMutation.mutate(category.id)}
                          data-testid={`button-delete-${category.id}`}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {drinkCategories.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No drink categories</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Menu Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#872519]">Menu</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{menuItems?.length || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reservations Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#872519]">Reservations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{reservations?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e85303]">{todayReservations.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Reservations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{pendingReservations.length}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Website Traffic Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[#872519]">Website Traffic</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Unique Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{visitorStats?.totalUniqueVisitors || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returning Visitors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e85303]">{visitorStats?.returningVisitors || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Visitors Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#872519]">{visitorStats?.newVisitorsToday || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Returning Visitors Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#e85303]">{visitorStats?.returningVisitorsToday || 0}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#872519]">Recent Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reservations?.slice(0, 5).map((reservation) => (
                <div key={reservation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{reservation.name}</p>
                    <p className="text-sm text-gray-600">{reservation.guests} guests</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{reservation.time}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      reservation.status === "confirmed" ? "bg-green-100 text-green-800" :
                      reservation.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                      reservation.status === "cancelled" ? "bg-red-100 text-red-800" :
                      "bg-blue-100 text-blue-800"
                    }`}>
                      {reservation.status}
                    </span>
                  </div>
                </div>
              ))}
              {!reservations?.length && (
                <p className="text-gray-500 text-center py-4">No reservations yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Category Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Create Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Update category details" : "Add a new menu category"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g., Breakfast, Coffee"
                    required
                    data-testid="input-category-name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (auto-generated)</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., breakfast, coffee"
                    required
                    data-testid="input-category-slug"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: "food" | "drink") => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger id="type" data-testid="select-category-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="drink">Drink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    data-testid="input-display-order"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-category"
                >
                  {editingCategory ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
