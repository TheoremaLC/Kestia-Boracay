import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import IconNav from "@/components/layout/icon-nav";
import NotFound from "@/pages/not-found";
import Menu from "@/pages/menu";
import MenuCategory from "@/pages/menu/[category]";
import Drinks from "@/pages/drinks";
import DrinkCategory from "@/pages/drinks/[category]";
import Offers from "@/pages/offers";
import Events from "@/pages/events";
import Book from "@/pages/book";
import Gallery from "@/pages/gallery";
import Music from "@/pages/music";
import Contacts from "@/pages/contacts";
import AdminLogin from "@/pages/admin/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminMenu from "@/pages/admin/menu";
import AdminReservations from "@/pages/admin/reservations";
import AdminOffers from "./pages/admin/offers";

function Router() {
  return (
    <div className="min-h-screen relative">
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-24 max-w-screen-xl">
        <Switch>
          <Route path="/" component={Menu} />
          <Route path="/menu" component={Menu} />
          <Route path="/menu/:category" component={MenuCategory} />
          <Route path="/drinks" component={Drinks} />
          <Route path="/drinks/:category" component={DrinkCategory} />
          <Route path="/offers" component={Offers} />
          <Route path="/events" component={Events} />
          <Route path="/book" component={Book} />
          <Route path="/music" component={Music} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/admin/login" component={AdminLogin} />
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/menu" component={AdminMenu} />
          <Route path="/admin/reservations" component={AdminReservations} />
          <Route path="/admin/offers" component={AdminOffers} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <IconNav />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;