import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';
import { Phone, Loader2 } from 'lucide-react';

export default function CompleteProfileModal() {
  const { user, userData } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [skipped, setSkipped] = useState(() => sessionStorage.getItem('skipPhoneModal') === 'true');

  // Only show if user is logged in but has no phone number in their data
  if (!user || !userData || userData.phoneNumber || skipped) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);

    try {
      // 1. Update Firestore with the phone number
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { phoneNumber: phone });

      // 2. Send Email via EmailJS
      const serviceId = 'service_b0b7dlx'; 
      const templateId = 'template_2ajnuio';
      const publicKey = 'TmRDuSZn8ZR1qyz58';

      const templateParams = {
        user_name: userData.name || user.displayName || 'مستخدم جديد',
        user_email: userData.email || user.email || 'غير متوفر',
        user_phone: phone,
        to_email: 'mohmadahmeadmohmad@gmail.com' // Your admin email
      };

      try {
        // We only attempt to send if the keys are not the default placeholders
        if (serviceId !== 'YOUR_SERVICE_ID') {
          await emailjs.send(serviceId, templateId, templateParams, publicKey);
          console.log("Admin notification sent successfully!");
        } else {
          console.log("EmailJS is not configured yet. Skipping email notification.");
        }
      } catch (emailErr) {
        console.error("Failed to send email notification:", emailErr);
        // We don't block the user if the email fails to send
      }

    } catch (error) {
      console.error("Error updating profile:", error);
      alert("حدث خطأ أثناء حفظ رقم الهاتف.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-blue-100">
            <Phone className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">أهلاً بك في موقعنا! 🎉</h2>
          <p className="text-gray-600">لإكمال تسجيلك والتمتع بكافة الميزات، يرجى إدخال رقم هاتفك للتواصل.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف (يفضل واتساب)</label>
            <input
              type="tel"
              required
              dir="ltr"
              placeholder="مثال: 01012345678"
              className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-3">
            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-lg"
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'حفظ وإكمال التسجيل'}
            </button>
            <button
              type="button"
              onClick={() => {
                sessionStorage.setItem('skipPhoneModal', 'true');
                setSkipped(true);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center text-md"
            >
              تخطي حالياً
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
