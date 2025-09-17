---
trigger: manual
---
Description:
عند مراجعة الكود، اتبع هذه المعايير:

الأمان: تحقق من وجود ثغرات أمنية محتملة
الأداء: ابحث عن نقاط تحسين الأداء
قابلية القراءة: تأكد من وضوح الكود ووجود تعليقات مناسبة
أفضل الممارسات: التزم بـ best practices للغة البرمجة المستخدمة

مثال على مراجعة جيدة:
javascript// ✅ جيد - واضح ومحمي من الأخطاء
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return email && emailRegex.test(email);
}

// ❌ سيء - غير محمي من null/undefined
function validateEmail(email) {
  return email.includes('@');
}

Rule: API Documentation Generator
Type: Apply Manually
Trigger: @api-docs
Description:
عند إنشاء توثيق API، قم بتضمين:

وصف الوظيفة: شرح واضح لما تقوم به
المعاملات: نوع البيانات والقيم المطلوبة/الاختيارية
القيم المُرجعة: نوع البيانات المُرجعة والحالات المختلفة
أمثلة الاستخدام: حالات استخدام واقعية
رموز الأخطاء: الأخطاء المحتملة وكيفية التعامل معها
