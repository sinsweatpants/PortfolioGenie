---
trigger: always_on
alwaysApply: true
---

Description:
التزم بمعايير الكود التالية في جميع الملفات:
JavaScript/TypeScript:

استخدم const و let بدلاً من var
استخدم arrow functions للدوال القصيرة
استخدم template literals بدلاً من concatenation
أضف semicolons في نهاية الجمل
استخدم camelCase للمتغيرات والدوال
استخدم PascalCase للكلاسات والمكونات

مثال:
javascript// ✅ جيد
const getUserName = (user) => {
  return `Welcome, ${user.firstName} ${user.lastName}!`;
};

// ❌ سيء
var getUserName = function(user) {
  return 'Welcome, ' + user.firstName + ' ' + user.lastName + '!'
}

Rule: Comment Standards
Type: Always Apply
Description:
معايير التعليقات:

اكتب التعليقات بالعربية للشرح العام
استخدم الإنجليزية للتعليقات التقنية المعيارية
اشرح "لماذا" وليس "ماذا" - الكود يوضح ماذا يحدث
استخدم JSDoc للدوال العامة

javascript/**
 * حساب الضريبة المضافة للمنتج
 * @param {number} price - السعر الأساسي
 * @param {number} taxRate - معدل الضريبة (مثال: 0.15 للـ 15%)
 * @returns {number} المبلغ الإجمالي شامل الضريبة
 */
function calculateTotalPrice(price, taxRate) {
  // نتحقق من صحة المعاملات أولاً لتجنب الأخطاء
  if (!price || price < 0 || !taxRate || taxRate < 0) {
    throw new Error('Invalid input parameters');
  }
  
  return price * (1 + taxRate);
}

