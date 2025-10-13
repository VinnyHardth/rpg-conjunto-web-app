"use client";

import React from "react";

import type { Campaign } from "@/types/models";

interface CampaignCardProps {
  campaign: Campaign;
  isMaster?: boolean;
  onClick?: () => void;
}

const fallbackImage =
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80";

export default function CampaignCard({
  campaign,
  isMaster = false,
  onClick,
}: CampaignCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isMaster ? "border-yellow-400 bg-yellow-50" : "border-gray-200 bg-white"
      }`}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex h-full w-full flex-col text-left focus:outline-none"
      >
        <div className="h-40 w-full overflow-hidden bg-gray-200">
          <img
            src={campaign.imageUrl || fallbackImage}
            alt={campaign.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            loading="lazy"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">
            {campaign.name}
          </h3>
          {isMaster && (
            <span className="inline-flex items-center gap-1 text-sm font-medium text-yellow-700">
              <span className="text-base">⭐</span> Mestre da campanha
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
