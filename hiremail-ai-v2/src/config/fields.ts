export type FieldDefinition = { key: string; ar: string; en: string; examples: string[] };
export const FIELD_CATALOG: FieldDefinition[] = [
  { key:"TECHNOLOGY", ar:"التقنية والبرمجيات", en:"Technology & Software", examples:["software engineer backend frontend full stack developer programmer API cloud devops cybersecurity data database IT support network system administrator مهندس برمجيات مطور باك اند فرونت اند تقنية معلومات شبكات أمن سيبراني قواعد بيانات دعم فني"] },
  { key:"MARKETING", ar:"التسويق", en:"Marketing", examples:["marketing digital marketing social media campaign content SEO SEM brand performance growth تسويق رقمي حملات محتوى علامة تجارية سوشال ميديا"] },
  { key:"HUMAN_RESOURCES", ar:"الموارد البشرية", en:"Human Resources", examples:["human resources HR recruiter talent acquisition people operations compensation benefits training development موارد بشرية توظيف استقطاب مواهب شؤون موظفين"] },
  { key:"MAINTENANCE_ENGINEERING", ar:"الصيانة والهندسة", en:"Maintenance & Engineering", examples:["maintenance engineer technician mechanical electrical reliability facilities HVAC equipment preventive maintenance corrective maintenance صيانة مهندس فني ميكانيكا كهرباء معدات مرافق تكييف صيانة وقائية"] },
  { key:"HEALTHCARE", ar:"الطب والرعاية الصحية", en:"Healthcare & Medicine", examples:["doctor physician nurse pharmacist hospital clinic healthcare medical laboratory radiology dentist medicine طبيب تمريض صيدلي مستشفى عيادة مختبر أشعة أسنان رعاية صحية"] },
  { key:"HOSPITALITY_TOURISM", ar:"الضيافة والسياحة", en:"Hospitality & Tourism", examples:["hotel hospitality tourism guest relations front desk reservations concierge restaurant resort travel ضيافة فندق سياحة حجوزات استقبال نزلاء منتجع سفر"] },
  { key:"FINANCE_ACCOUNTING", ar:"المالية والمحاسبة", en:"Finance & Accounting", examples:["finance accountant accounting audit tax treasury analyst banking financial محاسب محاسبة مالية تدقيق ضرائب خزينة بنك محلل مالي"] },
  { key:"SALES_BUSINESS", ar:"المبيعات وتطوير الأعمال", en:"Sales & Business Development", examples:["sales account executive business development partnerships customer acquisition commercial مبيعات تطوير أعمال شراكات حسابات تجاري"] },
  { key:"OPERATIONS", ar:"العمليات والإدارة التشغيلية", en:"Operations", examples:["operations coordinator operations manager process service delivery workforce scheduling تشغيل عمليات تنسيق تشغيلي إدارة عمليات جداول قوى عاملة"] },
  { key:"SUPPLY_CHAIN", ar:"سلاسل الإمداد واللوجستيات", en:"Supply Chain & Logistics", examples:["supply chain logistics procurement warehouse inventory shipping purchasing مشتريات لوجستيات سلسلة إمداد مستودع مخزون شحن"] },
  { key:"EDUCATION", ar:"التعليم والتدريب", en:"Education & Training", examples:["teacher instructor lecturer trainer curriculum education school university معلم مدرس محاضر مدرب تعليم جامعة مدرسة مناهج"] },
  { key:"LEGAL", ar:"القانون والشؤون القانونية", en:"Legal", examples:["lawyer legal counsel compliance contracts paralegal law attorney محامي قانوني عقود امتثال شؤون قانونية"] },
  { key:"DESIGN_CREATIVE", ar:"التصميم والإبداع", en:"Design & Creative", examples:["graphic designer UX UI product design motion video creative illustrator مصمم جرافيك تجربة مستخدم واجهات مونتاج موشن إبداعي"] },
  { key:"CUSTOMER_SERVICE", ar:"خدمة العملاء", en:"Customer Service", examples:["customer service call center support representative customer success خدمة عملاء مركز اتصال ممثل خدمة نجاح العملاء"] },
  { key:"CONSTRUCTION", ar:"البناء والإنشاءات", en:"Construction", examples:["civil engineer construction site engineer quantity surveyor architecture project construction مهندس مدني إنشاءات موقع معماري كميات مشاريع"] },
  { key:"AVIATION", ar:"الطيران والمطارات", en:"Aviation", examples:["aviation airport airline aircraft ground operations cabin crew flight maintenance طيران مطار شركة طيران طائرات عمليات أرضية طاقم ضيافة جوية"] },
  { key:"ENERGY", ar:"الطاقة", en:"Energy", examples:["energy oil gas renewable solar hydrogen power utilities نفط غاز طاقة متجددة شمسية هيدروجين كهرباء مرافق"] },
  { key:"RESEARCH", ar:"البحث والتطوير", en:"Research & R&D", examples:["research researcher scientist laboratory R&D innovation clinical research باحث بحث علمي مختبر تطوير ابتكار أبحاث سريرية"] }
];
export const FIELD_KEYS = FIELD_CATALOG.map(x=>x.key);
export function fieldLabel(key:string, locale="ar") { const f=FIELD_CATALOG.find(x=>x.key===key); if (!f) return key==="GENERAL" ? (locale==="ar"?"عام":"General") : key; return locale==="ar"?f.ar:f.en; }
