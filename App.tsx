import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import AddPropertyPage from './pages/AddPropertyPage';
import AdminApprovalsPage from './pages/AdminApprovalsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import PropertyDetailsPage from './pages/PropertyDetailsPage';
import SettingsPage from './pages/SettingsPage';
import CompleteProfileModal from './components/CompleteProfileModal';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col" dir="rtl">
          <Navbar />
          <CompleteProfileModal />
          {/* pt-16 عشان محتوى الصفحة ميتغطاش بالـ Navbar العلوي */}
          <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-20 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/add-property" element={<AddPropertyPage />} />
              <Route path="/property/:id" element={<PropertyDetailsPage />} />
              <Route path="/admin" element={<AdminApprovalsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
