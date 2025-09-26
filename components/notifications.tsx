"use client";

import type React from "react";
import { useState } from "react";
import { Bell, X, Check, CheckCheck, Star } from "lucide-react";
import { useNotifications } from "@/contexts/notifications-provider";

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={toggleNotifications}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-xs font-semibold text-white bg-red-500 rounded-full min-w-[18px] h-[18px] leading-none shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
            </h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

interface NotificationItemProps {
  notification: any;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "referral_increase":
        return <Star className="h-5 w-5 text-green-500" />;
      case "referral_milestone":
        return <span className="text-lg">🎉</span>;
      case "xp_gain":
        return <span className="text-lg">⭐</span>;
      default:
        return <span className="text-lg">📢</span>;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "referral_increase":
        return "bg-green-50 border-l-4 border-l-green-400";
      case "referral_milestone":
        return "bg-purple-50 border-l-4 border-l-purple-400";
      case "xp_gain":
        return "bg-yellow-50 border-l-4 border-l-yellow-400";
      default:
        return "bg-blue-50 border-l-4 border-l-blue-400";
    }
  };

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div
      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
        !notification.read ? "bg-blue-25" : ""
      }`}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
    >
      <div
        className={`rounded-lg p-3 ${getNotificationColor(notification.type)}`}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 flex items-center justify-center">
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {notification.title}
              </h4>
              {!notification.read && (
                <div className="flex-shrink-0 ml-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-1">{notification.message}</p>
            <p className="text-xs text-gray-400">
              {formatTime(notification.timestamp)}
            </p>
          </div>
          {!notification.read && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              title="Mark as read"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
