'use client';

import React from 'react';
import { Plane } from 'lucide-react';
import type { FlightResult } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/shared/utils';

interface FlightResultCardProps {
  flight: FlightResult;
  className?: string;
}

export function FlightResultCard({ flight, className }: FlightResultCardProps) {
  const formatTime = (time: string) => {
    // Remove the +1 suffix if present for display
    return time.replace(/\+\d+$/, '');
  };

  const formatPoints = (points: number) => {
    return points.toLocaleString('en-US');
  };

  const formatPrice = (price: number) => {
    return `$${price.toLocaleString('en-US')}`;
  };

  const getStopsText = (stops: number) => {
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 stop';
    return `${stops} stops`;
  };

  const firstSegment = flight.segments[0];
  const lastSegment = flight.segments[flight.segments.length - 1];

  return (
    <div
      className={cn(
        'group cursor-pointer rounded-xl border-2 border-orange-100 bg-white p-6 transition-all hover:border-orange-300 hover:shadow-md',
        className
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left Section: Flight Details */}
        <div className="flex-1 space-y-3">
          {/* Airline */}
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
              <Plane className="h-4 w-4 text-gray-600" />
            </div>
            <span className="font-medium">{firstSegment.airline}</span>
            {flight.isGreatDeal && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                Great deal
              </Badge>
            )}
          </div>

          {/* Times and Duration */}
          <div className="flex items-center space-x-4">
            <div>
              <div className="text-2xl font-bold">{formatTime(firstSegment.departureTime)}</div>
              <div className="text-sm text-gray-600">{firstSegment.origin}</div>
            </div>

            <div className="flex flex-1 flex-col items-center">
              <div className="text-sm text-gray-500">{flight.totalDuration}</div>
              <div className="my-1 h-px w-full bg-gray-300"></div>
              <div className="text-xs text-gray-500">{getStopsText(flight.stops)}</div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">{formatTime(lastSegment.arrivalTime)}</div>
              <div className="text-sm text-gray-600">{lastSegment.destination}</div>
            </div>
          </div>

          {/* Special Offer */}
          {flight.specialOffer && (
            <div className="text-sm text-orange-600">
              {flight.specialOffer}
            </div>
          )}

          {/* Segments Details (if multiple) */}
          {flight.segments.length > 1 && (
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer hover:text-gray-900">
                View {flight.segments.length} segments
              </summary>
              <div className="mt-2 space-y-2 pl-4">
                {flight.segments.map((segment, index) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-3">
                    <div className="font-medium">
                      {segment.airline} {segment.flightNumber}
                    </div>
                    <div className="text-xs">
                      {segment.origin} → {segment.destination} • {segment.duration}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(segment.departureTime)} - {formatTime(segment.arrivalTime)}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>

        {/* Right Section: Pricing */}
        <div className="flex flex-col items-end space-y-2 border-t pt-4 md:border-t-0 md:border-l md:pl-6 md:pt-0">
          {/* Points Cost */}
          <div className="text-right">
            <div className="text-3xl font-bold text-orange-600">
              {formatPoints(flight.pointsCost)}
            </div>
            <div className="text-sm text-gray-600">points</div>
          </div>

          {/* Retail Price */}
          <div className="text-sm text-gray-500 line-through">
            {formatPrice(flight.retailPrice)}
          </div>

          {/* Loyalty Program */}
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500">via</div>
            <div className="text-sm font-medium">{flight.loyaltyProgram}</div>
          </div>

          {/* Availability Badge */}
          <div className="mt-2">
            <Badge
              variant={flight.availability === 'high' ? 'default' : 'secondary'}
              className={cn(
                flight.availability === 'high' && 'bg-green-100 text-green-700',
                flight.availability === 'medium' && 'bg-yellow-100 text-yellow-700',
                flight.availability === 'low' && 'bg-red-100 text-red-700'
              )}
            >
              {flight.availability === 'high' && 'Available'}
              {flight.availability === 'medium' && 'Limited'}
              {flight.availability === 'low' && 'Low availability'}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
