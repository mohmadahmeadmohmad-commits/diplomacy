import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, addDoc, deleteDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Maximize, Tag, Star, Loader2, Trash2, UserCircle, Eye, MessageCircle } from 'lucide-react';

export default function PropertyDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [property, setProperty] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);

  const isVideo = (url: string) => {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.mp4') || lowerUrl.includes('.webm') || lowerUrl.includes('.ogg') || lowerUrl.includes('.mov') || lowerUrl.startsWith('data:video/');
  };

  useEffect(() => {
    const fetchPropertyAndComments = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'properties', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Handle view counter
          let currentViews = data.views || 0;
          const viewedKey = `viewed_${id}`;
          
          if (!sessionStorage.getItem(viewedKey)) {
            currentViews += 1;
            try {
              await updateDoc(docRef, { views: increment(1) });
              sessionStorage.setItem(viewedKey, 'true');
            } catch (e) {
              console.error("Could not increment views (might be due to security rules):", e);
              sessionStorage.setItem(viewedKey, 'true'); // Prevent retrying on this session
            }
          }
          
          setProperty({ id: docSnap.id, ...data, views: currentViews });
        }

        const q = query(collection(db, `properties/${id}/comments`), orderBy('createdAt', 'desc'));
        const commentsSnap = await getDocs(q);
        setComments(commentsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyAndComments();
  }, [id]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newComment.trim()) return;
    
    setSubmitting(true);
    try {
      const commentData = {
        propertyId: id,
        userId: user.uid,
        userName: user.displayName || 'مستخدم',
        text: newComment.trim(),
        rating,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, `properties/${id}/comments`), commentData);
      setComments([{ id: docRef.id, ...commentData }, ...comments]);
      setNewComment('');
      setRating(5);
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("حدث خطأ أثناء إضافة التعليق");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!id) return;
    try {
      await deleteDoc(doc(db, `properties/${id}/comments`, commentId));
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
  if (!property) return <div className="text-center py-20">العقار غير موجود.</div>;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Property Details */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="h-64 md:h-96 bg-gray-200 relative">
          {!isMediaLoaded && property.images && property.images.length > 0 && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center z-10">
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            </div>
          )}
          {property.images && property.images.length > 0 ? (
            isVideo(property.images[0]) ? (
              <video 
                src={property.images[0]} 
                controls 
                className={`w-full h-full object-contain bg-black transition-opacity duration-500 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoadedData={() => setIsMediaLoaded(true)}
              />
            ) : (
              <img 
                src={property.images[0]} 
                alt={property.title} 
                className={`w-full h-full object-cover transition-opacity duration-500 ${isMediaLoaded ? 'opacity-100' : 'opacity-0'}`} 
                referrerPolicy="no-referrer" 
                loading="lazy"
                onLoad={() => setIsMediaLoaded(true)}
              />
            )
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">لا توجد صورة</div>
          )}
        </div>
        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>
          <div className="flex flex-wrap gap-4 mb-6 text-gray-600">
            <div className="flex items-center gap-1"><MapPin className="h-5 w-5" /> {property.location.governorate}، {property.location.city} {property.location.neighborhood && `، ${property.location.neighborhood}`}</div>
            <div className="flex items-center gap-1 text-blue-600 font-bold"><Tag className="h-5 w-5" /> {property.price.toLocaleString('ar-EG')} ج.م</div>
            <div className="flex items-center gap-1"><Maximize className="h-5 w-5" /> {property.area} م²</div>
            <div className="flex items-center gap-1 text-gray-500"><Eye className="h-5 w-5" /> {property.views || 0} مشاهدة</div>
          </div>
          
          {property.phoneNumber && (
            <div className="mb-8">
              <a 
                href={`https://wa.me/${property.phoneNumber.startsWith('0') ? '+2' + property.phoneNumber : property.phoneNumber}?text=مرحباً، أنا مهتم بالعقار: ${property.title}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-sm"
              >
                <MessageCircle className="h-5 w-5" />
                تواصل مع المعلن عبر واتساب
              </a>
            </div>
          )}

          <div className="prose max-w-none text-gray-700">
            <h3 className="text-xl font-bold mb-2">وصف العقار</h3>
            <p className="whitespace-pre-wrap">{property.description}</p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">التقييمات والتعليقات</h2>
        
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">تقييمك</label>
              <div className="flex gap-1" dir="ltr">
                {[1, 2, 3, 4, 5].map(star => (
                  <button type="button" key={star} onClick={() => setRating(star)} className="focus:outline-none">
                    <Star className={`h-8 w-8 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <textarea 
                required rows={3} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="اكتب تعليقك هنا..."
                value={newComment} onChange={e => setNewComment(e.target.value)}
              />
            </div>
            <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-70">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              إضافة تعليق
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-blue-50 text-blue-800 rounded-xl">يرجى تسجيل الدخول لإضافة تعليق.</div>
        )}

        <div className="space-y-6">
          {comments.length > 0 ? comments.map(comment => (
            <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-8 w-8 text-gray-400" />
                  <div>
                    <div className="font-bold text-gray-900">{comment.userName}</div>
                    <div className="text-xs text-gray-500" dir="ltr">{new Date(comment.createdAt).toLocaleDateString('ar-EG')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex" dir="ltr">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`h-4 w-4 ${star <= comment.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {(role === 'admin' || (user && user.uid === comment.userId)) && (
                    <button onClick={() => handleDeleteComment(comment.id)} className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-gray-700 mt-2">{comment.text}</p>
            </div>
          )) : (
            <p className="text-gray-500 text-center py-4">لا توجد تعليقات بعد. كن أول من يعلق!</p>
          )}
        </div>
      </div>
    </div>
  );
}
