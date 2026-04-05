import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import SearchNavigator from '../components/SearchNavigator';
import PropertyCard from '../components/PropertyCard';
import MapView from '../components/MapView';
import { Loader2, Map as MapIcon, LayoutGrid } from 'lucide-react';
import { motion } from 'motion/react';

export default function HomePage() {
  const { role } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  const fetchProperties = async (currentFilters: any) => {
    setLoading(true);
    try {
      let q = query(
        collection(db, 'properties'),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      let results = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      if (currentFilters.governorate) {
        results = results.filter(p => p.location?.governorate === currentFilters.governorate);
      }
      if (currentFilters.city) {
        results = results.filter(p => p.location?.city === currentFilters.city);
      }
      if (currentFilters.listingType) {
        results = results.filter(p => p.listingType === currentFilters.listingType);
      }
      if (currentFilters.category) {
        results = results.filter(p => p.category === currentFilters.category);
      }

      setProperties(results);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties(filters);
  }, [filters]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
        </div>
        
        <div className="relative px-6 py-24 sm:py-32 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight"
          >
            ابحث عن عقار أحلامك
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 font-medium"
          >
            تصفح آلاف العقارات المتاحة للبيع والإيجار في جميع أنحاء مصر بأفضل الأسعار
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl shadow-xl border border-white/20"
          >
            <SearchNavigator onSearch={setFilters} />
          </motion.div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">أحدث العقارات المضافة</h2>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              {properties.length} عقار متاح
            </span>
          </div>
          
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              عرض القائمة
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${viewMode === 'map' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <MapIcon className="w-4 h-4" />
              عرض الخريطة
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : properties.length > 0 ? (
          viewMode === 'grid' ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {properties.map((property, index) => (
                <motion.div
                  key={property.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <PropertyCard 
                    property={property} 
                    showDelete={role === 'admin'}
                    onDelete={handleDelete}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <MapView properties={properties} />
            </motion.div>
          )
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب تغيير خيارات البحث للوصول إلى عقارات أكثر.</p>
          </div>
        )}
      </div>
    </div>
  );
}
