// lib/api/tricks-client.ts

// Client-side functions to interact with the API routes

export interface LikeResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
}

export interface LikeStatusResponse {
  success: boolean;
  liked: boolean;
  likeCount: number;
}

export interface BulkLikeStatusResponse {
  success: boolean;
  likeCount: number;
  likedByUser: Record<string, boolean>;
}

export interface ViewResponse {
  success: boolean;
  view_count: number;
}

/**
 * Increment view count for a trick
 */
export async function incrementTrickViews(
  trickId: string
): Promise<ViewResponse> {
  try {
    const response = await fetch(`/api/tricks/${trickId}/increment-views`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error incrementing trick views:", error);
    throw error;
  }
}

/**
 * Toggle like status for a trick
 */
export async function toggleTrickLike(
  trickId: string,
  userId: string
): Promise<LikeResponse> {
  try {
    const response = await fetch(`/api/tricks/${trickId}/toggle-like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error toggling trick like:", error);
    throw error;
  }
}

/**
 * Get like status for a trick (for a specific user)
 */
export async function getTrickLikeStatus(
  trickId: string,
  userId?: string
): Promise<LikeStatusResponse> {
  try {
    const url = new URL(
      `/api/tricks/${trickId}/like-status`,
      window.location.origin
    );
    if (userId) {
      url.searchParams.append("userId", userId);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting trick like status:", error);
    throw error;
  }
}

/**
 * Get like status for multiple users at once (useful for checking multiple user interactions)
 */
export async function getBulkTrickLikeStatus(
  trickId: string,
  userIds: string[]
): Promise<BulkLikeStatusResponse> {
  try {
    const response = await fetch(`/api/tricks/${trickId}/like-status`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting bulk trick like status:", error);
    throw error;
  }
}

// You'll need to import React hooks for the above hook
// import { useState, useEffect, useRef } from 'react';
