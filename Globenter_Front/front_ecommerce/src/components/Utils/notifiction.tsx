"use client";

import { FC, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingBag,
  FaHeart,
  FaTruck,
  FaEnvelope,
  FaTimes,
} from "react-icons/fa";

interface NotificationProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationItem {
  id: number;
  type: "order" | "wishlist" | "message";
  title: string;
  description: string;
  time: string;
}

// Sample notifications (replace with API data later)
const sampleNotifications: NotificationItem[] = [
  {
    id: 1,
    type: "order",
    title: "Order Confirmed",
    description: "Your order #12345 has been confirmed.",
    time: "2h ago",
  },
  {
    id: 3,
    type: "wishlist",
    title: "Wishlist Item Sale",
    description: "Q7 ANC Pods are now on sale!",
    time: "3d ago",
  },
  {
    id: 4,
    type: "message",
    title: "New Message",
    description: "You have received a new message from support.",
    time: "5d ago",
  },
];

const Notification: FC<NotificationProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const drawer = document.getElementById("notification-drawer");
      if (drawer && !drawer.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <FaShoppingBag className="text-[#f1a013] w-5 h-5" />;
      case "wishlist":
        return <FaHeart className="text-[#f1a013] w-5 h-5" />;
      case "shipping":
        return <FaTruck className="text-[#f1a013] w-5 h-5" />;
      case "message":
        return <FaEnvelope className="text-[#f1a013] w-5 h-5" />;
      default:
        return <FaEnvelope className="text-[#f1a013] w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="notification-drawer"
          className="fixed top-0 right-0 w-80 h-full bg-[#f7f7f7] shadow-2xl z-[99999] flex flex-col"
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 bg_color z-[99999]">
            <h2 className="text-lg font-semibold text-white">Notifications</h2>
            <button
              className="text-white hover:text-gray-200"
              onClick={onClose}
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto z-[99999]">
            {sampleNotifications.length === 0 ? (
              <p className="p-4 text-gray-600">
                You have no new notifications.
              </p>
            ) : (
              <ul>
                {sampleNotifications.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 p-4 border-b border-gray-300 hover:bg-[#f1a013]/10 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">
                        {item.title}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              className="w-full py-2 bg-[#f1a013] text-white font-medium rounded-lg hover:bg-[#e6c200] transition-colors"
              onClick={() => alert("Go to all notifications")}
            >
              View All
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
