# تشغيل HireMail AI v2

## 1) المتطلبات
- Node.js 20.9+.
- PostgreSQL محلي أو قاعدة PostgreSQL سحابية.
- مشروع Google Cloud مع Gmail API وOAuth 2.0 Web Client.

## 2) البيئة
انسخ `.env.example` إلى `.env.local`.

ولإنشاء مفتاح تشفير قوي:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
ضع الناتج في `ENCRYPTION_KEY` ولا ترفعه إلى GitHub.

## 3) قاعدة البيانات
```bash
npm install
npm run db:migrate
```

## 4) Google OAuth
في Google Cloud:
1. فعّل Gmail API.
2. أنشئ OAuth Client من نوع Web application.
3. Local redirect URI: `http://localhost:3000/api/google/callback`
4. Production redirect URI: `https://YOUR-DOMAIN.vercel.app/api/google/callback`
5. ضع Client ID وClient Secret في متغيرات البيئة.

لا يحتاج أي مستخدم لإرسال كلمة مرور Gmail للموقع. كل مستخدم يضغط Connect Gmail ويوافق على صلاحية القراءة فقط.

## 5) التشغيل
```bash
npm run dev
```
افتح `http://localhost:3000`، أنشئ حسابًا، ادخل Settings، اربط Gmail، حدد المجالات، ثم اضغط مزامنة.

## 6) سيناريو اختبار
أرسل إلى Gmail المرتبط رسائل مثل:
- "اطلعنا على خبرتك في الموارد البشرية ونرغب بمناقشة فرصة Talent Acquisition." → Recruiter / HR
- "We would like to invite you to interview for a registered nurse role." → Interview / Healthcare
- "نحتاج فني صيانة معدات للعمل معنا" → Job / Maintenance
- "Your order has shipped" → Not relevant

## 7) Vercel
ارفع GitHub إلى Vercel وأضف متغيرات البيئة نفسها. غيّر `APP_URL` إلى رابط Vercel. أضف Redirect URI الإنتاجي في Google Cloud.

`vercel.json` يطلب مزامنة كل الحسابات المتصلة مرة يوميًا على Vercel Hobby بدون الحاجة لكرون مدفوع. المسار محمي بـ `CRON_SECRET`.

## ملاحظات أمنية
- لا تضع `.env.local` في GitHub.
- Gmail token مشفّر داخل PostgreSQL بـ AES-256-GCM.
- كل استعلام رسائل مربوط بـ `user_id` لمنع تسرب بيانات مستخدم إلى آخر.
- OAuth scope للقراءة فقط من Gmail.

## مهم عند تحويله إلى منتج عام
المشروع يستخدم `gmail.readonly` لأن تحليل محتوى الرسالة يحتاج قراءة جسم البريد. للاستخدام الشخصي/التطوير/الاختبار مع عدد محدود من المستخدمين يمكنك إبقاء Google OAuth في وضع Testing وإضافة Test Users. إذا أردت فتح التطبيق لأي مستخدم Google كمنتج عام، راجع متطلبات Google OAuth verification للـ sensitive/restricted scopes وسياسات Gmail قبل الإطلاق العام.
