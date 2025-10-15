import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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

interface MenuCategory {
  id: number;
  name: string;
  slug: string;
  type: string;
  displayOrder: number;
}

export default function CategoriesManagement() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    type: "food" as "food" | "drink",
    displayOrder: 0,
  });

  const { data: categories = [] } = useQuery<MenuCategory[]>({
    queryKey: ["/api/categories"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiRequest<MenuCategory>("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
      return await apiRequest<MenuCategory>(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
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
      return await apiRequest(`/api/categories/${id}`, { 
        method: "DELETE",
      });
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

  const foodCategories = categories.filter(c => c.type === 'food');
  const drinkCategories = categories.filter(c => c.type === 'drink');

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Categories Management</h1>
        <p className="text-muted-foreground">Create and manage food and drink categories</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Food Categories */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Food Categories</h2>
            <Button 
              size="sm" 
              onClick={() => { setFormData({ ...formData, type: "food" }); handleOpenDialog(); }}
              data-testid="button-add-food-category"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {foodCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex justify-between items-center p-3 border rounded-md"
                data-testid={`category-item-${category.id}`}
              >
                <div>
                  <p className="font-medium" data-testid={`text-category-name-${category.id}`}>{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDialog(category)}
                    data-testid={`button-edit-${category.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(category.id)}
                    data-testid={`button-delete-${category.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drink Categories */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Drink Categories</h2>
            <Button 
              size="sm" 
              onClick={() => { setFormData({ ...formData, type: "drink" }); handleOpenDialog(); }}
              data-testid="button-add-drink-category"
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
          <div className="space-y-2">
            {drinkCategories.map((category) => (
              <div 
                key={category.id} 
                className="flex justify-between items-center p-3 border rounded-md"
                data-testid={`category-item-${category.id}`}
              >
                <div>
                  <p className="font-medium" data-testid={`text-category-name-${category.id}`}>{category.name}</p>
                  <p className="text-sm text-muted-foreground">{category.slug}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDialog(category)}
                    data-testid={`button-edit-${category.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => deleteMutation.mutate(category.id)}
                    data-testid={`button-delete-${category.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
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
  );
}
