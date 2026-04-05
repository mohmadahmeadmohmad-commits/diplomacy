import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upload, Loader2, ImagePlus, X } from 'lucide-react';

const locationData: Record<string, string[]> = {
  "القاهرة": ["التجمع الخامس", "مدينة نصر", "المعادي", "الشروق", "الرحاب", "مدينتي", "مصر الجديدة", "حلوان", "الزيتون"],
  "الجيزة": ["الشيخ زايد", "أكتوبر", "الدقي", "الهرم", "المهندسين", "إمبابة", "فيصل", "بولاق الدكرور"],
  "الإسكندرية": ["سموحة", "المنتزة", "ستانلي", "سيدي بشر", "ميامي", "العجمي", "برج العرب", "الرمل"],
  "الشرقية": ["الزقازيق", "العاشر من رمضان", "بلبيس", "منيا القمح", "أبو حماد", "ههيا"],
  "الغربية": ["طنطا", "المحلة الكبرى", "كفر الزيات", "زفتى", "سمنود"],
  "المنوفية": ["شبين الكوم", "مينوف", "أشمون", "السادات", "قويسنا"],
  "البحيرة": ["دمنهور", "كفر الدوار", "رشيد", "إيتاى البارود", "أبو المطامير"],
  "الدقهلية": ["المنصورة", "طلخا", "ميت غمر", "أجا", "دكرنس"],
  "أسيوط": ["أسيوط", "ديروط", "منفلوط", "أبو تيج", "القوصية"],
  "سوهاج": ["سوهاج", "أخميم", "طهطا", "جرجا", "البلينا"],
  "الأقصر": ["الأقصر", "الكرنك", "إسنا", "أرمنت"],
  "أسوان": ["أسوان", "كوم أمبو", "إدفو", "نصر النوبة"],
  "بورسعيد": ["بورسعيد", "بورفؤاد"],
  "الإسماعيلية": ["الإسماعيلية", "القنطرة", "أبو صوير"],
  "السويس": ["السويس", "عتاقة", "الجناين"],
  "الفيوم": ["الفيوم", "سنورس", "طامية", "يوسف الصديق"],
  "بني سويف": ["بني سويف", "الواسطى", "ناصر", "إهناسيا"],
  "المنيا": ["المنيا", "ملوي", "سمالوط", "أبو قرقاص"],
  "قنا": ["قنا", "نجع حمادي", "دشنا", "قفط"],
  "مطروح": ["مرسى مطروح", "الضبعة", "العلمين", "سيوة"],
  "شمال سيناء": ["العريش", "رفح", "الشيخ زويد", "بئر العبد"],
  "جنوب سيناء": ["شرم الشيخ", "طابا", "دهب", "نويبع"],
  "البحر الأحمر": ["الغردقة", "سفاجا", "القصير", "مرسى علم"],
  "الوادي الجديد": ["الخارجة", "الداخلة", "الفرافرة", "بريس"],
};

export default function AddPropertyPage() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'apartment',
    listingType: 'sale',
    price: '',
    area: '',
    governorate: '',
    city: '',
    neighborhood: '',
    phoneNumber: ''
  });

  if (!user) {
    return <div className="text-center py-20">يرجى تسجيل الدخول للوصول لهذه الصفحة.</div>;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const newPreviewUrls: string[] = [];

      for (const file of selectedFiles) {
        const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        const maxLabel = file.type.startsWith('video/') ? '50MB' : '10MB';
        if (file.size > maxSize) {
          alert(`حجم الملف "${file.name}" كبير جداً. الحد الأقصى هو ${maxLabel}.`);
          continue;
        }
        validFiles.push(file);
        newPreviewUrls.push(URL.createObjectURL(file));
      }

      setFiles(prev => [...prev, ...validFiles]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  // ✅ رفع الصور على Firebase Storage فقط - بدون Base64 نهائياً
  const uploadFileToStorage = async (file: File, index: number, total: number): Promise<string> => {
    setUploadProgress(`جاري رفع الملف ${index + 1} من ${total}...`);
    const ext = file.name.split('.').pop() || (file.type.startsWith('video/') ? 'mp4' : 'jpg');
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const fileRef = ref(storage, `properties/${user.uid}/${fileName}`);
    await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(fileRef);
    return downloadURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploadProgress('');

    try {
      // ✅ رفع الصور على Storage والحصول على URLs فقط
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadFileToStorage(files[i], i, files.length);
        uploadedUrls.push(url);
      }

      setUploadProgress('جاري حفظ بيانات العقار...');

      // ✅ الـ document في Firestore يحتوي على URLs فقط - مش Base64
      const propertyData = {
        ownerId: user.uid,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        listingType: formData.listingType,
        price: Number(formData.price),
        area: Number(formData.area),
        location: {
          governorate: formData.governorate,
          city: formData.city,
          neighborhood: formData.neighborhood || '',
          lat: 0,
          lng: 0
        },
        phoneNumber: formData.phoneNumber,
        images: uploadedUrls,
        coverImage: uploadedUrls[0] || '',
        views: 0,
        status: role === 'admin' ? 'published' : 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'properties'), propertyData);
      setUploadProgress('');
      alert('✅ تم إضافة العقار بنجاح! ' + (role !== 'admin' ? 'في انتظار مراجعة الإدارة.' : ''));
      navigate('/dashboard');

    } catch (error: any) {
      console.error("Error adding property:", error);
      setUploadProgress('');
      if (error.code === 'storage/unauthorized') {
        alert('❌ غير مصرح برفع الملفات. تأكد من تفعيل Firebase Storage وضبط الصلاحيات.');
      } else if (error.code === 'storage/canceled') {
        alert('❌ تم إلغاء الرفع.');
      } else {
        alert('❌ حدث خطأ: ' + (error.message || 'خطأ غير معروف'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">إضافة عقار جديد</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإعلان</label>
          <input
            required type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            placeholder="مثال: شقة فاخرة للبيع في التجمع الخامس"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع العقار</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
              <option value="apartment">شقة</option>
              <option value="villa">فيلا</option>
              <option value="commercial">تجاري / مول</option>
              <option value="land">أرض</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع العرض</label>
            <select className="w-full p-3 border border-gray-300 rounded-lg" value={formData.listingType} onChange={e => setFormData({ ...formData, listingType: e.target.value })}>
              <option value="sale">للبيع</option>
              <option value="rent">للإيجار</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السعر (جنيه مصري)</label>
            <input required type="number" min="0" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المساحة (متر مربع)</label>
            <input required type="number" min="1" className="w-full p-3 border border-gray-300 rounded-lg" value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة</label>
            <select required className="w-full p-3 border border-gray-300 rounded-lg" value={formData.governorate} onChange={e => setFormData({ ...formData, governorate: e.target.value, city: '' })}>
              <option value="">اختر المحافظة</option>
              {Object.keys(locationData).map(gov => <option key={gov} value={gov}>{gov}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المدينة/المنطقة</label>
            <select required disabled={!formData.governorate} className="w-full p-3 border border-gray-300 rounded-lg disabled:bg-gray-100" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}>
              <option value="">اختر المدينة</option>
              {formData.governorate && locationData[formData.governorate].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف للتواصل (واتساب)</label>
          <input required type="tel" dir="ltr" className="w-full p-3 border border-gray-300 rounded-lg text-right" placeholder="مثال: 01012345678" value={formData.phoneNumber} onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            صور وفيديوهات العقار
            <span className="text-xs text-gray-400 mr-2">(صور: حد أقصى 10MB | فيديو: 50MB)</span>
          </label>

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group">
                  {files[index]?.type.startsWith('video/') ? (
                    <video src={url} className="w-full h-full object-cover" muted loop autoPlay playsInline />
                  ) : (
                    <img src={url} className="w-full h-full object-cover" alt={`Preview ${index}`} />
                  )}
                  {index === 0 && <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">غلاف</span>}
                  <button type="button" onClick={() => removeFile(index)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <ImagePlus className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 font-semibold">اضغط لرفع صور أو فيديوهات</p>
            <p className="text-xs text-gray-500">PNG, JPG, MP4</p>
            <input id="dropzone-file" type="file" className="hidden" accept="image/*,video/*" multiple onChange={handleFileChange} />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">وصف العقار</label>
          <textarea required rows={4} className="w-full p-3 border border-gray-300 rounded-lg" placeholder="اكتب تفاصيل إضافية عن العقار..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
        </div>

        {uploadProgress && (
          <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{uploadProgress}</span>
          </div>
        )}

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70">
          {loading ? <><Loader2 className="h-5 w-5 animate-spin" /><span>جاري الرفع...</span></> : <><Upload className="h-5 w-5" /><span>{role === 'admin' ? 'نشر العقار مباشرة' : 'إرسال للمراجعة'}</span></>}
        </button>
      </form>
    </div>
  );
}
