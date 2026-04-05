import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const { loginWithGoogle, loginWithFacebook, loginWithTwitter } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Reset error when modal opens/closes
  useEffect(() => {
    if (isOpen) setErrorMsg('');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (providerFn: () => Promise<void>) => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setErrorMsg('');
    try {
      await providerFn();
      onClose();
    } catch (error: any) {
      console.error("Login error caught in modal:", error);
      if (error.code === 'auth/popup-blocked') {
        setErrorMsg("تم حظر النافذة المنبثقة. يرجى السماح بها أو فتح الموقع في متصفح Chrome/Safari.");
      } else if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        setErrorMsg("تم إغلاق نافذة التسجيل قبل الاكتمال. يرجى المحاولة مرة أخرى.");
      } else if (error.code === 'auth/unauthorized-domain') {
        setErrorMsg("هذا النطاق غير مصرح له بتسجيل الدخول. يرجى مراجعة إعدادات Firebase.");
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMsg("طريقة تسجيل الدخول هذه غير مفعلة حالياً.");
      } else {
        setErrorMsg("حدث خطأ أثناء تسجيل الدخول: " + (error.message || "حاول مرة أخرى."));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleTelegram = () => {
    setErrorMsg("تسجيل الدخول عبر تليجرام يتطلب إعداد خادم خلفي (Backend) مخصص لإنشاء رموز مصادقة (Custom Tokens).");
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-white rounded-2xl p-6 w-full max-w-md relative shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors">
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">تسجيل الدخول</h2>
        <p className="text-center text-gray-500 mb-4 text-sm">اختر طريقة تسجيل الدخول المفضلة لديك</p>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 leading-relaxed">{errorMsg}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <button 
            onClick={() => handleLogin(loginWithGoogle)} 
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5" alt="Google" />}
            المتابعة باستخدام جوجل
          </button>
          
          <button 
            onClick={() => handleLogin(loginWithFacebook)} 
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#166FE5] transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="h-5 w-5" alt="Facebook" />}
            المتابعة باستخدام فيسبوك
          </button>
          
          <button 
            onClick={() => handleLogin(loginWithTwitter)} 
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-[#1DA1F2] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#1A91DA] transition-colors shadow-sm disabled:opacity-70"
          >
            {isLoggingIn ? <Loader2 className="h-5 w-5 animate-spin" /> : <img src="https://www.svgrepo.com/show/513008/twitter-154.svg" className="h-5 w-5" alt="Twitter" />}
            المتابعة باستخدام تويتر (X)
          </button>
          
          <button 
            onClick={handleTelegram} 
            disabled={isLoggingIn}
            className="w-full flex items-center justify-center gap-3 bg-[#26A5E4] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#2294CD] transition-colors shadow-sm disabled:opacity-70"
          >
            <img src="https://www.svgrepo.com/show/354443/telegram.svg" className="h-5 w-5" alt="Telegram" />
            المتابعة باستخدام تليجرام
          </button>
        </div>
        
        <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800 text-center leading-relaxed">
            <strong>ملاحظة للمدير:</strong> لتفعيل فيسبوك وتويتر، يجب إضافة مفاتيح الـ API الخاصة بهم في لوحة تحكم Firebase (قسم Authentication).
          </p>
        </div>
      </div>
    </div>
  );
}
