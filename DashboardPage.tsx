import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, documentId } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Loader2, Building, Heart } from 'lucide-react';

export default function DashboardPage() {
  const { user, role, userData } = useAuth();
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [favoriteProperties, setFavoriteProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my-properties' | 'favorites'>('my-properties');

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) return;
      
      try {
        // Fetch My Properties
        const qMy = query(
          collection(db, 'properties'),
          where('ownerId', '==', user.uid)
        );
        const mySnapshot = await getDocs(qMy);
        setMyProperties(mySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Fetch Favorites
        if (userData?.favorites && userData.favorites.length > 0) {
          // Firestore 'in' query supports up to 10 items.
          // For a real app with many favorites, you'd chunk the array or fetch them individually.
          // For this prototype, we'll fetch the first 10 favorites.
          const favsToFetch = userData.favorites.slice(0, 10);
          const qFav = query(
            collection(db, 'properties'),
            where(documentId(), 'in', favsToFetch)
          );
          const favSnapshot = await getDocs(qFav);
          setFavoriteProperties(favSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setFavoriteProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [user, role, userData?.favorites]);

  if (!user) {
    return <div className="text-center py-20">يرجى تسجيل الدخول لعرض لوحة التحكم.</div>;
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'properties', id));
      setMyProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center gap-4">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-16 h-16 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
            {user.displayName?.charAt(0) || 'U'}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user.displayName}</h1>
          <p className="text-gray-500">{user.email}</p>
          <span className="inline-block mt-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium">
            {role === 'admin' ? 'مدير النظام' : role === 'agent' ? 'وكيل عقاري' : role === 'owner' ? 'مالك عقار' : 'عميل'}
          </span>
        </div>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('my-properties')}
          className={`pb-3 font-bold text-lg flex items-center gap-2 transition-colors ${activeTab === 'my-properties' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Building className="h-5 w-5" />
          عقاراتي
        </button>
        <button 
          onClick={() => setActiveTab('favorites')}
          className={`pb-3 font-bold text-lg flex items-center gap-2 transition-colors ${activeTab === 'favorites' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Heart className="h-5 w-5" />
          المفضلة
        </button>
      </div>

      <div>
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : activeTab === 'my-properties' ? (
          myProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProperties.map(property => (
                <div key={property.id} className="relative">
                  <PropertyCard 
                    property={property} 
                    showDelete={role === 'admin' || property.ownerId === user.uid}
                    onDelete={handleDelete}
                  />
                  <div className={`absolute top-3 left-20 px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm
                    ${property.status === 'published' ? 'bg-green-500/90 text-white' : 
                      property.status === 'rejected' ? 'bg-red-500/90 text-white' : 
                      'bg-yellow-500/90 text-white'}`}>
                    {property.status === 'published' ? 'منشور' : property.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">لم تقم بإضافة أي عقارات بعد.</p>
            </div>
          )
        ) : (
          favoriteProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProperties.map(property => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-500">لم تقم بإضافة أي عقارات للمفضلة بعد.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
