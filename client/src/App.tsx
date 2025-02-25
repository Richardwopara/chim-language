import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Playground from "@/pages/Playground";
import Info from "@/pages/Info";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Playground} />
      <Route path="/docs" component={Home} />
      <Route path="/info" component={Info} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;