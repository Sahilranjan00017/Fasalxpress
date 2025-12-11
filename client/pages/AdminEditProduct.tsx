import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabase/client';
import { Loader2, X, Upload, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { fetchProduct } from '@/lib/products';

const categories: Record<string, string[]> = {
  'Crop Protection': ['Insecticide', 'Fungicide', 'Herbicide'],
  Equipments: ['Sprayer'],
  'Animal Husbandry': ['Cattle Feed'],
};

// SKU variant options
const UNIT_TYPES = {
  'Litre': { label: 'Litre (L)', variants: ['100 ml', '250 ml', '500 ml', '1 Litre'] },
  'Kg': { label: 'Kilogram (Kg)', variants: ['100 g', '250 g', '500 g', '1 Kg'] },
};

const BOX_QUANTITIES = [6, 8, 10, 12];

interface SKUVariant {
  id: string;
  unitType: string;
  quantity: string;
  piecesPerBox: number;
  price: number;
  mrp: number;
  boxPrice: number;
  boxMrp: number;
}

export default function AdminEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<any>({
    title: '',
    price: '',
    mrp: '',
    category: '',
    subcategory: '',
    description: '',
    sku: '',
    brand: '',
    pack_size: '',
    gst_percentage: '',
    stock_quantity: 0,
    unit: '',
    unit_quantity: '',
    images: [],
  });

  const [skuVariants, setSkuVariants] = useState<SKUVariant[]>([]);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<Partial<SKUVariant>>({
    unitType: '',
    quantity: '',
    piecesPerBox: 6,
    price: 0,
    mrp: 0,
  });

  const getVariantsForUnit = (unitType: string) => {
    return UNIT_TYPES[unitType as keyof typeof UNIT_TYPES]?.variants || [];
  };

  const calculateBoxPrice = (price: number, quantity: number) => {
    return Math.round(price * quantity * 100) / 100;
  };

  const handleAddVariant = () => {
    if (!newVariant.unitType || !newVariant.quantity || !newVariant.price || !newVariant.mrp || !newVariant.piecesPerBox) {
      toast.error('Please fill all variant fields');
      return;
    }

    const variant: SKUVariant = {
      id: crypto.randomUUID(),
      unitType: newVariant.unitType || '',
      quantity: newVariant.quantity || '',
      piecesPerBox: newVariant.piecesPerBox || 6,
      price: newVariant.price || 0,
      mrp: newVariant.mrp || 0,
      boxPrice: calculateBoxPrice(newVariant.price || 0, newVariant.piecesPerBox || 6),
      boxMrp: calculateBoxPrice(newVariant.mrp || 0, newVariant.piecesPerBox || 6),
    };

    setSkuVariants([...skuVariants, variant]);
    setNewVariant({ unitType: '', quantity: '', piecesPerBox: 6, price: 0, mrp: 0 });
    setShowAddVariant(false);
    toast.success('Variant added successfully');
  };

  const handleDeleteVariant = (id: string) => {
    setSkuVariants(skuVariants.filter(v => v.id !== id));
    toast.success('Variant removed');
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const product = await fetchProduct(id);
        if (product) {
          setForm({
            title: product.title || product.name || '',
            price: product.price || '',
            mrp: product.mrp || '',
            category: product.category_name || product.category || '',
            subcategory: product.subcategory_name || product.subcategory || '',
            description: product.description || '',
            sku: product.sku || '',
            brand: product.brand || '',
            pack_size: product.pack_size || '',
            gst_percentage: product.gst_percentage || '',
            stock_quantity: product.stock_quantity || 0,
            unit: product.unit || '',
            unit_quantity: product.unit_quantity || '',
            images: product.images || [],
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabaseClient().storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          toast.error('Storage bucket not found. Please run database/storage-setup.sql in Supabase SQL Editor first!');
          throw uploadError;
        }

        const { data: { publicUrl } } = supabaseClient().storage
          .from('products')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }

      setForm({ ...form, images: [...form.images, ...uploadedUrls] });
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to upload images: ' + (err?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setForm({ ...form, images: form.images.filter((_: any, i: number) => i !== index) });
  };

  const handleSubmit = async () => {
    if (!id) return;

    if (skuVariants.length === 0) {
      toast.error('Please add at least one SKU variant');
      return;
    }

    const payload = {
      title: form.title,
      price: form.price ? parseFloat(form.price) : null,
      mrp: form.mrp ? parseFloat(form.mrp) : null,
      category_name: form.category || null,
      subcategory_name: form.subcategory || null,
      description: form.description || null,
      sku: form.sku || null,
      brand: form.brand || null,
      pack_size: form.pack_size || null,
      gst_percentage: form.gst_percentage ? parseFloat(form.gst_percentage) : null,
      stock_quantity: form.stock_quantity != null ? Number(form.stock_quantity) : 0,
      unit: form.unit || null,
      unit_quantity: form.unit_quantity ? parseFloat(form.unit_quantity) : null,
      images: form.images && form.images.length ? form.images : null,
      availability: true,
      sku_variants: skuVariants, // Add SKU variants
    };

    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json?.success) {
        toast.success('Product updated successfully');
        navigate('/admin/products');
      } else {
        toast.error('Failed to update product: ' + (json?.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to update product');
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main className="container max-w-3xl mx-auto py-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="container max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>

        {/* Image Upload Section */}
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <label className="block text-sm font-medium mb-2">Product Images</label>
          <div className="mb-4">
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 px-4 py-2 bg-white border border-dashed border-gray-300 rounded-lg hover:border-primary transition">
                <Upload className="w-5 h-5 text-gray-600" />
                <span className="text-sm text-gray-700">
                  {uploading ? 'Uploading...' : 'Click to upload images'}
                </span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">Upload multiple images (JPG, PNG, WebP)</p>
          </div>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              {form.images.map((img: string, idx: number) => (
                <div key={idx} className="relative group">
                  <img src={img} alt={`Product ${idx + 1}`} className="w-full h-32 object-cover rounded-lg border" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="block text-sm font-medium mb-1">Product Name *</label>
        <Input value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value })} className="mb-4" />

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: '' })}
            >
              <option value="">Select Category</option>
              {Object.keys(categories).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {form.category && (
            <div>
              <label className="block text-sm font-medium mb-1">Subcategory</label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={form.subcategory}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
              >
                <option value="">Select Subcategory</option>
                {categories[form.category].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">MRP *</label>
            <Input type="number" value={form.mrp} onChange={(e: any) => setForm({ ...form, mrp: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Selling Price *</label>
            <Input type="number" value={form.price} onChange={(e: any) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <Input value={form.sku} onChange={(e: any) => setForm({ ...form, sku: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <Input value={form.brand} onChange={(e: any) => setForm({ ...form, brand: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <Input type="number" value={form.stock_quantity} onChange={(e: any) => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">GST %</label>
            <Input type="number" value={form.gst_percentage} onChange={(e: any) => setForm({ ...form, gst_percentage: e.target.value })} />
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={form.description}
          onChange={(e: any) => setForm({ ...form, description: e.target.value })}
          className="w-full border rounded-md p-3 mb-6"
          rows={5}
        />

        {/* SKU Variants Section */}
        <div className="border rounded-lg p-6 bg-blue-50 mb-6">
          <h2 className="text-lg font-bold mb-4">SKU Variants *</h2>
          <p className="text-sm text-gray-600 mb-4">Manage product variants with different units, quantities, and box packing options</p>

          {/* Existing Variants List */}
          {skuVariants.length > 0 && (
            <div className="mb-6 space-y-3">
              <h3 className="font-semibold text-sm">Added Variants ({skuVariants.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {skuVariants.map((variant) => (
                  <div key={variant.id} className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-semibold text-sm">{variant.quantity} ({UNIT_TYPES[variant.unitType as keyof typeof UNIT_TYPES]?.label})</p>
                        <p className="text-xs text-gray-600">{variant.piecesPerBox} pieces per box</p>
                      </div>
                      <button
                        onClick={() => handleDeleteVariant(variant.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Unit Price</p>
                        <p className="font-semibold">₹{variant.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Unit MRP</p>
                        <p className="font-semibold">₹{variant.mrp.toFixed(2)}</p>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-gray-200">
                        <p className="text-gray-600">Box Total (₹{variant.boxPrice.toFixed(2)} for {variant.piecesPerBox} units)</p>
                        <p className="font-bold text-blue-600">Box Price: ₹{variant.boxPrice.toFixed(2)} | Box MRP: ₹{variant.boxMrp.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Variant Form */}
          {showAddVariant ? (
            <div className="bg-white p-4 rounded-lg border-2 border-blue-300 mb-4">
              <h3 className="font-semibold mb-4">Add New Variant</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Type *</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={newVariant.unitType}
                    onChange={(e) => setNewVariant({ ...newVariant, unitType: e.target.value, quantity: '' })}
                  >
                    <option value="">Select Unit Type</option>
                    {Object.entries(UNIT_TYPES).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>

                {newVariant.unitType && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity *</label>
                    <select
                      className="w-full border rounded-md px-3 py-2"
                      value={newVariant.quantity}
                      onChange={(e) => setNewVariant({ ...newVariant, quantity: e.target.value })}
                    >
                      <option value="">Select Quantity</option>
                      {getVariantsForUnit(newVariant.unitType).map((q) => (
                        <option key={q} value={q}>{q}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Price (₹) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newVariant.price}
                    onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Unit MRP (₹) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newVariant.mrp}
                    onChange={(e) => setNewVariant({ ...newVariant, mrp: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g., 200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pieces per Box *</label>
                  <select
                    className="w-full border rounded-md px-3 py-2"
                    value={newVariant.piecesPerBox}
                    onChange={(e) => setNewVariant({ ...newVariant, piecesPerBox: parseInt(e.target.value) })}
                  >
                    {BOX_QUANTITIES.map((qty) => (
                      <option key={qty} value={qty}>{qty} pieces</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Box Price Preview */}
              {newVariant.quantity && newVariant.price && newVariant.mrp && newVariant.piecesPerBox && (
                <div className="bg-blue-100 p-3 rounded-md mb-4 border border-blue-300">
                  <p className="text-sm font-semibold text-blue-900">
                    Box Calculation: {newVariant.piecesPerBox} units × ₹{newVariant.price.toFixed(2)} = <span className="text-lg text-blue-700">₹{calculateBoxPrice(newVariant.price, newVariant.piecesPerBox).toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-blue-800 mt-1">
                    Box MRP: {newVariant.piecesPerBox} units × ₹{newVariant.mrp.toFixed(2)} = <span className="font-semibold">₹{calculateBoxPrice(newVariant.mrp, newVariant.piecesPerBox).toFixed(2)}</span>
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={handleAddVariant} className="bg-green-600 hover:bg-green-700">
                  <Plus className="w-4 h-4 mr-1" /> Add Variant
                </Button>
                <Button variant="outline" onClick={() => setShowAddVariant(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowAddVariant(true)} variant="outline" className="w-full mb-4">
              <Plus className="w-4 h-4 mr-2" /> Add SKU Variant
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={uploading || skuVariants.length === 0}>
            {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...</> : 'Update Product'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
        </div>
      </main>
    </div>
  );
}
