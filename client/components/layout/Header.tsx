import { Link } from "react-router-dom";
import { ShoppingCart, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { user, signOut } = useAuth();
  const { cartCount } = useCart();

  const displayName = user?.name || user?.email || "User";
  const firstName = String(displayName).split(" ")[0] ?? displayName;
  const avatarInitial = (firstName || user?.email || "U").charAt(0).toUpperCase();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 max-w-7xl items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-foreground hidden sm:inline">Fasalxpress</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/products"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <Link
            to="/orders"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            My Orders
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            to="/cart"
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-accent rounded-full text-xs font-bold text-accent-foreground flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((s) => !s)}
                className="flex items-center gap-2 focus:outline-none"
                aria-haspopup
                aria-expanded={menuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold">
                  {avatarInitial}
                </div>
                <div className="hidden sm:block text-sm font-medium">{firstName}</div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                  <ul className="py-2">
                    <li>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-accent/5">
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/orders" className="block px-4 py-2 hover:bg-accent/5">
                        Orders
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" className="gap-2" asChild>
              <Link to="/login">
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
