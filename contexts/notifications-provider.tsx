"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { supabase } from "@/utils/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useUser } from "./user-provider";

export interface Notification {
  id: string;
  type: "referral_increase" | "referral_milestone" | "xp_gain" | "general";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};

// Storage key for persisting referral count
const REFERRAL_STORAGE_KEY = (userId: string) => `referrals_${userId}`;
const NOTIFICATIONS_STORAGE_KEY = (userId: string) => `notifications_${userId}`;

export const NotificationsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, authUser, isAuthenticated } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const previousReferralsRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);
  const lastActiveTimeRef = useRef<Date>(new Date());

  // Generate notification ID
  const generateId = () =>
    `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Load stored referral count from localStorage (for your actual implementation)
  const loadStoredReferralCount = (userId: string): number | null => {
    // In your actual app, uncomment this:
    // try {
    //   const stored = localStorage.getItem(REFERRAL_STORAGE_KEY(userId));
    //   return stored ? parseInt(stored, 10) : null;
    // } catch (error) {
    //   console.error("Error loading stored referral count:", error);
    //   return null;
    // }

    // For the artifact environment, we'll use in-memory storage
    return previousReferralsRef.current;
  };

  // Store referral count in localStorage (for your actual implementation)
  const storeReferralCount = (userId: string, count: number) => {
    // In your actual app, uncomment this:
    // try {
    //   localStorage.setItem(REFERRAL_STORAGE_KEY(userId), count.toString());
    // } catch (error) {
    //   console.error("Error storing referral count:", error);
    // }

    // For the artifact environment, we'll use in-memory storage
    previousReferralsRef.current = count;
  };

  // Load stored notifications from localStorage
  const loadStoredNotifications = (userId: string): Notification[] => {
    // In your actual app, uncomment this:
    // try {
    //   const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY(userId));
    //   if (stored) {
    //     const parsed = JSON.parse(stored);
    //     // Convert timestamp strings back to Date objects
    //     return parsed.map((n: any) => ({
    //       ...n,
    //       timestamp: new Date(n.timestamp)
    //     }));
    //   }
    // } catch (error) {
    //   console.error("Error loading stored notifications:", error);
    // }
    return [];
  };

  // Store notifications in localStorage
  const storeNotifications = (userId: string, notifs: Notification[]) => {
    // In your actual app, uncomment this:
    // try {
    //   // Keep only last 50 notifications
    //   const toStore = notifs.slice(0, 50);
    //   localStorage.setItem(NOTIFICATIONS_STORAGE_KEY(userId), JSON.stringify(toStore));
    // } catch (error) {
    //   console.error("Error storing notifications:", error);
    // }
  };

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
      const newNotification: Notification = {
        ...notification,
        id: generateId(),
        timestamp: new Date(),
        read: false,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        // Store notifications if user is authenticated
        if (authUser) {
          storeNotifications(authUser.id, updated);
        }
        return updated;
      });
    },
    [authUser]
  );

  // Mark notification as read
  const markAsRead = useCallback(
    (id: string) => {
      setNotifications((prev) => {
        const updated = prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        );
        if (authUser) {
          storeNotifications(authUser.id, updated);
        }
        return updated;
      });
    },
    [authUser]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const updated = prev.map((notification) => ({
        ...notification,
        read: true,
      }));
      if (authUser) {
        storeNotifications(authUser.id, updated);
      }
      return updated;
    });
  }, [authUser]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    if (authUser) {
      // In your actual app, uncomment this:
      // localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY(authUser.id));
    }
  }, [authUser]);

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Handle referral changes
  const handleReferralChange = useCallback(
    (newReferrals: number, oldReferrals: number | null) => {
      // Don't notify if this is the initial load or if oldReferrals is null
      if (oldReferrals === null || !hasInitializedRef.current) {
        return;
      }

      const increase = newReferrals - oldReferrals;
      if (increase > 0) {
        addNotification({
          type: "referral_increase",
          title: "New Referral!",
          message: `You gained ${increase} referral${
            increase > 1 ? "s" : ""
          }! Total: ${newReferrals}`,
          data: { increase, total: newReferrals },
        });

        // Check for milestones
        const milestones = [5, 10, 25, 50, 100, 250, 500, 1000];
        const reachedMilestone = milestones.find(
          (milestone) => oldReferrals < milestone && newReferrals >= milestone
        );

        if (reachedMilestone) {
          addNotification({
            type: "referral_milestone",
            title: "Milestone Achieved! 🎉",
            message: `Congratulations! You've reached ${reachedMilestone} referrals!`,
            data: { milestone: reachedMilestone },
          });
        }
      }
    },
    [addNotification]
  );

  // Check for referral changes that happened while user was away
  const checkForMissedReferralChanges = useCallback(async () => {
    if (!authUser || !user) return;

    try {
      // Fetch the latest user data from the database
      const { data: latestUserData, error } = await supabase
        .from("users")
        .select("referrals")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.error("Error fetching latest user data:", error);
        return;
      }

      if (latestUserData && typeof latestUserData.referrals === "number") {
        const currentReferrals = latestUserData.referrals;
        const storedReferrals = previousReferralsRef.current;

        if (storedReferrals !== null && currentReferrals !== storedReferrals) {
          handleReferralChange(currentReferrals, storedReferrals);
          previousReferralsRef.current = currentReferrals;
          storeReferralCount(authUser.id, currentReferrals);
        }
      }
    } catch (error) {
      console.error("Error checking for missed referral changes:", error);
    }
  }, [authUser, user, handleReferralChange]);

  // Initialize user data and set up realtime subscription
  useEffect(() => {
    if (!isAuthenticated() || !authUser) {
      // Clean up existing subscription if user logs out
      if (channel) {
        channel.unsubscribe();
        setChannel(null);
      }
      setNotifications([]);
      previousReferralsRef.current = null;
      hasInitializedRef.current = false;
      return;
    }

    // Load stored notifications
    const storedNotifications = loadStoredNotifications(authUser.id);
    if (storedNotifications.length > 0) {
      setNotifications(storedNotifications);
    }

    // Initialize referral tracking
    if (user && !hasInitializedRef.current) {
      // Try to load the stored referral count first
      const storedReferrals = loadStoredReferralCount(authUser.id);

      if (storedReferrals !== null && storedReferrals !== user.referrals) {
        // If stored value exists and is different from current, check for changes
        handleReferralChange(user.referrals || 0, storedReferrals);
      }

      // Update the stored value with current
      previousReferralsRef.current = user.referrals || 0;
      storeReferralCount(authUser.id, user.referrals || 0);
      hasInitializedRef.current = true;
    }

    // Create realtime channel for the specific user
    const realtimeChannel = supabase
      .channel(`user-${authUser.id}-notifications`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "users",
          filter: `id=eq.${authUser.id}`,
        },
        (payload) => {
          console.log("User data updated via realtime:", payload);

          const newData = payload.new;

          // Handle referral changes
          if (
            typeof newData.referrals === "number" &&
            previousReferralsRef.current !== null &&
            newData.referrals !== previousReferralsRef.current
          ) {
            handleReferralChange(
              newData.referrals,
              previousReferralsRef.current
            );
            previousReferralsRef.current = newData.referrals;
            storeReferralCount(authUser.id, newData.referrals);
          }
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);

        if (status === "SUBSCRIBED") {
          console.log("Successfully subscribed to user updates");
        } else if (status === "CHANNEL_ERROR") {
          console.error("Error subscribing to realtime channel");
        }
      });

    setChannel(realtimeChannel);

    // Cleanup function
    return () => {
      console.log("Unsubscribing from realtime channel");
      realtimeChannel.unsubscribe();
    };
  }, [authUser, isAuthenticated, user, handleReferralChange, addNotification]);

  // Update stored referral count when user data changes
  useEffect(() => {
    if (user && authUser && hasInitializedRef.current) {
      if (
        user.referrals !== undefined &&
        user.referrals !== previousReferralsRef.current
      ) {
        // This handles cases where the user data is updated through other means
        // (e.g., a manual refresh) rather than realtime
        if (previousReferralsRef.current !== null) {
          handleReferralChange(user.referrals, previousReferralsRef.current);
        }
        previousReferralsRef.current = user.referrals;
        storeReferralCount(authUser.id, user.referrals);
      }
    }
  }, [user?.referrals, authUser, handleReferralChange]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
