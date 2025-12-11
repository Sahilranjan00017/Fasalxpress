import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { fetchProducts, getProductPrices, type Product } from '@/lib/products';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    fetchProducts({ limit: 100 })
      .then(({ products }) => {
        setProducts(products);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, price: parseFloat(price) || 0 }),
      });
      const result = await res.json();
      // server may return the product directly or an envelope
      const product = result?.data?.product ?? result?.product ?? result;
      if (product) setProducts((p) => [product, ...p]);
      setTitle('');
      setPrice('');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete product');
      }
      
      // Remove from local state
      setProducts((p) => p.filter((x) => x.id !== id));
      
      // Show success message
      console.log('Product deleted successfully:', id);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete product. Please try again.');
    }
  };

  return (
    <div>
      <Header />
      <div className="container max-w-6xl mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl">Admin / Products</h1>
          {user?.role === 'admin' && (
            <div className="flex gap-2">
              <Button onClick={() => navigate('/admin/products/create')}>Add Product</Button>
            </div>
          )}
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => {
              const image = product.images?.[0] || product.image;
              const { price, mrp, discount, hasSKUs } = getProductPrices(product);
              
              return (
                <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition" key={product.id}>
                  {image ? (
                    <div className="relative w-full h-0 pb-[100%] bg-white">
                      <img 
                        src={image} 
                        alt={product.title || product.name} 
                        className="absolute inset-0 w-full h-full object-contain p-4" 
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-0 pb-[100%] bg-gray-50 flex items-center justify-center">
                      <svg className="absolute inset-0 m-auto w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">{product.title || product.name}</h3>
                    <p className="text-xs text-gray-600 mb-2">{product.category_name || product.category}</p>
                    <div className="mb-2">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-green-600">₹{price.toLocaleString('en-IN')}</p>
                        {hasSKUs && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">Lowest</span>
                        )}
                      </div>
                      {mrp > price && (
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-gray-500 line-through">₹{mrp.toLocaleString('en-IN')}</p>
                          <span className="text-xs text-orange-600 font-semibold">{discount}% OFF</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigate(`/products/${product.id}`)}>View</Button>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/admin/products/edit/${product.id}`)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
