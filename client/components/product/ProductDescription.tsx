import { useState } from 'react';

const description = `
UPL SAAF Fungicide is a highly effective systemic fungicide that provides excellent control against a wide range of fungal diseases in various crops. Its unique formulation ensures long-lasting protection and helps in maintaining healthy plant growth.

Key Benefits:
• Controls major fungal diseases including Late Blight, Early Blight, and Downy Mildew
• Systemic action provides both protective and curative effects
• Rainfast within 2 hours of application
• No phytotoxicity when used as recommended
• Compatible with most commonly used pesticides

Dosage: 2-2.5 ml per liter of water

Application Method: Foliar spray

Waiting Period: 3 days

Storage: Store in a cool, dry place away from direct sunlight
`;

const specifications = [
  { name: 'Brand', value: 'UPL' },
  { name: 'Formulation', value: 'Liquid' },
  { name: 'Active Ingredient', value: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC' },
  { name: 'Pack Size', value: '1L, 250ml, 100ml' },
  { name: 'Shelf Life', value: '24 Months' },
  { name: 'Country of Origin', value: 'India' },
];

export const ProductDescription = () => {
  const [activeTab, setActiveTab] = useState('description');

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('description')}
            className={`py-4 px-6 text-sm font-medium ${activeTab === 'description' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`py-4 px-6 text-sm font-medium ${activeTab === 'specifications' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Specifications
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'description' ? (
          <div className="prose max-w-none">
            {description.split('\n').map((paragraph, index) => (
              <p key={index} className="text-gray-600 mb-4">
                {paragraph.trim() || <br />}
              </p>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {specifications.map((spec, index) => (
              <div key={index} className="grid grid-cols-3">
                <dt className="text-sm font-medium text-gray-500">{spec.name}</dt>
                <dd className="col-span-2 text-sm text-gray-900">{spec.value}</dd>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
