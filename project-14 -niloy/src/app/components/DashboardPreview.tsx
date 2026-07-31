import React, { useState } from "react";
import { Gauge } from "./Gauge";
import { TrendingDown, TrendingUp, ChevronDown, X } from "lucide-react";

export const DashboardPreview: React.FC = () => {
  // Toggle state for Card 1
  const [card1Active, setCard1Active] = useState<"impressions" | "clicks">("impressions");
  // Form state for Card 2
  const [monthTarget, setMonthTarget] = useState<number>(10);
  const [yearTarget, setYearTarget] = useState<number>(100);
  // Toggle state for Card 3
  const [card3Active, setCard3Active] = useState<"clicks" | "starts">("clicks");

  return (
    <div className="px-3 sm:px-4 w-full">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto shadow-inner border border-neutral-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-left">
          
          {/* Card 1 — Clicks */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-[#ef4d23]">Clicks</span>
                <span className="text-neutral-500 font-medium">This Month</span>
              </div>

              <div className="mt-3 flex items-baseline gap-2 flex-wrap">
                <span className="text-[28px] font-semibold text-neutral-900 leading-none">
                  6,896
                </span>
                <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
                  <TrendingDown className="w-3 h-3" />
                  -3,382 (33%)
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Compared to yesterday</p>

              <div className="mt-4 text-center">
                <span className="text-[12px] font-medium text-neutral-600">
                  Month Target achieved
                </span>
                <div className="mt-1">
                  <Gauge value={92} color="#ef4d23" showLabels min="389K" max="425K" />
                </div>
              </div>
            </div>

            <div className="mt-4 bg-neutral-100 rounded-full p-1 flex text-[12px] font-medium">
              <button
                onClick={() => setCard1Active("impressions")}
                className={`flex-1 py-1.5 rounded-full transition-all text-center ${
                  card1Active === "impressions"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Impressions
              </button>
              <button
                onClick={() => setCard1Active("clicks")}
                className={`flex-1 py-1.5 rounded-full transition-all text-center ${
                  card1Active === "clicks"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Clicks
              </button>
            </div>
          </div>

          {/* Card 2 — Form */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col gap-3 hover:shadow-md transition-shadow">
            {/* Dropdown 1 */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-neutral-700 font-medium">
                Show figures for
              </label>
              <button className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 font-medium">
                <span>This month</span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Dropdown 2 */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-neutral-700 font-medium">
                Compare period by
              </label>
              <button className="w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800 bg-neutral-50/50 hover:bg-neutral-50 font-medium">
                <span>Month-to-date (MTD)</span>
                <ChevronDown className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Input 1 */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-neutral-700 font-medium">
                Ste targets (This month)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">
                  #
                </span>
                <input
                  type="number"
                  value={monthTarget}
                  onChange={(e) => setMonthTarget(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg pl-7 pr-3 py-1.5 text-[13px] text-neutral-800 focus:outline-none focus:border-[#ef4d23]"
                />
              </div>
            </div>

            {/* Input 2 */}
            <div className="flex flex-col gap-1">
              <label className="text-[12px] text-neutral-700 font-medium">
                Ste targets (This year)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-[13px]">
                  #
                </span>
                <input
                  type="number"
                  value={yearTarget}
                  onChange={(e) => setYearTarget(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg pl-7 pr-3 py-1.5 text-[13px] text-neutral-800 focus:outline-none focus:border-[#ef4d23]"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="mt-auto pt-2 flex items-center gap-3 text-[13px]">
              <button className="bg-[#ef4d23] hover:bg-[#d93f17] text-white font-medium rounded-lg px-5 py-2 transition-colors">
                Save
              </button>
              <button className="text-neutral-600 hover:text-neutral-900 underline font-medium">
                Cancel
              </button>
              <button 
                aria-label="Close settings"
                className="ml-auto text-neutral-400 hover:text-neutral-700 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 3 — Video Starts */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-100 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="font-semibold text-[#ef4d23]">Video Starts</span>
                <span className="text-neutral-500 font-medium">today</span>
              </div>

              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-[28px] font-semibold text-neutral-900 leading-none">
                  0
                </span>
                <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5 text-[11px] font-medium">
                  <TrendingUp className="w-3 h-3 text-neutral-500" />
                  0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 mt-1">Compared to yesterday</p>

              <div className="mt-4 text-center">
                <Gauge value={68} color="#9ca3af" />
              </div>
            </div>

            <div className="mt-4 bg-neutral-100 rounded-full p-1 flex text-[12px] font-medium">
              <button
                onClick={() => setCard3Active("clicks")}
                className={`flex-1 py-1.5 rounded-full transition-all text-center ${
                  card3Active === "clicks"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Video Clicks
              </button>
              <button
                onClick={() => setCard3Active("starts")}
                className={`flex-1 py-1.5 rounded-full transition-all text-center ${
                  card3Active === "starts"
                    ? "bg-white text-neutral-900 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800"
                }`}
              >
                Video Starts
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
