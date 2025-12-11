import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabaseClient } from '@/lib/supabase/client';
import { Loader2, X, Upload, Plus, Trash2, GripVertical, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { fetchProduct } from '@/lib/products';

// Configuration
const CATEGORIES = ['Insecticides', 'Fungicides', 'Herbicides', 'Seeds', 'Fertilizers', 'Plant Growth Regulators', 'Bio-Pesticides'];
const CLASSIFICATIONS = ['Chemical', 'Organic', 'Biological'];
const TOXICITY_LEVELS = [
  { value: 'red', label: 'Red (Highly Toxic)', color: 'bg-red-500' },
  { value: 'yellow', label: 'Yellow (Moderately Toxic)', color: 'bg-yellow-500' },
  { value: 'blue', label: 'Blue (Slightly Toxic)', color: 'bg-blue-500' },
  { value: 'green', label: 'Green (Non-Toxic)', color: 'bg-green-500' },
];
const CITIES = ['Hyderabad', 'Uttar Pradesh', 'Bangalore', 'Mumbai', 'Delhi'];
const UNIT_TYPES = ['ml', 'litre', 'gm', 'kg', 'box', 'packet', 'piece'];

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  altText: string;
}

interface SKUVariant {
  id: string;
  variantName: string;
  unitType: string;
  price: number;
  mrp: number;
  sku: string;
  boxPieces: number;
  stock: number;
  tags: {
    bestSeller: boolean;
    valuePack: boolean;
    newArrival: boolean;
  };
}

interface AlternativeProduct {
  id: string;
  productName: string;
  image: string;
  price: number;
  chemical: string;
  rating: number;
  link: string;
}

export default function AdminCreateProductNew() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);

  // SECTION 1: Basic Details
  const [basicDetails, setBasicDetails] = useState({
    productName: '',
    brand: '',
    category: '',
    classification: '',
    technicalContent: '',
    toxicityLevel: '',
    city: '',
  });

  // SECTION 2: Images
  const [images, setImages] = useState<ProductImage[]>([]);
  const [draggedImage, setDraggedImage] = useState<string | null>(null);

  // SECTION 3: SKU Variants
  const [variants, setVariants] = useState<SKUVariant[]>([]);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [editingVariant, setEditingVariant] = useState<SKUVariant | null>(null);
  const [newVariant, setNewVariant] = useState<Partial<SKUVariant>>({
    variantName: '',
    unitType: 'ml',
    price: 0,
    mrp: 0,
    sku: '',
    boxPieces: 1,
    stock: 0,
    tags: { bestSeller: false, valuePack: false, newArrival: false },
  });

  // SECTION 4: Alternative Products
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);

  // SECTION 5: Delivery Info
  const [deliveryInfo, setDeliveryInfo] = useState({
    countryOfOrigin: 'India',
    codAvailable: true,
    readyToShip: true,
  });

  // SECTION 6: Overview (auto-populated)
  const overview = {
    productName: basicDetails.productName,
    brand: basicDetails.brand,
    category: basicDetails.category,
    technicalContent: basicDetails.technicalContent,
    classification: basicDetails.classification,
    toxicity: basicDetails.toxicityLevel,
  };

  // SECTION 7: Product Description
  const [description, setDescription] = useState({
    about: '',
    modeOfEntry: '',
    modeOfAction: '',
    chemicalGroup: '',
    targetPests: '',
    recommendedCrops: '',
    dosagePerAcre: '',
    howToApply: '',
  });

  // SECTION 8: Trust Markers
  const [trustMarkers, setTrustMarkers] = useState({
    original: true,
    bestPrices: true,
    cod: true,
    securePayments: true,
    inStock: true,
  });

  // SECTION 9: SEO
  const [seo, setSeo] = useState({
    metaTitle: '',
    metaDescription: '',
    urlSlug: '',
  });

  // SECTION 10: Publish Settings
  const [publishSettings, setPublishSettings] = useState({
    status: 'draft',
    publishDate: new Date().toISOString().split('T')[0],
    visible: true,
  });

  // Load product data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      loadProductData(id);
    }
  }, [id, isEditMode]);

  const loadProductData = async (productId: string) => {
    setLoadingProduct(true);
    try {
      const product = await fetchProduct(productId);
      
      if (!product) {
        throw new Error('Failed to load product');
      }

      // Populate basic details
      setBasicDetails({
        productName: product.title || product.name || '',
        brand: product.brand || '',
        category: product.category?.name || product.category || '',
        classification: product.classification || '',
        technicalContent: product.technical_content || '',
        toxicityLevel: product.toxicity_level || '',
        city: product.city || '',
      });

      // Populate images
      if (product.images && Array.isArray(product.images)) {
        const loadedImages = product.images.map((img: any, index: number) => ({
          id: typeof img === 'string' ? `img-${index}` : (img.id || `img-${index}`),
          url: typeof img === 'string' ? img : (img.url || img.image_url || ''),
          isPrimary: index === 0,
          sortOrder: index,
          altText: product.title || product.name || '',
        }));
        setImages(loadedImages);
      }

      // Populate SKU variants
      if (product.skus && Array.isArray(product.skus)) {
        const loadedVariants = product.skus.map((sku: any) => ({
          id: sku.id || crypto.randomUUID(),
          variantName: sku.quantity || '',
          unitType: sku.unit_type || 'ml',
          price: parseFloat(sku.unit_price || sku.price || 0),
          mrp: parseFloat(sku.mrp || sku.unit_price || sku.price || 0),
          sku: sku.sku || '',
          boxPieces: sku.pieces_per_box || 1,
          stock: sku.stock || 0,
          tags: {
            bestSeller: sku.best_seller || false,
            valuePack: sku.value_pack || false,
            newArrival: sku.new_arrival || false,
          },
        }));
        setVariants(loadedVariants);
      }

      // Populate description
      if (product.descriptions && Array.isArray(product.descriptions) && product.descriptions.length > 0) {
        const desc = product.descriptions[0];
        setDescription({
          about: desc.about || '',
          modeOfEntry: desc.mode_of_entry || '',
          modeOfAction: desc.mode_of_action || '',
          chemicalGroup: desc.chemical_group || '',
          targetPests: desc.target_pests || '',
          recommendedCrops: desc.recommended_crops || '',
          dosagePerAcre: desc.dosage_per_acre || '',
          howToApply: desc.how_to_apply || '',
        });
      }

      // Populate SEO
      setSeo({
        metaTitle: product.meta_title || product.title || '',
        metaDescription: product.meta_description || product.description || '',
        urlSlug: product.slug || '',
      });

      // Populate publish settings
      setPublishSettings({
        status: product.availability ? 'published' : 'draft',
        publishDate: product.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        visible: product.availability || false,
      });

      toast.success('Product loaded successfully');
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product data');
    } finally {
      setLoadingProduct(false);
    }
  };

  // Auto-generate URL slug from product name with uniqueness
  const generateSlug = (name: string) => {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Add random suffix to ensure uniqueness (8 chars)
    const randomSuffix = Math.random().toString(36).substring(2, 10);
    return `${baseSlug}-${randomSuffix}`;
  };

  // Auto-generate SKU
  const generateSKU = (brand: string, product: string, variant: string) => {
    const brandCode = brand.substring(0, 4).toUpperCase();
    const productCode = product.substring(0, 4).toUpperCase();
    const variantCode = variant.replace(/\s/g, '').toUpperCase();
    return `${brandCode}-${productCode}-${variantCode}`;
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedImages: ProductImage[] = [];

    try {
      const client = supabaseClient();

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { data, error: uploadError } = await client.storage
          .from('products')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = client.storage
          .from('products')
          .getPublicUrl(filePath);

        const newImage: ProductImage = {
          id: crypto.randomUUID(),
          url: publicUrl,
          isPrimary: images.length === 0 && i === 0,
          sortOrder: images.length + i,
          altText: `${basicDetails.productName} product image ${images.length + i + 1}`,
        };

        uploadedImages.push(newImage);
      }

      setImages([...images, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (err: any) {
      console.error('Upload failed:', err);
      toast.error('Failed to upload images: ' + (err?.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  // Remove image
  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  // Set primary image
  const setPrimaryImage = (id: string) => {
    setImages(images.map(img => ({ ...img, isPrimary: img.id === id })));
  };

  // Drag and drop for image reordering
  const handleDragStart = (id: string) => {
    setDraggedImage(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedImage) return;

    const draggedIdx = images.findIndex(img => img.id === draggedImage);
    const targetIdx = images.findIndex(img => img.id === targetId);

    const newImages = [...images];
    const draggedItem = newImages[draggedIdx];
    newImages.splice(draggedIdx, 1);
    newImages.splice(targetIdx, 0, draggedItem);

    // Update sort orders
    newImages.forEach((img, idx) => {
      img.sortOrder = idx;
    });

    setImages(newImages);
    setDraggedImage(null);
  };

  // Add/Edit Variant
  const handleSaveVariant = () => {
    if (!newVariant.variantName || !newVariant.price || !newVariant.mrp) {
      toast.error('Please fill all required variant fields');
      return;
    }

    const variant: SKUVariant = {
      id: editingVariant?.id || crypto.randomUUID(),
      variantName: newVariant.variantName!,
      unitType: newVariant.unitType!,
      price: newVariant.price!,
      mrp: newVariant.mrp!,
      sku: newVariant.sku || generateSKU(basicDetails.brand, basicDetails.productName, newVariant.variantName!),
      boxPieces: newVariant.boxPieces || 1,
      stock: newVariant.stock || 0,
      tags: newVariant.tags || { bestSeller: false, valuePack: false, newArrival: false },
    };

    if (editingVariant) {
      setVariants(variants.map(v => v.id === variant.id ? variant : v));
      toast.success('Variant updated');
    } else {
      setVariants([...variants, variant]);
      toast.success('Variant added');
    }

    setNewVariant({
      variantName: '',
      unitType: 'ml',
      price: 0,
      mrp: 0,
      sku: '',
      boxPieces: 1,
      stock: 0,
      tags: { bestSeller: false, valuePack: false, newArrival: false },
    });
    setEditingVariant(null);
    setShowAddVariant(false);
  };

  const handleEditVariant = (variant: SKUVariant) => {
    setNewVariant(variant);
    setEditingVariant(variant);
    setShowAddVariant(true);
  };

  const handleDeleteVariant = (id: string) => {
    setVariants(variants.filter(v => v.id !== id));
    toast.success('Variant deleted');
  };

  // Calculate discount
  const calculateDiscount = (mrp: number, price: number) => {
    if (mrp <= price) return 0;
    return Math.round(((mrp - price) / mrp) * 100);
  };

  // Submit form
  const handleSubmit = async () => {
    // Validation
    if (!basicDetails.productName) {
      toast.error('Product name is required');
      return;
    }
    if (!basicDetails.brand) {
      toast.error('Brand is required');
      return;
    }
    if (!basicDetails.city) {
      toast.error('City classification is required');
      return;
    }
    if (images.length === 0) {
      toast.error('At least one product image is required');
      return;
    }
    if (variants.length === 0) {
      toast.error('At least one SKU variant is required');
      return;
    }

    const payload = {
      // Basic details
      title: basicDetails.productName,
      brand: basicDetails.brand,
      category_name: basicDetails.category,
      classification: basicDetails.classification,
      technical_content: basicDetails.technicalContent,
      toxicity: basicDetails.toxicityLevel,
      city: basicDetails.city,
      
      // Description
      description: JSON.stringify(description),
      
      // Images
      images: images.map(img => ({
        url: img.url,
        is_primary: img.isPrimary,
        sort_order: img.sortOrder,
        alt_text: img.altText,
      })),
      
      // Variants
      variants: variants.map(v => ({
        variant_name: v.variantName,
        unit_type: v.unitType,
        price: v.price,
        mrp: v.mrp,
        sku: v.sku,
        box_pieces: v.boxPieces,
        stock: v.stock,
        tags: JSON.stringify(v.tags),
      })),
      
      // Delivery
      country_of_origin: deliveryInfo.countryOfOrigin,
      cod_available: deliveryInfo.codAvailable,
      ready_to_ship: deliveryInfo.readyToShip,
      
      // Trust markers
      trust_markers: JSON.stringify(trustMarkers),
      
      // SEO
      meta_title: seo.metaTitle || basicDetails.productName,
      meta_description: seo.metaDescription,
      slug: seo.urlSlug || (isEditMode ? seo.urlSlug : generateSlug(basicDetails.productName)),
      
      // Publish
      status: publishSettings.status,
      publish_date: publishSettings.publishDate,
      visible: publishSettings.visible,
      availability: publishSettings.visible,
    };

    try {
      const url = isEditMode ? `/api/admin/products/${id}` : '/api/admin/products';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const json = await res.json();
      
      if (json?.success) {
        toast.success(isEditMode ? 'Product updated successfully!' : 'Product created successfully!');
        navigate('/admin/products');
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product: ` + (json?.error || 'Unknown error'));
      }
    } catch (err: any) {
      console.error(err);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} product`);
    }
  };

  const steps = [
    'Basic Details',
    'Images',
    'SKU Variants',
    'Delivery',
    'Description',
    'Trust & SEO',
    'Publish',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {loadingProduct ? (
        <div className="container max-w-6xl mx-auto py-8 px-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600">Loading product data...</p>
          </div>
        </div>
      ) : (
        <main className="container max-w-6xl mx-auto py-8 px-4">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isEditMode ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-gray-600">
              {isEditMode 
                ? 'Update product details and specifications' 
                : 'Sales Head Portal - Add product details for website launch'}
            </p>
          </div>

        {/* Step Progress */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between overflow-x-auto">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                    currentStep > idx + 1
                      ? 'bg-green-500 text-white'
                      : currentStep === idx + 1
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > idx + 1 ? <Check className="w-5 h-5" /> : idx + 1}
                </div>
                <div className="ml-3 min-w-max">
                  <div className={`text-sm font-medium whitespace-nowrap ${currentStep === idx + 1 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {step}
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-12 h-1 mx-4 ${currentStep > idx + 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* SECTION 1: Basic Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Basic Product Details</h2>
                <p className="text-gray-600 mb-6">Enter the core information about your product</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Coragen Insecticide – Chlorantraniliprole 18.5% SC by FMC"
                  value={basicDetails.productName}
                  onChange={(e) => {
                    setBasicDetails({ ...basicDetails, productName: e.target.value });
                    if (!seo.urlSlug) {
                      setSeo({ ...seo, urlSlug: generateSlug(e.target.value) });
                    }
                  }}
                  className="max-w-2xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g., FMC"
                    value={basicDetails.brand}
                    onChange={(e) => setBasicDetails({ ...basicDetails, brand: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={basicDetails.category}
                    onChange={(e) => setBasicDetails({ ...basicDetails, category: e.target.value })}
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Classification</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={basicDetails.classification}
                    onChange={(e) => setBasicDetails({ ...basicDetails, classification: e.target.value })}
                  >
                    <option value="">Select Classification</option>
                    {CLASSIFICATIONS.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Technical Content</label>
                  <Input
                    placeholder="e.g., Chlorantraniliprole 18.50% SC"
                    value={basicDetails.technicalContent}
                    onChange={(e) => setBasicDetails({ ...basicDetails, technicalContent: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Toxicity Level</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={basicDetails.toxicityLevel}
                    onChange={(e) => setBasicDetails({ ...basicDetails, toxicityLevel: e.target.value })}
                  >
                    <option value="">Select Toxicity</option>
                    {TOXICITY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {basicDetails.toxicityLevel && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${TOXICITY_LEVELS.find(l => l.value === basicDetails.toxicityLevel)?.color}`}></div>
                      <span className="text-sm text-gray-600">
                        {TOXICITY_LEVELS.find(l => l.value === basicDetails.toxicityLevel)?.label}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    City Classification <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={basicDetails.city}
                    onChange={(e) => setBasicDetails({ ...basicDetails, city: e.target.value })}
                  >
                    <option value="">Select City</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Product will be shown only for this region during Phase 1
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Images */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Images</h2>
                <p className="text-gray-600 mb-6">Upload multiple images. First image will be the primary image. Drag to reorder.</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-700 font-medium">
                    {uploading ? 'Uploading...' : 'Click to upload'}
                  </span>
                  <span className="text-gray-600"> or drag and drop</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">JPG, PNG or WebP (max 5MB each)</p>
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((img) => (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={() => handleDragStart(img.id)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(img.id)}
                      className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition cursor-move"
                    >
                      <img src={img.url} alt={img.altText} className="w-full h-40 object-cover" />
                      
                      <div className="absolute top-2 left-2">
                        <GripVertical className="w-5 h-5 text-white drop-shadow-lg" />
                      </div>
                      
                      {img.isPrimary && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        {!img.isPrimary && (
                          <Button
                            size="sm"
                            onClick={() => setPrimaryImage(img.id)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            Set Primary
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeImage(img.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="p-2 bg-gray-50">
                        <p className="text-xs text-gray-600 truncate">{img.altText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 3: SKU Variants */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">SKU Variants</h2>
                <p className="text-gray-600 mb-6">Add different pack sizes and pricing options</p>
              </div>

              {/* Variants Table */}
              {variants.length > 0 && (
                <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Variant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">MRP</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Box/Pcs</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tags</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {variants.map((variant) => (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{variant.variantName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{variant.unitType}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{variant.price}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 line-through">₹{variant.mrp}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">
                              {calculateDiscount(variant.mrp, variant.price)}% OFF
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-mono text-gray-600">{variant.sku}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{variant.stock}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{variant.boxPieces} pcs</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {variant.tags.bestSeller && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-purple-100 text-purple-700">
                                  Best Seller
                                </span>
                              )}
                              {variant.tags.valuePack && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-700">
                                  Value Pack
                                </span>
                              )}
                              {variant.tags.newArrival && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                                  New
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditVariant(variant)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteVariant(variant.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add/Edit Variant Form */}
              {showAddVariant ? (
                <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {editingVariant ? 'Edit Variant' : 'Add New Variant'}
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Variant Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="e.g., 150 ml"
                        value={newVariant.variantName}
                        onChange={(e) => setNewVariant({ ...newVariant, variantName: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Unit Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={newVariant.unitType}
                        onChange={(e) => setNewVariant({ ...newVariant, unitType: e.target.value })}
                      >
                        {UNIT_TYPES.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Pieces per Box
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 6"
                        value={newVariant.boxPieces}
                        onChange={(e) => setNewVariant({ ...newVariant, boxPieces: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Selling Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 1124"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({ ...newVariant, price: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        MRP (₹) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2792"
                        value={newVariant.mrp}
                        onChange={(e) => setNewVariant({ ...newVariant, mrp: parseFloat(e.target.value) || 0 })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Stock Quantity
                      </label>
                      <Input
                        type="number"
                        placeholder="e.g., 200"
                        value={newVariant.stock}
                        onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      SKU Code
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., CORA-150ML"
                        value={newVariant.sku}
                        onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          const autoSku = generateSKU(
                            basicDetails.brand,
                            basicDetails.productName,
                            newVariant.variantName || ''
                          );
                          setNewVariant({ ...newVariant, sku: autoSku });
                        }}
                      >
                        Auto-Generate
                      </Button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-900 mb-2">Tags</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newVariant.tags?.bestSeller}
                          onChange={(e) => setNewVariant({
                            ...newVariant,
                            tags: { ...newVariant.tags!, bestSeller: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">Best Seller</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newVariant.tags?.valuePack}
                          onChange={(e) => setNewVariant({
                            ...newVariant,
                            tags: { ...newVariant.tags!, valuePack: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">Value Pack</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newVariant.tags?.newArrival}
                          onChange={(e) => setNewVariant({
                            ...newVariant,
                            tags: { ...newVariant.tags!, newArrival: e.target.checked }
                          })}
                          className="rounded"
                        />
                        <span className="text-sm">New Arrival</span>
                      </label>
                    </div>
                  </div>

                  {newVariant.price && newVariant.mrp && (
                    <div className="mb-4 p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-600">Discount</div>
                          <div className="text-2xl font-bold text-orange-600">
                            {calculateDiscount(newVariant.mrp, newVariant.price)}% OFF
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">You Save</div>
                          <div className="text-xl font-bold text-green-600">
                            ₹{(newVariant.mrp - newVariant.price).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={handleSaveVariant} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-1" />
                      {editingVariant ? 'Update Variant' : 'Add Variant'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddVariant(false);
                        setEditingVariant(null);
                        setNewVariant({
                          variantName: '',
                          unitType: 'ml',
                          price: 0,
                          mrp: 0,
                          sku: '',
                          boxPieces: 1,
                          stock: 0,
                          tags: { bestSeller: false, valuePack: false, newArrival: false },
                        });
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => setShowAddVariant(true)}
                  className="w-full border-2 border-dashed border-gray-300 bg-white text-gray-700 hover:border-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add SKU Variant
                </Button>
              )}
            </div>
          )}

          {/* SECTION 4: Delivery Info */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Delivery Information</h2>
                <p className="text-gray-600 mb-6">Configure delivery and shipping options</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Country of Origin
                  </label>
                  <Input
                    value={deliveryInfo.countryOfOrigin}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, countryOfOrigin: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={deliveryInfo.codAvailable}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, codAvailable: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">COD Available</div>
                      <div className="text-sm text-gray-500">Cash on Delivery option</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={deliveryInfo.readyToShip}
                      onChange={(e) => setDeliveryInfo({ ...deliveryInfo, readyToShip: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">Ready to Ship</div>
                      <div className="text-sm text-gray-500">Product is ready for immediate dispatch</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: Product Description */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Description</h2>
                <p className="text-gray-600 mb-6">Provide detailed information about the product</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">About Product</label>
                <textarea
                  className="w-full border border-gray-300 rounded-md p-3"
                  rows={4}
                  placeholder="What the product does, benefits, and use cases..."
                  value={description.about}
                  onChange={(e) => setDescription({ ...description, about: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Mode of Entry</label>
                  <Input
                    placeholder="e.g., Systemic, Contact"
                    value={description.modeOfEntry}
                    onChange={(e) => setDescription({ ...description, modeOfEntry: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Mode of Action</label>
                  <Input
                    placeholder="e.g., Inhibits muscle contraction"
                    value={description.modeOfAction}
                    onChange={(e) => setDescription({ ...description, modeOfAction: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Chemical Group</label>
                  <Input
                    placeholder="e.g., Anthranilic Diamide"
                    value={description.chemicalGroup}
                    onChange={(e) => setDescription({ ...description, chemicalGroup: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Target Pests</label>
                  <Input
                    placeholder="e.g., Bollworm, Fruit borer"
                    value={description.targetPests}
                    onChange={(e) => setDescription({ ...description, targetPests: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Recommended Crops</label>
                <Input
                  placeholder="e.g., Cotton, Tomato, Chilli"
                  value={description.recommendedCrops}
                  onChange={(e) => setDescription({ ...description, recommendedCrops: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Dosage per Acre</label>
                  <Input
                    placeholder="e.g., 60 ml per acre"
                    value={description.dosagePerAcre}
                    onChange={(e) => setDescription({ ...description, dosagePerAcre: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">How to Apply</label>
                  <Input
                    placeholder="e.g., Foliar spray"
                    value={description.howToApply}
                    onChange={(e) => setDescription({ ...description, howToApply: e.target.value })}
                  />
                </div>
              </div>

              {/* Overview Preview */}
              <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Overview (Auto-generated)</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Product Name</div>
                    <div className="font-medium">{overview.productName || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Brand</div>
                    <div className="font-medium">{overview.brand || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Category</div>
                    <div className="font-medium">{overview.category || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Technical Content</div>
                    <div className="font-medium">{overview.technicalContent || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Classification</div>
                    <div className="font-medium">{overview.classification || '-'}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Toxicity</div>
                    <div className="font-medium">{overview.toxicity || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: Trust Markers & SEO */}
          {currentStep === 6 && (
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Trust Markers & SEO</h2>
                <p className="text-gray-600 mb-6">Configure trust badges and search engine optimization</p>
              </div>

              {/* Trust Markers */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Trust Markers</h3>
                <p className="text-sm text-gray-600 mb-4">These badges will appear on the product page</p>

                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustMarkers.original}
                      onChange={(e) => setTrustMarkers({ ...trustMarkers, original: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">✓ 100% Original</div>
                      <div className="text-sm text-gray-500">Authentic products guaranteed</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustMarkers.bestPrices}
                      onChange={(e) => setTrustMarkers({ ...trustMarkers, bestPrices: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">✓ Best Prices</div>
                      <div className="text-sm text-gray-500">Competitive pricing</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustMarkers.cod}
                      onChange={(e) => setTrustMarkers({ ...trustMarkers, cod: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">✓ Cash on Delivery</div>
                      <div className="text-sm text-gray-500">COD available</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustMarkers.securePayments}
                      onChange={(e) => setTrustMarkers({ ...trustMarkers, securePayments: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">✓ Secure Payments</div>
                      <div className="text-sm text-gray-500">SSL encrypted</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={trustMarkers.inStock}
                      onChange={(e) => setTrustMarkers({ ...trustMarkers, inStock: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">✓ In Stock</div>
                      <div className="text-sm text-gray-500">Ready to ship</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* SEO Section */}
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
                <p className="text-sm text-gray-600 mb-4">Optimize for search engines</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Meta Title
                    </label>
                    <Input
                      placeholder={basicDetails.productName || "Auto-generated from product name"}
                      value={seo.metaTitle}
                      onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seo.metaTitle.length || basicDetails.productName.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      className="w-full border border-gray-300 rounded-md p-3"
                      rows={3}
                      placeholder="Brief description for search results..."
                      value={seo.metaDescription}
                      onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {seo.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">/products/</span>
                      <Input
                        placeholder="auto-generated-from-product-name"
                        value={seo.urlSlug}
                        onChange={(e) => setSeo({ ...seo, urlSlug: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Auto-generated, but you can customize it
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: Publish Settings */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Publish Settings</h2>
                <p className="text-gray-600 mb-6">Configure product visibility and publication</p>
              </div>

              <div className="p-6 border border-gray-200 rounded-lg space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Product Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={publishSettings.status}
                    onChange={(e) => setPublishSettings({ ...publishSettings, status: e.target.value })}
                  >
                    <option value="draft">Draft (Not visible to customers)</option>
                    <option value="published">Published (Live on website)</option>
                    <option value="hidden">Hidden (Temporarily disabled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Publish Date
                  </label>
                  <Input
                    type="date"
                    value={publishSettings.publishDate}
                    onChange={(e) => setPublishSettings({ ...publishSettings, publishDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={publishSettings.visible}
                      onChange={(e) => setPublishSettings({ ...publishSettings, visible: e.target.checked })}
                      className="w-5 h-5 rounded"
                    />
                    <div>
                      <div className="font-medium">Visible in Catalog</div>
                      <div className="text-sm text-gray-500">Product will appear in category listings</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Product Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product Name:</span>
                    <span className="font-medium">{basicDetails.productName || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Brand:</span>
                    <span className="font-medium">{basicDetails.brand || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">{basicDetails.city || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Images:</span>
                    <span className="font-medium">{images.length} uploaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU Variants:</span>
                    <span className="font-medium">{variants.length} added</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      publishSettings.status === 'published' ? 'text-green-600' :
                      publishSettings.status === 'draft' ? 'text-yellow-600' : 'text-gray-600'
                    }`}>
                      {publishSettings.status.charAt(0).toUpperCase() + publishSettings.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 7 ? (
              <Button
                onClick={() => setCurrentStep(Math.min(7, currentStep + 1))}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700"
              >
                {isEditMode ? 'Update Product' : 'Create Product'}
              </Button>
            )}
          </div>
        </div>
      </main>
      )}
    </div>
  );
}
