"use client";

import Image from "next/image";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTag,
  FaPaperPlane,
  FaHeadset,
} from "react-icons/fa";

export default function SupportPage() {
  return (
    <div className="flex w-full py-5 px-4 sm:px-10 items-center justify-center bg-gray-50 dark:bg-gray-950 transition-colors">
      {/* Outer Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-900 mt-2 rounded-3xl shadow-xl dark:shadow-gray-950/50 overflow-hidden w-full p-4 sm:p-5">
        {/* Right Column (Form) */}
        <div className="flex flex-col justify-center p-4 sm:p-10 order-1 md:order-2">
          {/* Header: Title + Description + Support Icon */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 text-[#b16926]">
                Support Center
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-0 text-sm max-w-xs">
                Have questions or need help? Please fill out the form below.
              </p>
            </div>
            <FaHeadset className="text-[#b16926] w-10 h-10 sm:w-16 sm:h-16 flex-shrink-0" />
          </div>

          {/* Form with responsive rows */}
          <form className="space-y-6">
            {/* Row 1: Full Name + Email */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col flex-1">
                <label
                  className="text-sm mb-1 font-semibold dark:text-gray-200"
                  htmlFor="fullname"
                >
                  Full Name <span className="text-[#b16926]">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    id="fullname"
                    type="text"
                    placeholder="Full Name"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-sm mb-1 font-semibold dark:text-gray-200" htmlFor="email">
                  Email <span className="text-[#b16926]">*</span>
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    required
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone + Subject */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col flex-1">
                <label className="text-sm mb-1 font-semibold dark:text-gray-200" htmlFor="phone">
                  Phone
                </label>
                <div className="relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    id="phone"
                    type="tel"
                    placeholder="Phone number"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <label className="text-sm mb-1 font-semibold dark:text-gray-200" htmlFor="subject">
                  Subject
                </label>
                <div className="relative">
                  <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    id="subject"
                    type="text"
                    placeholder="Subject"
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                  />
                </div>
              </div>
            </div>

            {/* Row 3: Message (full width) */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 font-semibold dark:text-gray-200" htmlFor="message">
                Message <span className="text-[#b16926]">*</span>
              </label>
              <textarea
                id="message"
                rows={5}
                placeholder="Write your message here..."
                required
                className="w-full p-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-orange-600"
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-start">
              <button
                type="submit"
                className="bg-[#b16926] hover:bg-orange-700 text-white px-6 py-3 rounded-lg shadow-md flex items-center gap-2"
              >
                Send Message <FaPaperPlane />
              </button>
            </div>
          </form>
        </div>

        {/* Left Column (Image) */}
        <div className="flex items-center justify-center order-2 md:order-1 mt-6 md:mt-0">
          <div className="rounded-2xl relative bg-center text-white flex flex-col justify-evenly">
            <Image
              src="/assets/images/background/supportbg.svg"
              alt="Support Illustration"
              width={400}
              height={400}
              className="hidden md:block object-contain"
              priority
            />

            {/* Mobile image */}
            <Image
              src="/assets/images/background/supportbg.svg"
              alt="Support Illustration"
              width={250}
              height={250}
              className="block md:hidden object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
