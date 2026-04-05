import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import PropertyCard from '../components/PropertyCard';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminApprovalsPage() {
  const { user, role } = useAuth();
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'properties'),
        where('status', '==', 'pending')
      );
      const querySnapshot = await getDocs(q);
      const results = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPendingProperties(results);
    } catch (error) {
      console.error("Error fetching pending properties:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchPending();
    }
  }, [role]);

  const handleApprove = async (id: string) => {
    try {
      await updateDoc(doc(db, 'properties', id), { status: 'published' });
      setPendingProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error approving:", error);
      alert("حدث خطأ أثناء الموافقة.");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateDoc(doc(db, 'properties', id), { status: 'rejected' });
      setPendingProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error rejecting:", error);
      alert("حدث خطأ أثناء الرفض.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'properties', id));
      setPendingProperties(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  if (!user || role !== 'admin') {
    return <div className="text-center py-20">غير مصرح لك بالوصول لهذه الصفحة.</div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <ShieldAlert className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">المراجعات المعلقة</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : pendingProperties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {pendingProperties.map(property => (
            <PropertyCard 
              key={property.id} 
              property={property} 
              isAdminView={true}
              showDelete={true}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-500 text-lg">لا توجد عقارات بانتظار المراجعة حالياً.</p>
        </div>
      )}
    </div>
  );
}
