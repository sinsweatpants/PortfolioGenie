# Contributing to PortfolioGenie

شكراً لاهتمامك بالمساهمة في PortfolioGenie! يرجى اتباع الإرشادات التالية:

## هيكل المشروع

```
PortfolioGenie/
├── apps/
│   ├── frontend/          # تطبيق React
│   └── backend/           # خادم Express
├── packages/
│   └── shared/            # أنواع البيانات المشتركة
├── config/                # ملفات التكوين
├── docs/                  # الوثائق
├── scripts/              # سكريبتات البناء والنشر
└── public/               # الملفات العامة
```

## إرشادات التطوير

1. **استخدم TypeScript** في جميع الملفات
2. **اتبع قواعد ESLint** الموضوعة
3. **اكتب تعليقات واضحة** باللغة العربية أو الإنجليزية
4. **اختبر التغييرات** قبل إرسال Pull Request

## أوامر التطوير

```bash
# تشغيل التطبيق في وضع التطوير
npm run dev

# بناء التطبيق للإنتاج
npm run build

# فحص الأخطاء
npm run lint

# تنسيق الكود
npm run format
```

## إرسال Pull Request

1. أنشئ فرعاً جديداً من `main`
2. أضف تغييراتك
3. تأكد من عدم وجود أخطاء
4. أرسل Pull Request مع وصف واضح