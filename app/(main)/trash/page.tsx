"use client";

import { SegmentedControl, SegmentedControlItem } from "@/components/ui/segmented-control";

export default function Trash() {
  return (
    <>
      <div className="dark:bg-gray-900 w-full h-full">
        <section className="flex justify-center items-center">
          <SegmentedControl defaultValue="option1" className="w-fit my-4">
            <SegmentedControlItem value="option1">全部</SegmentedControlItem>
            <SegmentedControlItem value="option2">我的小说</SegmentedControlItem>
            <SegmentedControlItem value="option3">收藏</SegmentedControlItem>
          </SegmentedControl>
        </section>
      </div>
    </>
  );
}
