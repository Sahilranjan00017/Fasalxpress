import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function AdminVendors() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [name, setName] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/vendors');
        const data = await res.json();
        // Support envelope or raw array
        const vendorsArr = data?.data?.vendors ?? data?.vendors ?? (Array.isArray(data) ? data : []);
        setVendors(vendorsArr);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const createVendor = async () => {
    try {
      const res = await fetch('/api/admin/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      const vendor = result?.data?.vendor ?? result?.vendor ?? result;
      if (vendor) setVendors((v) => [vendor, ...v]);
      setName('');
    } catch (err) { console.error(err); }
  };

  return (
    <div>
      <Header />
      <div className="container max-w-6xl mx-auto py-8">
        <h1 className="text-3xl mb-6">Admin / Vendors</h1>
        <div className="mb-6">
          <Input value={name} onChange={(e) => setName((e.target as any).value)} placeholder="Vendor name" />
          <Button className="mt-2" onClick={createVendor}>Create Vendor</Button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {vendors.map(v => (
            <div key={v.id} className="border p-4 rounded">
              <h3 className="font-medium">{v.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
