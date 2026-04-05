import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, PlusSquare, LogIn, ShieldCheck, Users, Building2, Settings } from 'lucide-react';
import LoginModal from './LoginModal';

export default function Navbar() {
  const { user, role } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16 gap-4">

            {/* اللوجو - شمال */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800 hidden sm:block">Diplomacy</span>
            </Link>

            {/* أزرار التنقل - المنتصف */}
            <div className="flex-1 flex items-center justify-center gap-1">
              <Link to="/" className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all ${isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}>
                <Home className="h-6 w-6" />
                <span className="text-xs font-medium hidden sm:block">الرئيسية</span>
              </Link>

              {user && (
                <Link to="/add-property" className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all ${isActive('/add-property') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}>
                  <PlusSquare className="h-6 w-6" />
                  <span className="text-xs font-medium hidden sm:block">أضف عقار</span>
                </Link>
              )}

              {role === 'admin' && (
                <>
                  <Link to="/admin" className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all ${isActive('/admin') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}>
                    <ShieldCheck className="h-6 w-6" />
                    <span className="text-xs font-medium hidden sm:block">المراجعات</span>
                  </Link>
                  <Link to="/admin/users" className={`flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-all ${isActive('/admin/users') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}>
                    <Users className="h-6 w-6" />
                    <span className="text-xs font-medium hidden sm:block">المستخدمين</span>
                  </Link>
                </>
              )}
            </div>

            {/* يمين - تسجيل دخول أو إعدادات */}
            <div className="flex-shrink-0">
              {user ? (
                <Link to="/settings" className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${isActive('/settings') ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}>
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border-2 border-blue-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <Settings className="h-4 w-4 hidden sm:block" />
                </Link>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  <LogIn className="h-5 w-5" />
                  <span className="hidden sm:block">دخول</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
