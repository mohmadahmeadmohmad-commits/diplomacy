import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Users, Loader2, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  const { user, role } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  if (!user || role !== 'admin') {
    return <div className="text-center py-20">غير مصرح لك بالوصول لهذه الصفحة.</div>;
  }

  const roleMap: Record<string, string> = {
    admin: 'مدير النظام',
    agent: 'وكيل عقاري',
    owner: 'مالك عقار',
    customer: 'عميل'
  };

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">المستخدمين المسجلين</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 text-sm">
                <tr>
                  <th className="p-4 font-semibold">الاسم</th>
                  <th className="p-4 font-semibold">البريد الإلكتروني</th>
                  <th className="p-4 font-semibold">تاريخ التسجيل</th>
                  <th className="p-4 font-semibold">الصلاحية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900">{u.name}</td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4 text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span dir="ltr">{new Date(u.createdAt).toLocaleDateString('ar-EG')}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                          u.role === 'customer' ? 'bg-gray-100 text-gray-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {roleMap[u.role] || u.role}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      لا يوجد مستخدمين مسجلين بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
