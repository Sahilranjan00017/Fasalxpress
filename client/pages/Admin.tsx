import { Header } from '@/components/layout/Header';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export default function Admin() {
  const [stats, setStats] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetch('/api/admin/orders/stats').then((r) => r.json());
        if (s?.success) setStats(s.data);
      } catch (err) {
        console.error('Failed to load stats', err);
      }

      try {
        const res = await fetch('/api/admin/orders');
        const json = await res.json();
        if (json?.success) setOrders(json.data || []);
      } catch (err) {
        console.error('Failed to load orders', err);
      }
    })();
  }, []);

  return (
    <div>
      <Header />
      <main className="container max-w-6xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalOrders ?? '—'}</div>
              <div className="text-sm text-muted-foreground">Orders placed</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Math.round(stats?.totalRevenue ?? 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Gross revenue</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Average Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{Math.round(stats?.averageOrderValue ?? 0).toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Average order value</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Orders</h2>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/admin/products">Products</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/vendors">Vendors</Link>
            </Button>
          </div>
        </div>

        <div className="bg-white border rounded">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o: any) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <Link to={`/orders/${o.id}`} className="text-primary underline">{o.id}</Link>
                  </TableCell>
                  <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>₹{(o.total_amount || 0).toLocaleString()}</TableCell>
                  <TableCell>{o.user?.email ?? o.user_id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
