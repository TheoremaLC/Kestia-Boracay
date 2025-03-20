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

function Router() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={Menu} />
          <Route path="/menu" component={Menu} />
          <Route path="/menu/:category" component={MenuCategory} />
          <Route path="/offers" component={Offers} />
          <Route path="/events" component={Events} />
          <Route path="/book" component={Book} />
          <Route path="/music" component={Music} />
          <Route path="/gallery" component={Gallery} />
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