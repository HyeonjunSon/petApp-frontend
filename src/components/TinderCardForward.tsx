"use client";
import React, { forwardRef } from "react";
import TinderCard from "react-tinder-card";

/** 스와이프 방향 타입 */
export type SwipeDirection = "left" | "right" | "up" | "down";

/** ref에서 사용할 수 있는 메서드 타입 */
export type TinderCardRef = {
  swipe: (dir: SwipeDirection) => Promise<void>;
  restoreCard?: () => Promise<void>;
};

/** 최소 프로프 타입 (라이브러리가 공식 타입을 안 내보냄) */
export type TinderCardProps = {
  onSwipe?: (dir: SwipeDirection) => void;
  onCardLeftScreen?: (identifier?: any) => void;
  preventSwipe?: SwipeDirection[];
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
};

const TinderCardForward = forwardRef<TinderCardRef, TinderCardProps>((props, ref) => {
  return <TinderCard ref={ref as any} {...props} />;
});

TinderCardForward.displayName = "TinderCardForward";
export default TinderCardForward;
