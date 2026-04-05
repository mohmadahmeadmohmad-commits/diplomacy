import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, Mail, Phone, Shield, Heart, Building, ChevronRight, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { user, role, userData, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!user) {
    return <div className="text-center py-20 text-gray-500">يرجى تسجيل الدخول أولاً.</div>;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const roleLabel = role === 'admin' ? 'مدير النظام' : role === 'agent' ? 'وكيل عقاري' : role === 'owner' ? 'مالك عقار' : 'عميل';
  const roleColor = role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';

  return (
    <div className="max-w-lg mx-auto" dir="rtl">

      {/* بروفايل المستخدم */}
      <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm border border-gray-100 text-center">
        {user.photoURL ? (
          <img src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full mx-auto mb-3 border-4 border-blue-100" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mx-auto mb-3 flex items-center justify-center text-white font-bold text-3xl">
            {user.displayName?.charAt(0) || 'U'}
          </div>
        )}
        <h2 className="text-xl font-bold text-gray-900">{user.displayName || 'مستخدم'}</h2>
        <p className="text-gray-500 text-sm mt-1">{user.email}</p>
        <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full font-bold ${roleColor}`}>
          {roleLabel}
        </span>
      </div>

      {/* معلومات الحساب */}
      <div className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="font-bold text-gray-700 text-sm">معلومات الحساب</h3>
        </div>

        <div className="divide-y divide-gray-50">
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">الاسم</p>
              <p className="text-sm font-medium text-gray-800">{user.displayName || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
              <Mail className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">البريد الإلكتروني</p>
              <p className="text-sm font-medium text-gray-800">{user.email || '—'}</p>
            </div>
          </div>

          {userData?.phoneNumber && (
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <Phone className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">رقم الهاتف</p>
                <p className="text-sm font-medium text-gray-800">{userData.phoneNumber}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <Shield className="w-4 h-4 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">نوع الحساب</p>
              <p className="text-sm font-medium text-gray-800">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* روابط سريعة */}
      <div className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <h3 className="font-bold text-gray-700 text-sm">روابط سريعة</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Building className="w-4 h-4 text-blue-600" />
            </div>
            <span className="flex-1 text-right text-sm font-medium text-gray-800">عقاراتي</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <button onClick={() => navigate('/dashboard')} className="w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors">
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-500" />
            </div>
            <span className="flex-1 text-right text-sm font-medium text-gray-800">المفضلة</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* تسجيل الخروج */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {!showLogoutConfirm ? (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 transition-colors"
          >
            <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <span className="flex-1 text-right text-sm font-medium text-red-500">تسجيل الخروج</span>
            <ChevronRight className="w-4 h-4 text-red-300" />
          </button>
        ) : (
          <div className="p-4">
            <p className="text-center text-gray-700 font-medium mb-4">هل أنت متأكد من تسجيل الخروج؟</p>
            <div className="flex gap-3">
              <button onClick={handleLogout} className="flex-1 bg-red-500 text-white py-2.5 rounded-xl font-bold hover:bg-red-600 transition-colors">
                نعم، خروج
              </button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
