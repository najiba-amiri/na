"use client";

import {
  FaBullseye,
  FaEye,
  FaGlobeAsia,
  FaUsers,
  FaLightbulb,
  FaHandshake,
  FaCalendarAlt,
} from "react-icons/fa";

const SECTIONS = [
  {
    icon: FaBullseye,
    title: "مأموریت GlobEnter",
    body: "فراهم سازی یک بستر امن و حرفه‌ای برای خرید و فروش مستقیم میان تولیدکننده‌گان و فروشنده‌گان بدون واسطه غیر ضروری، با هدف ارتقای کیفیت محصولات و کاهش هزینه‌های تجاری.",
  },
  {
    icon: FaEye,
    title: "چشم‌انداز GlobEnter",
    body: "تبدیل شدن به موفق‌ترین و قابل‌اعتمادترین پلتفرم تجارت آنلاین B2B در افغانستان. بستری که تجارت را ساده، شفاف و هوشمند می‌سازد.",
  },
  {
    icon: FaGlobeAsia,
    title: "تأثیر جهانی",
    body: "شرکت‌های تولیدکننده‌ای که می‌خواهند فروشات در افغانستان داشته باشند می‌توانند وارد سایت شوند و فروشات داشته باشند. همچنین تولیدات افغانستان در آینده به خریدارهای خارجی معرفی می‌شود تا تولیدکننده‌های افغانستان هم بصورت مستقیم با خریدارهای خارجی معامله داشته باشند.",
  },
  {
    icon: FaHandshake,
    title: "بازار هدف GlobEnter",
    body: "تولیدکننده‌های محلی و خارجی که بتوانند محصولاتشان را بصورت مستقیم به فروشگاه‌ها، فروشنده‌ها و عمده‌فروشان بفروشند.",
  },
];

const TEAM = [
  { name: "نجیبه امیری", role: "بنیان‌گذار و رهبر تیم" },
  { name: "حیدر رضایی", role: "هم‌بنیان‌گذار و طراح وب" },
  { name: "پیمان محمدی", role: "عضو تیم توسعه" },
];

export default function AboutPage() {
  return (
    <main
      dir="rtl"
      className="bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 transition-colors min-h-screen"
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-[#b16926]/10 via-transparent to-[#f1a013]/10 dark:from-[#b16926]/5 dark:to-[#f1a013]/5">
        <div className="mx-auto max-w-4xl px-6 py-20 md:py-28 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#b16926]/30 bg-[#b16926]/10 px-4 py-1.5 text-sm font-semibold text-[#b16926] dark:text-[#d4923e] mb-6">
            <FaCalendarAlt className="text-xs" />
            تأسیس ۲۰۲۵
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
            تاریخچه{" "}
            <span className="text-[#b16926] dark:text-[#d4923e]">
              GlobEnter
            </span>
          </h1>
          <p className="mt-6 text-base md:text-lg leading-8 text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            گلوب اینتر در سال ۲۰۲۵ توسط نجیبه امیری با همکاری آقای حیدر رضایی
            — که در ابتدا استاد برنامه‌نویسی ایشان بود — راه‌اندازی شد. پس از
            آشنایی با بخش طراحی وب‌سایت و به دلیل مشکلات واردات کالا توسط
            واسطه‌ها به افغانستان، تصمیم گرفتند سایتی راه‌اندازی کنند تا واردات
            بصورت مستقیم از طریق پلتفرم به بازار ارائه شود.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-4xl px-6 py-14 md:py-20">
        <div className="rounded-2xl border border-[#b16926]/20 dark:border-[#b16926]/30 bg-gradient-to-br from-[#b16926]/5 to-[#f1a013]/5 dark:from-[#b16926]/10 dark:to-[#f1a013]/10 p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4">
            <FaLightbulb className="text-[#b16926] dark:text-[#d4923e] text-xl" />
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
              فلسفه نام GlobEnter
            </h2>
          </div>
          <p className="leading-8 text-gray-700 dark:text-gray-300">
            «وارد شدن به جهان» — هسته‌ی معنای نام GlobEnter است. افغانستان به
            دلیل تحریم‌ها نمی‌توانست بصورت مستقیم به بازارهای جهانی وارد شود و
            با شرکت‌های بین‌المللی قراردادهای تجاری داشته باشد. تاجران فقط از
            طریق پلتفرم علی‌بابا خرید می‌کردند. اما به دلیل سنتی بودن بازار
            افغانستان، بیشتر مردم به دلیل نبود دفاتر پاسخگو در کشور اعتماد
            نداشتند. مجبور بودند به چین بروند و هزینه‌های سنگینی متحمل شوند — یا
            جنس‌شان به فروش می‌رسید یا در فروشگاه انبار می‌شد. این وضعیت به نفع
            فروشنده‌ها نبود و GlobEnter برای حل این مشکل پا به عرصه گذاشت.
          </p>
        </div>
      </section>

      {/* Key Sections Grid */}
      <section className="mx-auto max-w-5xl px-6 pb-14 md:pb-20">
        <h2 className="text-2xl md:text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-10">
          نقاط کلیدی
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <div
              key={s.title}
              className="group rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#b16926]/10 text-[#b16926] dark:text-[#d4923e] group-hover:bg-[#b16926] group-hover:text-white transition-colors">
                <s.icon className="text-lg" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                {s.title}
              </h3>
              <p className="text-sm leading-7 text-gray-600 dark:text-gray-400">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-4xl px-6 py-14 md:py-20 text-center">
          <div className="inline-flex items-center gap-2 text-[#b16926] dark:text-[#d4923e] mb-3">
            <FaUsers className="text-lg" />
            <span className="text-sm font-semibold tracking-wide">
              تیم سه‌نفره — ۲۰۲۵
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white mb-10">
            بنیان‌گذاران
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {TEAM.map((m) => (
              <div
                key={m.name}
                className="w-56 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-6 text-center"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#b16926]/10 text-[#b16926] dark:text-[#d4923e]">
                  <FaUsers className="text-2xl" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-gray-100">
                  {m.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {m.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
