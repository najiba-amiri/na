"use client";

import { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import Image from "next/image";

export default function Page() {
  const [messages, setMessages] = useState([
    { sender: "Mark", text: "Hi Arthur!", type: "incoming" },
    {
      sender: "Mark",
      text: "I need some help to choose the right size for this wing. Can you help me?",
      type: "incoming",
    },
    {
      sender: "You",
      text: "Hi Mark! 👋 Of course, I can help you! What are your weight and height?",
      type: "outgoing",
    },
    {
      sender: "Mark",
      text: "My height is 187 cm and my weight is 85 kg",
      type: "incoming",
    },
    {
      sender: "You",
      text: "Then the right size for you is 32! Let me know if you need more help...",
      type: "outgoing",
    },
  ]);

  return (
    <div className="flex flex-col md:grid md:grid-cols-12 gap-5 h-[78vh] bg-gray-100 p-4 md:p-10">
      
      {/* Left Column */}
      <div className="rounded-2xl bg-white border-r flex flex-col md:col-span-4 hidden md:flex">
        {/* Nav */}
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        {/* Users List */}
        <div className="flex flex-col divide-y">
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50">
            <Image
              src="/assets/images/products/shal_3.jpg"
              alt="User"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium">Mark Houston</span>
          </div>
          <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50">
            <Image
              src="/assets/images/background/profileback.svg"
              alt="User"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-medium">Jared Beck</span>
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="rounded-2xl flex flex-col bg-white md:col-span-8 w-full">
        {/* Chat Nav */}
        <div className="p-4 border-b flex items-center gap-3">
          <Image
            src="/assets/images/products/shal_3.jpg"
            alt="User"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold text-sm md:text-base">Mark Houston</h3>
            <span className="text-xs md:text-sm text-green-500">Active now</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-end gap-2 ${
                msg.type === "outgoing" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.type !== "outgoing" && (
                <Image
                  src="/assets/images/products/shal_3.jpg"
                  alt="User"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs md:text-sm ${
                  msg.type === "outgoing"
                    ? "bg-gradient-to-r from-orange-600 to-orange-400 text-white"
                    : "border border-gray-300 bg-white"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="rounded-b-2xl px-4 md:px-10 py-3 md:py-5 flex items-center gap-2 md:gap-3 bg-white">
          <input
            type="text"
            placeholder="Type message..."
            className="flex-1 bg-gray-100 rounded-full px-3 md:px-4 py-2 focus:outline-none focus:border-orange-400 text-sm"
          />
          <button className="bg-orange-500 text-white p-2 md:p-3 rounded-full hover:bg-orange-600 transition">
            <FaPaperPlane size={14} className="md:size-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
