import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, Tag, Trash2, Loader2, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

interface PropertyCardProps {
  property: any;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdminView?: boolean;
  showDelete?: boolean;
}

export default function PropertyCard({ property, onApprove, onReject, onDelete, isAdminView, showDelete }: PropertyCardProps) {
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const { user, userData } = useAuth();

  const isFavorite = userData?.favorites?.includes(property.id);

  const isVideo = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.ogg') || lowerUrl.includes('.mov') || lowerUrl.startsWith('data:video/');
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to property details
    if (!user) {
      alert("يرجى تسجيل الدخول لإضافة العقار للمفضلة.");
      return;
    }
    
    try {
      const userRef = doc(db, 'users', user.uid);
      if (isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayRemove(property.id)
        });
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(property.id)
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(price);
  };

  const categoryMap: Record<string, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    commercial: 'تجاري',
    land: 'أرض'
  };

  const listingTypeMap: Record<string, string> = {
    sale: 'للبيع',
    rent: 'للإيجار'
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      <Link to={`/property/${property.id}`} className="relative h-56 overflow-hidden bg-gray-100 block">
        {!isMediaLoaded && property.images && property.images.length > 0 && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          </div>
        )}
        {property.images && property.images.length > 0 ? (
          isVideo(property.images[0]) ? (
            <video 
              src={property.images[0]} 
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
              muted loop playsInline
              onLoadedData={() => setIsMediaLoaded(true)}
            />
          ) : (
            <img 
              src={property.images[0]} 
              alt={property.title} 
              className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onLoad={() => setIsMediaLoaded(true)}
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            لا توجد صورة
          </div>
        )}
        
        {/* Gradients and Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold text-gray-800 shadow-lg">
          {listingTypeMap[property.listingType]}
        </div>
        <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-lg">
          {categoryMap[property.category]}
        </div>
        
        {/* Favorite Button */}
        <button 
          onClick={toggleFavorite}
          className="absolute bottom-4 right-4 p-2.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg hover:scale-110 transition-transform z-20"
        >
          <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>
      </Link>
      
      <div className="p-6 flex flex-col flex-grow">
        <Link to={`/property/${property.id}`}>
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors leading-tight">{property.title}</h3>
        </Link>
        
        <div className="flex items-center text-gray-500 text-sm mb-5 font-medium">
          <MapPin className="h-4 w-4 ml-1.5 text-gray-400" />
          <span className="line-clamp-1">{property.location.governorate}، {property.location.city}</span>
        </div>
        
        <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center text-gray-900 font-extrabold text-lg">
            <Tag className="h-5 w-5 ml-1.5 text-blue-600" />
            {formatPrice(property.price)}
          </div>
          <div className="flex items-center text-gray-500 text-sm font-semibold bg-gray-50 px-3 py-1.5 rounded-lg">
            <Maximize className="h-4 w-4 ml-1.5 text-gray-400" />
            {property.area} م²
          </div>
        </div>

        {isAdminView && property.status === 'pending' && (
          <div className="mt-5 flex gap-3 pt-5 border-t border-gray-100">
            <button 
              onClick={() => onApprove && onApprove(property.id)}
              className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              موافقة
            </button>
            <button 
              onClick={() => onReject && onReject(property.id)}
              className="flex-1 bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-sm py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              رفض
            </button>
          </div>
        )}

        {showDelete && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <button 
              onClick={() => onDelete && onDelete(property.id)}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-700 hover:bg-red-100 hover:shadow-sm py-2.5 rounded-xl text-sm font-bold transition-all"
            >
              <Trash2 className="h-4 w-4" />
              حذف المنشور
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
