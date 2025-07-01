
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("adminCredentials");
    if (savedCredentials) {
      const { username: savedUsername, password: savedPassword } = JSON.parse(savedCredentials);
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo purposes, using simple credentials
    if (username === "admin" && password === "kestia2024") {
      localStorage.setItem("adminAuth", "true");
      
      // Save or clear credentials based on remember me checkbox
      if (rememberMe) {
        localStorage.setItem("adminCredentials", JSON.stringify({
          username,
          password
        }));
      } else {
        localStorage.removeItem("adminCredentials");
      }
      
      setLocation("/admin/dashboard");
    } else {
      toast({
        title: "Error",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center pb-32">
      <Logo />
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-[#872519] mb-8">Staff Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="w-full"
          />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full"
          />
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
            />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
