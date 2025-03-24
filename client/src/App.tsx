import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import IconNav from "@/components/layout/icon-nav";
import NotFound from "@/pages/not-found";
import Menu from "@/pages/menu";
import MenuCategory from "@/pages/menu/[category]";
import Offers from "@/pages/offers";
import Events from "@/pages/events";
import Book from "@/pages/book";
import Gallery from "@/pages/gallery";
import Music from "@/pages/music";
import Contacts from "@/pages/contacts";

function Router() {
  return (
    <div className="min-h-screen bg-white relative">
      {/* Decorative palm trees */}
      <div className="fixed left-0 top-1/4 -translate-y-1/2 pointer-events-none">
        <img src="/palm-tree-decoration.svg" alt="" className="w-24 h-32 transform -scale-x-100" />
      </div>
      <div className="fixed right-0 top-3/4 -translate-y-1/2 pointer-events-none">
        <img src="/palm-tree-decoration.svg" alt="" className="w-24 h-32" />
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 pb-24">
        <Switch>
          <Route path="/" component={Menu} />
          <Route path="/menu" component={Menu} />
          <Route path="/menu/:category" component={MenuCategory} />
          <Route path="/offers" component={Offers} />
          <Route path="/events" component={Events} />
          <Route path="/book" component={Book} />
          <Route path="/music" component={Music} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/contacts" component={Contacts} />
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