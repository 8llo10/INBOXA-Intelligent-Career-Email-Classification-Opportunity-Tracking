# AI smoke-test cases

After setup, POST these examples to `/api/analyze` while logged in, or send them to the connected Gmail and run Sync.

1. `شفنا خبرتك في صيانة المعدات ونحتاج نتواصل معك بخصوص فرصة مع فريقنا.` → relevant, Maintenance/Engineering.
2. `We would like to invite you to interview for a registered nurse position.` → relevant, Interview, Healthcare.
3. `اطلعنا على خبرتك في التسويق الرقمي ونرغب بالتعاون معك في حملة مدفوعة.` → relevant, Marketing, professional/freelance collaboration.
4. `Your application is still under review. We will contact you about next steps.` → relevant, Application Update, may be GENERAL if field not stated.
5. `After consideration we have decided to proceed with other candidates.` → relevant, Rejection, may be GENERAL if field not stated.
6. `Your verification code is 483921.` → not relevant.
7. `تم شحن طلبك وسيصل غدا.` → not relevant.
8. `We need a backend developer to help integrate our internal APIs for a short paid project.` → relevant, Technology, Freelance/Technical Collaboration.
9. `نبحث عن أخصائي موارد بشرية لإدارة الاستقطاب والمقابلات.` → relevant, Human Resources.
10. `Front desk guest relations opportunity at our hotel.` → relevant, Hospitality & Tourism.

The classifier is intentionally local and deterministic. Accuracy improves as users correct false positives/negatives using the feedback form; those corrections are added to that user's future training set.
