import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function AdminPurchaseOrders() {
  const [pos, setPos] = useState<any[]>([]);
  const [vendorId, setVendorId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [baseTotal, setBaseTotal] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/purchase-orders');
        const data = await res.json();
        setPos(data ?? []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const createPO = async () => {
    try {
      const res = await fetch('/api/admin/purchase-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId, product_id: productId, quantity, base_total: baseTotal }),
      });
      const data = await res.json();
      setPos((p) => [data, ...p]);
      setVendorId('');
      setProductId('');
      setQuantity(1);
      setBaseTotal(0);
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Header />
      <div className="container max-w-6xl mx-auto py-8">
        <h1 className="text-3xl mb-6">Admin / Purchase Orders</h1>
        <div className="mb-6">
          <Input value={vendorId} onChange={(e) => setVendorId((e.target as any).value)} placeholder="Vendor ID" />
          <Input value={productId} onChange={(e) => setProductId((e.target as any).value)} placeholder="Product ID" />
          <Input value={quantity} type="number" onChange={(e) => setQuantity(parseInt((e.target as any).value || '1'))} placeholder="Quantity" />
          <Input value={baseTotal} type="number" onChange={(e) => setBaseTotal(parseFloat((e.target as any).value || '0'))} placeholder="Base Total" />
          <Button onClick={createPO} className="mt-2">Create PO</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pos.map(po => (
            <div key={po.id} className="border p-4 rounded">
              <div>PO #{po.id} • Vendor: {po.vendor_id} • Product: {po.product_id}</div>
              <div>Qty: {po.quantity} • Total: ₹{po.final_total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
