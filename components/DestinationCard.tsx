'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { Destination } from '@/types';
import { cn } from '@/lib/shared/utils';

interface DestinationCardProps {
  destination: Destination;
  className?: string;
}

export function DestinationCard({ destination, className }: DestinationCardProps) {
  const router = useRouter();

  const formatPoints = (points: number) => {
    return points.toLocaleString('en-US');
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US')}`;
  };

  const handleClick = () => {
    // Extract origin and destination from route (e.g., "YYZ → BCN")
    const [origin, dest] = destination.route.split(' → ').map(s => s.trim());

    // Navigate to search results with this destination pre-filled
    const queryParams = new URLSearchParams({
      from: origin,
      to: dest,
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      passengers: '1',
      cabin: 'economy',
      type: 'round-trip',
    });

    router.push(`/search?${queryParams.toString()}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group cursor-pointer overflow-hidden rounded-xl bg-white shadow-md transition-all hover:shadow-xl',
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />

        <Image
          src={destination.imageUrl}
          alt={`${destination.city}, ${destination.country}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Tags (Top Right) */}
        {destination.tags && destination.tags.length > 0 && (
          <div className="absolute top-3 right-3 z-20 flex flex-wrap gap-2">
            {destination.tags.map((tag, index) => (
              <span
                key={index}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-900"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* City/Country (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-20">
          <h3 className="text-2xl font-bold text-white">{destination.city}</h3>
          <p className="text-sm text-white/90">{destination.country}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 space-y-2">
        {/* Route */}
        <div className="text-sm text-gray-600">
          {destination.route}
        </div>

        {/* Points and Price */}
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-2xl font-bold text-orange-600">
              {formatPoints(destination.fromPoints)}
            </span>
            <span className="ml-1 text-sm text-gray-600">pts</span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 line-through">
              {formatPrice(destination.retailPrice)}
            </div>
          </div>
        </div>

        {/* Loyalty Program */}
        <div className="text-xs text-gray-500">
          via {destination.loyaltyProgram}
        </div>
      </div>
    </div>
  );
}
