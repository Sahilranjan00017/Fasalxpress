import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ProductDescription() {
  return (
    <Tabs defaultValue="description" className="mt-12">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="specifications">Specifications</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>
      
      <TabsContent value="description" className="py-4">
        <div className="prose max-w-none">
          <h3>Product Description</h3>
          <p>
            This is a detailed description of the product. It includes all the necessary information
            about the product, its features, benefits, and usage instructions.
          </p>
          <h4>Key Features:</h4>
          <ul>
            <li>High-quality materials</li>
            <li>Eco-friendly production</li>
            <li>Long-lasting durability</li>
            <li>Easy to use</li>
          </ul>
        </div>
      </TabsContent>
      
      <TabsContent value="specifications" className="py-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Specifications</h3>
          <div className="grid gap-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Brand</span>
              <span>AgroBuild</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Category</span>
              <span>Farming Equipment</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Weight</span>
              <span>5 kg</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-muted-foreground">Dimensions</span>
              <span>30 x 20 x 10 cm</span>
            </div>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="reviews" className="py-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Customer Reviews</h3>
          <div className="space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">John D.</div>
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Great product! Works exactly as described. Very happy with my purchase.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">2 days ago</p>
            </div>
            
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">Sarah M.</div>
                <div className="flex items-center text-yellow-400">
                  {[...Array(4)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-5 w-5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg
                    className="h-5 w-5 text-gray-300"
                    fill="none"
                    viewBox="0 0 20 20"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Good quality, but shipping took longer than expected.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">1 week ago</p>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
