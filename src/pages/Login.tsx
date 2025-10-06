import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple mock authentication
    if (username && password) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
      <div className="w-full max-w-md p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">JAYRON MEDSERVIS</h1>
          <p className="text-muted-foreground">Электрон тиббий карталар тизими</p>
        </div>

        {/* Login Card */}
        <div className="card-shadow rounded-lg bg-card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Фойдаланувчи номи</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Фойдаланувчи номини киритинг"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Парол</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Паролни киритинг"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  Эслаб қолиш
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:underline">
                Паролни унутдингизми?
              </a>
            </div>

            {/* Login Button */}
            <Button type="submit" className="w-full h-12 text-base gradient-primary hover:opacity-90 transition-opacity">
              Кириш
            </Button>
          </form>

          {/* Language Selector */}
          <div className="mt-6 pt-6 border-t flex justify-center gap-4">
            <button className="text-sm font-medium text-primary">O'zbek</button>
            <span className="text-muted-foreground">|</span>
            <button className="text-sm text-muted-foreground hover:text-foreground">Русский</button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2025 JAYRON MEDSERVIS. Барча ҳуқуқлар ҳимояланган.
        </p>
      </div>
    </div>
  );
};

export default Login;
