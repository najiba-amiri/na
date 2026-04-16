"use client";

import { FaBalanceScale, FaShieldAlt } from "react-icons/fa";

const PURCHASE_PROTECTION_CONDITIONS = [
  "عدم تحویل کالا در بازه زمانی توافق شده",
  "وجود نقص اساسی یا خرابی در کالا",
  "مغایرت عمده کالا با مشخصات درج شده در صفحه محصول یا پیش فاکتور تأییدشده",
];

const PURCHASE_PROTECTION_FLOW = [
  "خریدار موظف است حداکثر تا 24 ساعت پس از دریافت (یا موعد تحویل) درخواست خود را از طریق بخش «سفارشات من» ثبت نماید.",
  "مدارک و مستندات مرتبط (تصاویر، گزارش حمل، مکاتبات) باید به صورت کامل ارائه شود.",
  "تیم Globe Enter درخواست را بررسی کرده و نتیجه را حداکثر ظرف 24 ساعت کاری اعلام می کند.",
];

const RFQ_BUYER_RULES = [
  "درخواست ها باید شفاف، دقیق و مرتبط با حوزه فعالیت Globe Enter ثبت شوند.",
  "درخواست های تکراری یا نامرتبط مجاز نیست.",
  "درج اطلاعات گمراه کننده در RFQ ممنوع است.",
  "خریدار مسئول صحت اطلاعات ارائه شده در درخواست است.",
];

const RFQ_SELLER_RULES = [
  "پاسخ ها باید منطبق با درخواست خریدار و شامل اطلاعات واقعی و قابل استناد باشند.",
  "ارسال پیشنهادهای اسپم، اطلاعات نادرست یا تبلیغات نامرتبط ممنوع است.",
  "Globe Enter حق محدودسازی یا مسدودسازی فروشندگانی که قوانین RFQ را نقض کنند، برای خود محفوظ می دارد.",
];

const RESTRICTED_PRODUCTS = [
  "مواد مخدر، سلاح، مسکرات و مواد منفجره",
  "کالاهای تقلبی یا ناقض حقوق برندها",
  "محصولات حیات وحش غیرقانونی",
  "مواد کیمیاوی و اقلام خطرناک غیرمجاز",
];

const TERMS_USER_RESPONSIBILITIES = [
  "کاربران متعهد می شوند اطلاعات هویتی، تجاری و تماس خود را به صورت صحیح و به روز ثبت کنند.",
  "هرگونه فعالیت متقلبانه، سوءاستفاده از سیستم، یا نقض قوانین تجاری بین المللی ممنوع است.",
  "کاربران مسئول تمامی فعالیت هایی هستند که از طریق حساب کاربری آن ها انجام می شود.",
];

const TERMS_SUSPENSION_REASONS = [
  "نقض قوانین فهرست کردن محصولات",
  "نقض حقوق مالکیت فکری",
  "ارائه اطلاعات نادرست یا گمراه کننده",
  "فعالیت های مشکوک به کلاهبرداری یا پولشویی",
];

function PolicyCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8 shadow-sm">
      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {subtitle}
        </p>
      ) : null}
      <div className="mt-5 space-y-4 text-gray-700 dark:text-gray-300 leading-8">{children}</div>
    </section>
  );
}

export default function PolicyPage() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
    >
      <section className="relative overflow-hidden bg-gradient-to-bl from-[#b16926]/10 via-transparent to-[#f1a013]/10 dark:from-[#b16926]/5 dark:to-[#f1a013]/5 border-b border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-5xl px-6 py-14 md:py-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b16926]/30 bg-[#b16926]/10 px-4 py-1.5 text-sm font-semibold text-[#b16926] dark:text-[#d4923e]">
            <FaBalanceScale className="text-xs" />
            قوانین و سیاست های وبسایت Globe Enter
          </span>
          <h1 className="mt-5 text-3xl md:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
            شرایط، ضوابط و سیاست های استفاده
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400 leading-8">
            این صفحه چارچوب حقوقی و عملیاتی استفاده از خدمات Globe Enter را برای
            خریداران و فروشندگان مشخص می کند. استفاده از پلتفرم به منزله پذیرش
            کامل این سیاست ها است.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-10 md:py-14 space-y-6 md:space-y-8">
        <PolicyCard
          title="1) سیاست بازگشت وجه و تضمین خرید (Globe Enter Purchase Protection)"
          subtitle="به منظور افزایش امنیت و اعتماد در معاملات B2B، سرویس «تضمین خرید» برای کاربران فعال است."
        >
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">شرایط مشمول بازگشت وجه</h3>
            <ul className="list-disc pr-6 space-y-1">
              {PURCHASE_PROTECTION_CONDITIONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">فرآیند ثبت درخواست</h3>
            <ul className="list-disc pr-6 space-y-1">
              {PURCHASE_PROTECTION_FLOW.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">دامنه پوشش</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>
                این سیاست تنها شامل پرداخت های رسمی انجام شده از طریق درگاه های
                Globe Enter می شود.
              </li>
              <li>پرداخت های خارج از پلتفرم مشمول تضمین خرید نخواهند بود.</li>
            </ul>
          </div>
        </PolicyCard>

        <PolicyCard
          title="2) قوانین بخش درخواست قیمت (RFQ)"
          subtitle="بخش RFQ بستری برای ارتباط مستقیم خریداران و فروشندگان و دریافت پیشنهادهای رقابتی است."
        >
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">قوانین خریداران</h3>
            <ul className="list-disc pr-6 space-y-1">
              {RFQ_BUYER_RULES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">قوانین فروشندگان</h3>
            <ul className="list-disc pr-6 space-y-1">
              {RFQ_SELLER_RULES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">محدودیت ها</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>کاربران عادی دارای سهمیه مشخصی برای ثبت یا پاسخ به RFQ هستند.</li>
              <li>اعضای ویژه از دسترسی گسترده تر و امکانات بیشتر در بخش RFQ برخوردار خواهند بود.</li>
            </ul>
          </div>
        </PolicyCard>

        <PolicyCard
          title="3) سیاست عضویت (Membership Policy)"
          subtitle="Globe Enter یک سیستم عضویت چندلایه برای پاسخگویی به نیازهای مختلف کاربران ارائه می دهد."
        >
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">عضویت خریداران</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>ثبت نام برای خریداران رایگان است.</li>
              <li>خریداران به تمامی ابزارهای جستجو، RFQ و ارتباط با فروشندگان دسترسی خواهند داشت.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">عضویت فروشندگان</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>
                <span className="font-semibold">عضویت عادی (رایگان): </span>
                امکان ثبت تعداد محدودی محصول، RFQ و دسترسی پایه به پیام ها.
              </li>
              <li>
                <span className="font-semibold">عضویت ویژه (پولی): </span>
                تأیید هویت و کسب وکار توسط مرجع شخص ثالث، نمایش نشان «فروشنده تأییدشده»، امکان ثبت محصولات نامحدود، دسترسی گسترده تر به RFQ ها و ابزارهای تبلیغاتی.
              </li>
            </ul>
          </div>
        </PolicyCard>

        <PolicyCard title="4) سیاست فروش، مالیات و عوارض گمرکی">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">مسئولیت خریدار</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>
                خریدار مسئول پرداخت کلیه عوارض گمرکی، مالیات بر واردات، VAT و سایر
                هزینه های مرتبط با ترخیص کالا در کشور مقصد است.
              </li>
              <li>
                Globe Enter هیچ مسئولیتی در قبال هزینه های وارداتی خارج از پلتفرم
                ندارد.
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">مسئولیت فروشنده</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>فروشنده موظف است اسناد تجاری صحیح و کامل (مانند فاکتور تجاری و لیست بسته بندی) را ارائه دهد.</li>
              <li>هرگونه اطلاعات نادرست در اسناد می تواند منجر به تعلیق حساب فروشنده شود.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">معاملات داخلی</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>در صورت انجام معاملات داخلی، قوانین مالیاتی و VAT مطابق با قوانین کشور مربوطه اعمال خواهد شد.</li>
            </ul>
          </div>
        </PolicyCard>

        <PolicyCard title="5) سیاست فهرست کردن محصولات (Product Listing Policy)">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">محصولات ممنوعه</h3>
            <ul className="list-disc pr-6 space-y-1">
              {RESTRICTED_PRODUCTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">محصولات محدودشده</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>فهرست برخی کالاها (مانند تجهیزات طبی یا مواد کیمیایی خاص) تنها با ارائه مجوز معتبر قابل انجام است.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">حقوق مالکیت فکری (IPR)</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>فروشندگان موظف اند اطمینان حاصل کنند که محصولات آن ها ناقض حقوق مالکیت فکری اشخاص ثالث نیست.</li>
              <li>Globe Enter در صورت نقض IPR حق حذف محصول، تعلیق یا مسدودسازی حساب کاربری را دارد.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">کیفیت اطلاعات محصول</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>عنوان، توضیحات و تصاویر باید دقیق، شفاف و غیرگمراه کننده باشند.</li>
              <li>استفاده از تصاویر بی کیفیت، اطلاعات نادرست یا کلمات کلیدی فریبنده ممنوع است.</li>
            </ul>
          </div>
        </PolicyCard>

        <PolicyCard title="7) شرایط و ضوابط کلی استفاده از وبسایت (Terms & Conditions)">
          <p>
            استفاده از وبسایت و خدمات Globe Enter به معنای پذیرش کامل شرایط زیر
            است. کاربران موظف اند پیش از ثبت نام یا انجام هرگونه معامله، این
            شرایط را با دقت مطالعه کنند.
          </p>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">7.1 ماهیت پلتفرم</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>Globe Enter یک پلتفرم واسط B2B است و خود به عنوان خریدار یا فروشنده کالا عمل نمی کند.</li>
              <li>قرارداد خرید و فروش مستقیما بین خریدار و فروشنده منعقد می شود و Globe Enter تنها بستر ارتباطی و خدمات پشتیبان را فراهم می نماید.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">7.2 مسئولیت کاربران</h3>
            <ul className="list-disc pr-6 space-y-1">
              {TERMS_USER_RESPONSIBILITIES.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">7.3 محدودیت مسئولیت Globe Enter</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>Globe Enter مسئول کیفیت، ایمنی، قانونی بودن یا تحویل نهایی کالاها نیست، مگر در چارچوب صریح سیاست «تضمین خرید».</li>
              <li>هرگونه اختلاف تجاری خارج از سیاست های تعریف شده، در درجه اول باید بین خریدار و فروشنده حل و فصل شود.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">7.4 تعلیق و مسدودسازی حساب ها</h3>
            <ul className="list-disc pr-6 space-y-1">
              {TERMS_SUSPENSION_REASONS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">7.5 تغییرات در قوانین</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>Globe Enter می تواند در هر زمان قوانین و سیاست های خود را اصلاح یا به روزرسانی کند.</li>
              <li>ادامه استفاده از سایت پس از اعمال تغییرات، به منزله پذیرش نسخه جدید قوانین خواهد بود.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2">7.6 قانون حاکم و حل اختلاف</h3>
            <ul className="list-disc pr-6 space-y-1">
              <li>این شرایط تابع قوانین تجارت بین الملل و مقررات قابل اعمال بین المللی و داخلی Globe Enter است.</li>
              <li>در صورت بروز اختلاف، تلاش خواهد شد موضوع از طریق مذاکره و روش های حل اختلاف دوستانه حل شود.</li>
              <li>Globe Enter حق تعیین مرجع صالح برای رسیدگی به اختلافات را مطابق سیاست های داخلی خود محفوظ می دارد.</li>
            </ul>
          </div>
        </PolicyCard>

        <section className="rounded-2xl border border-[#b16926]/25 bg-gradient-to-r from-[#b16926]/10 to-[#f1a013]/10 dark:from-[#b16926]/20 dark:to-[#f1a013]/10 p-6 md:p-7 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-white/80 dark:bg-gray-900/70 text-[#b16926] dark:text-[#d4923e] mb-3">
            <FaShieldAlt />
          </div>
          <h2 className="text-xl font-extrabold mb-2">تعهد Globe Enter به اعتماد و شفافیت</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-8">
            هدف این سیاست ها ایجاد محیطی امن، حرفه ای و قابل اتکا برای تجارت B2B
            است. در صورت نیاز به راهنمایی بیشتر، از طریق بخش پشتیبانی با ما در
            تماس باشید.
          </p>
        </section>
      </div>
    </main>
  );
}
