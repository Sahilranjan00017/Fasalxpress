import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Link } from "react-router-dom";

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userId = localStorage.getItem("agrobuild_user_id");
        if (!userId) {
          setOrders([]);
          setLoading(false);
          return;
        }
        const res = await fetch(`/api/orders?userId=${userId}`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.data?.orders)) setOrders(json.data.orders);
        else if (json?.success && Array.isArray(json.data)) setOrders(json.data as any);
        else if (Array.isArray(json)) setOrders(json as any);
      } catch (err) {
        console.error("Failed to load orders", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <Header />
      <main className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <Button asChild>
            <Link to="/">Continue Shopping</Link>
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : orders.length === 0 ? (
          <div className="border rounded p-6 bg-white">You have no orders yet.</div>
        ) : (
          <div className="bg-white border rounded">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>
                      <Link to={`/orders/${o.id}`} className="text-primary underline">
                        {o.id}
                      </Link>
                    </TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>₹{(o.total_amount || 0).toLocaleString()}</TableCell>
                    <TableCell>
                      <Link to={`/orders/${o.id}`} className="text-sm text-primary underline">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
