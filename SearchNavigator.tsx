import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

const locationData: Record<string, string[]> = {
  "القاهرة": ["التجمع الخامس", "مدينة نصر", "المعادي", "الشروق", "الرحاب", "مدينتي"],
  "الجيزة": ["الشيخ زايد", "أكتوبر", "الدقي", "الهرم", "المهندسين"],
  "الإسكندرية": ["سموحة", "المنتزة", "ستانلي", "سيدي بشر", "ميامي"]
};

interface SearchNavigatorProps {
  onSearch: (filters: any) => void;
}

export default function SearchNavigator({ onSearch }: SearchNavigatorProps) {
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const [category, setCategory] = useState("");

  const handleSearch = () => {
    onSearch({ governorate, city, listingType, category });
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        
        <div className="relative">
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pr-10 p-2.5"
            value={governorate}
            onChange={(e) => { setGovernorate(e.target.value); setCity(""); }}
          >
            <option value="">اختر المحافظة</option>
            {Object.keys(locationData).map(gov => (
              <option key={gov} value={gov}>{gov}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:opacity-50"
            disabled={!governorate}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">اختر المدينة/المنطقة</option>
            {governorate && locationData[governorate].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="relative">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={listingType}
            onChange={(e) => setListingType(e.target.value)}
          >
            <option value="">نوع العرض</option>
            <option value="sale">للبيع</option>
            <option value="rent">للإيجار</option>
          </select>
        </div>

        <div className="relative">
          <select 
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">نوع العقار</option>
            <option value="apartment">شقة</option>
            <option value="villa">فيلا</option>
            <option value="commercial">تجاري / مول</option>
            <option value="land">أرض</option>
          </select>
        </div>

        <button 
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          <Search className="h-5 w-5" />
          <span>بحث</span>
        </button>

      </div>
    </div>
  );
}
