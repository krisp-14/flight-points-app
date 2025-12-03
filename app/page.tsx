'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SearchForm } from '@/components/SearchForm';
import { PointsBalance } from '@/components/PointsBalance';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { mockUser } from '@/data/mockData';
import { usePointsManagement } from '@/lib/features/points/usePointsManagement';
import { useProgramsData } from '@/lib/features/programs/useProgramsData';
import { DEFAULT_USER_ID } from '@/lib/core/constants';

export default function HomePage() {
  // Points management
  const { userPoints, updateUserPoints, pointsError } = usePointsManagement(DEFAULT_USER_ID);
  const { programs } = useProgramsData();
  const [recentSearches, setRecentSearches] = useState<Array<{
    id: string;
    origin: string;
    destination: string;
    date: string;
    timestamp: string;
    resultCount: number;
  }>>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentExploreSearches');
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(searches);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  const formatSearchDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Where will your points take you next, {mockUser.name.split(' ')[0]}?
          </h1>
          <p className="text-gray-600">
            Search award flights and maximize your points across all your loyalty programs
          </p>
        </div>

        {/* Search Form */}
        <div className="mb-16 flex justify-center">
          <SearchForm simplified={true} />
        </div>

        {/* Points Balance */}
        {programs.length > 0 && (
          <div className="mb-12">
            <PointsBalance
              programs={programs}
              userPoints={userPoints}
              onChange={updateUserPoints}
              error={pointsError || undefined}
            />
          </div>
        )}

        {/* Recent Searches */}
        {recentSearches.length > 0 && (
          <div className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle>Recent searches</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentSearches.map((search) => {
                    const queryParams = new URLSearchParams({
                      from: search.origin,
                      to: search.destination,
                      date: search.date,
                      passengers: '1',
                      cabin: 'economy',
                      type: 'round-trip',
                    });
                    return (
                      <Link
                        key={search.id}
                        href={`/search?${queryParams.toString()}`}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium">
                            {search.origin} → {search.destination}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatSearchDate(search.date)} • {search.resultCount} {search.resultCount === 1 ? 'option' : 'options'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          View flights
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
