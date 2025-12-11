import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
  maxQuantity: number;
  productId?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Partial<Omit<CartItem, 'quantity'>> & { productId?: string; variantId?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartCount: number;
  cartTotal: number;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
  // debugging / sync helpers
  userId?: string | null;
  lastSync?: { time: number | null; status: 'idle' | 'syncing' | 'success' | 'error'; message?: string };
  refreshCart?: () => Promise<void>;
}

const CART_STORAGE_KEY = 'agrobuild_cart_v2';
const CART_USER_KEY = 'agrobuild_user_id';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    }
    return [];
  });

  const auth = useAuth();

  const getUserId = () => {
    if (typeof window === 'undefined') return undefined;
    // Prefer authenticated user id when available
    const authUserId = auth?.user?.id;
    if (authUserId) {
      // persist authenticated user id in storage
      localStorage.setItem(CART_USER_KEY, authUserId);
      return authUserId;
    }
    let userId = localStorage.getItem(CART_USER_KEY);
    if (!userId) {
      userId = `anon-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(CART_USER_KEY, userId);
    }
    return userId;
  };

  const currentUserId = getUserId();

  const [lastSync, setLastSync] = useState<{ time: number | null; status: 'idle' | 'syncing' | 'success' | 'error'; message?: string }>({ time: null, status: 'idle' });

  const fetchAndSetCart = async (userIdParam?: string) => {
    const uid = userIdParam ?? getUserId();
    if (!uid) return;
    
    // Skip server fetch for anonymous users (anon-*)
    if (uid.startsWith('anon-')) {
      console.log('[CartContext] Skipping server fetch for guest user');
      return;
    }
    
    setLastSync({ time: Date.now(), status: 'syncing' });
    try {
      const res = await fetch(`/api/cart?userId=${uid}`);
      if (!res.ok) throw new Error(`Failed to fetch cart: ${res.status}`);
      const payload = await res.json();
      const data = payload?.data ?? payload;
      const itemsArray: any[] = data?.cart?.items ?? data?.items ?? [];
      const mappedItems: CartItem[] = (itemsArray ?? []).map((it: any) => ({
        id: String(it.id),
        name: it.product?.title ?? it.product?.name ?? "Unknown",
        price: it.unit_price ?? it.product?.price ?? 0,
        quantity: it.quantity ?? 1,
        image: it.product?.images?.[0]?.image_url ?? it.product?.images?.[0] ?? "",
        category: it.product?.category?.name ?? it.product?.category ?? "",
        maxQuantity: 999,
        productId: it.product?.id,
      }));
      setCartItems(mappedItems);
      setLastSync({ time: Date.now(), status: 'success' });
    } catch (err: any) {
      setLastSync({ time: Date.now(), status: 'error', message: err?.message ?? String(err) });
      // eslint-disable-next-line no-console
      console.warn('fetchAndSetCart error', err);
    }
  };

  // Save to localStorage whenever cartItems changes, and log for debugging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      // Debug log
      console.log('[CartContext] Cart updated:', cartItems);
    }
  }, [cartItems]);

  // Only fetch server cart on mount if user is logged in
  useEffect(() => {
    if (auth?.user) {
      (async () => {
        await fetchAndSetCart(auth.user.id);
      })();
    }
    // For guests, rely on localStorage only
  }, [auth?.user]);

  // When auth.user becomes available, attempt to merge any anon cart into the authenticated cart
  useEffect(() => {
    (async () => {
      const currentAuthUser = auth?.user;
      if (!currentAuthUser) return;
      // Check if we have an anon user id saved previously
      const saved = localStorage.getItem(CART_USER_KEY);
      if (!saved || saved.startsWith('anon-')) {
        const anonId = saved && saved.startsWith('anon-') ? saved : null;
        if (anonId) {
          try {
            // merge anon cart into authenticated cart on server
            setLastSync({ time: Date.now(), status: 'syncing' });
            const mergeRes = await fetch('/api/cart/merge', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fromUserId: anonId, toUserId: currentAuthUser.id }),
            });
            const mergePayload = await mergeRes.json();
            if (mergePayload?.success) {
              toast.success('Cart merged');
              setLastSync({ time: Date.now(), status: 'success' });
            } else {
              toast.error('Cart merge failed');
              setLastSync({ time: Date.now(), status: 'error', message: mergePayload?.error ?? 'merge failed' });
            }
          } catch (err) {
            // ignore merge errors
            // eslint-disable-next-line no-console
            console.warn('Cart merge failed', err);
            toast.error('Cart merge failed');
            setLastSync({ time: Date.now(), status: 'error', message: String(err) });
          }
        }
        // Ensure storage uses authenticated id
        localStorage.setItem(CART_USER_KEY, currentAuthUser.id);
        // refetch server cart for authenticated user
        await fetchAndSetCart(currentAuthUser.id);
      }
    })();
  }, [auth?.user]);

  const addToCart = async (item: Omit<CartItem, 'quantity'> & { productId?: string; variantId?: string }) => {
    const userId = getUserId();
    
    // Skip server operations for guest users (anon-*)
    if (userId && userId.startsWith('anon-')) {
      console.log('[CartContext] Guest user detected, using local cart only');
      const cartItemId = String(item.id ?? item.productId ?? `local-${Math.random().toString(36).slice(2,9)}`);
      console.log('[CartContext] Adding to local cart:', { cartItemId, itemName: item.name, itemPrice: item.price });
      
      setCartItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === cartItemId);
        
        if (existingItem) {
          console.log('[CartContext] Item already in cart, incrementing quantity');
          const newQuantity = existingItem.quantity + 1;
          return prevItems.map(i =>
            i.id === cartItemId ? { ...i, quantity: newQuantity } : i
          );
        }
        console.log('[CartContext] Adding new item to cart');
        return [...prevItems, { 
          ...item, 
          id: cartItemId,
          quantity: 1 
        }];
      });
      return;
    }
    
    // Server-backed cart for authenticated users
    if (userId && !userId.startsWith('anon-')) {
      try {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            productId: item.productId ?? item.id,
            variantId: (item as any).variantId ?? null,
            quantity: 1,
            boxes: 0,
          }),
        });
        // refetch cart
        const res = await fetch(`/api/cart?userId=${userId}`);
        const payload = await res.json();
        const data = payload?.data ?? payload;
        const itemsArray: any[] = data?.cart?.items ?? data?.items ?? [];
        const mappedItems: CartItem[] = (itemsArray ?? []).map((it: any) => ({
          id: String(it.id),
          name: it.product?.title ?? it.product?.name ?? "Unknown",
          price: it.unit_price ?? it.product?.price ?? 0,
          quantity: it.quantity ?? 1,
          image: it.product?.images?.[0]?.image_url ?? it.product?.images?.[0] ?? "",
          category: it.product?.category?.name ?? it.product?.category ?? "",
          maxQuantity: 999,
          productId: it.product?.id,
        }));
        setCartItems(mappedItems);
      } catch (err) {
        // fallback to local behavior if server fails
        console.warn('addToCart: server request failed, falling back to local cart', err);
        toast.error('Failed to add to server cart — using local cart');
        const localId = String(item.productId ?? item.id ?? `local-${Math.random().toString(36).slice(2,9)}`);
        setCartItems(prevItems => {
          const existingItem = prevItems.find(i => i.id === localId);
          if (existingItem) {
            const newQuantity = existingItem.quantity + 1;
            return prevItems.map(i => (i.id === localId ? { ...i, quantity: newQuantity } : i));
          }
          return [
            ...prevItems,
            {
              id: localId,
              name: item.name ?? 'Unknown',
              price: item.price ?? 0,
              quantity: 1,
              image: item.image ?? '',
              category: item.category ?? '',
              maxQuantity: item.maxQuantity ?? 999,
              productId: item.productId,
            },
          ];
        });
      }
      return;
    }

    // Local only behavior (for guests)
    const cartItemId = String(item.id ?? item.productId ?? `local-${Math.random().toString(36).slice(2,9)}`);
    console.log('[CartContext] Adding to local cart:', { cartItemId, itemName: item.name, itemPrice: item.price });
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === cartItemId);
      
      if (existingItem) {
        console.log('[CartContext] Item already in cart, incrementing quantity');
        const newQuantity = Math.min(
          existingItem.quantity + 1,
          existingItem.maxQuantity
        );
        return prevItems.map(i =>
          i.id === cartItemId ? { ...i, quantity: newQuantity } : i
        );
      }
      console.log('[CartContext] Adding new item to cart');
      return [...prevItems, { 
        ...item, 
        id: cartItemId,
        quantity: 1 
      }];
    });
  };

  const removeFromCart = async (id: string) => {
    const userId = getUserId();
    
    // Skip server operations for guest users (anon-*)
    if (userId && userId.startsWith('anon-')) {
      console.log('[CartContext] Removing item for guest user:', id);
      setCartItems(prevItems => prevItems.filter(item => item.id !== id));
      return;
    }
    
    // Server-backed cart for authenticated users
    if (userId && !userId.startsWith('anon-')) {
      try {
        await fetch('/api/cart/item', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cartItemId: id }),
        });
        const res = await fetch(`/api/cart?userId=${userId}`);
        const payload = await res.json();
        const mappedItems: CartItem[] = (payload.items ?? []).map((it: any) => ({
          id: String(it.id),
          name: it.product?.title ?? it.product?.name ?? "Unknown",
          price: it.unit_price ?? it.product?.price ?? 0,
          quantity: it.quantity ?? 1,
          image: it.product?.images?.[0]?.image_url ?? "",
          category: it.product?.category?.name ?? it.product?.category ?? "",
          maxQuantity: 999,
          productId: it.product?.id,
        }));
        setCartItems(mappedItems);
      } catch (err) {
        console.warn('[CartContext] Failed to remove item from server:', err);
      }
      return;
    }

    // Fallback for edge cases
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = async (id: string, quantity: number) => {
    const userId = getUserId();
    
    // Handle quantity <= 0 (remove item)
    if (quantity <= 0) {
      await removeFromCart(id);
      return;
    }
    
    // Skip server operations for guest users (anon-*)
    if (userId && userId.startsWith('anon-')) {
      console.log('[CartContext] Updating quantity for guest user:', { id, quantity });
      setCartItems(prevItems =>
        prevItems.map(item => {
          if (item.id === id) {
            console.log('[CartContext] Updated item quantity:', { id, quantity });
            return { ...item, quantity };
          }
          return item;
        })
      );
      return;
    }
    
    // Server-backed cart for authenticated users
    if (userId && !userId.startsWith('anon-')) {
      try {
        await fetch('/api/cart/item', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, cartItemId: id, quantity }),
        });
        const res = await fetch(`/api/cart?userId=${userId}`);
        const payload = await res.json();
        const data = payload?.data ?? payload;
        const itemsArray: any[] = data?.cart?.items ?? data?.items ?? [];
        const mappedItems: CartItem[] = (itemsArray ?? []).map((it: any) => ({
          id: String(it.id),
          name: it.product?.title ?? it.product?.name ?? "Unknown",
          price: it.unit_price ?? it.product?.price ?? 0,
          quantity: it.quantity ?? 1,
          image: it.product?.images?.[0]?.image_url ?? it.product?.images?.[0] ?? "",
          category: it.product?.category?.name ?? it.product?.category ?? "",
          maxQuantity: 999,
        }));
        setCartItems(mappedItems);
      } catch (err) {
        console.warn('[CartContext] Failed to update quantity on server:', err);
      }
      return;
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const isInCart = (id: string) => {
    return cartItems.some(item => item.id === id);
  };

  const getItemQuantity = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        cartCount,
        cartTotal,
        clearCart,
        isInCart,
        getItemQuantity,
        userId: currentUserId,
        lastSync,
        refreshCart: async () => await fetchAndSetCart(),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
