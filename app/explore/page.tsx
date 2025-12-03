'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAvailableRoutes } from '@/lib/shared/api';
import { cn } from '@/lib/shared/utils';
import { usePointsManagement } from '@/lib/features/points/usePointsManagement';
import { useProgramsData } from '@/lib/features/programs/useProgramsData';
import { DEFAULT_USER_ID } from '@/lib/core/constants';

type ExploreRoute = {
  origin: string;
  destination: string;
  earliest_departure: string | null;
  count: number;
  region: string;
  minPointsByProgram: Record<number, number>;
};

export default function ExplorePage() {
  const [routes, setRoutes] = useState<ExploreRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocked, setShowLocked] = useState(false);
  const { userPoints } = usePointsManagement(DEFAULT_USER_ID);
  const { programs } = useProgramsData();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await getAvailableRoutes();
        setRoutes(data as ExploreRoute[]);
        setError(null);
      } catch (err) {
        console.error('Error loading routes', err);
        setError('Unable to load available routes right now.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const humanDate = (iso: string | null) => {
    if (!iso) return 'Date TBD';
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? 'Date TBD'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const regions = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 'Middle East', 'Unknown'];

  const grouped = useMemo(() => {
    return regions.map((region) => {
      const regionRoutes = routes.filter((r) => r.region === region);
      const available = regionRoutes.filter((r) =>
        Object.entries(r.minPointsByProgram || {}).some(
          ([pid, pts]) => (userPoints[Number(pid)] || 0) >= pts
        )
      );
      const locked = regionRoutes.filter(
        (r) =>
          !Object.entries(r.minPointsByProgram || {}).some(
            ([pid, pts]) => (userPoints[Number(pid)] || 0) >= pts
          )
      );
      return { region, available, locked };
    });
  }, [regions, routes, userPoints]);

  const renderCard = (route: ExploreRoute, locked: boolean) => {
    const queryParams = new URLSearchParams({
      from: route.origin,
      to: route.destination,
      date: route.earliest_departure ? route.earliest_departure.split('T')[0] : '',
      passengers: '1',
      cabin: 'economy',
      type: 'round-trip',
    });
    const bestProgram = Object.entries(route.minPointsByProgram || {}).sort((a, b) => a[1] - b[1])[0];
    const programMap = new Map(programs.map((p) => [p.id, p.name]));
    const bestLabel = bestProgram
      ? `${programMap.get(Number(bestProgram[0])) || `Program ${bestProgram[0]}`}: ${bestProgram[1].toLocaleString()} pts`
      : 'Points TBD';
    return (
      <Card
        key={`${route.origin}-${route.destination}-${locked ? 'locked' : 'open'}`}
        className={cn(
          'border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md',
          locked ? 'border-gray-200 opacity-70' : 'border-orange-100'
        )}
      >
        <CardHeader>
          <CardTitle className="text-lg">
            {route.origin} → {route.destination}
          </CardTitle>
          <CardDescription>
            Earliest departure: {humanDate(route.earliest_departure)} • {route.count} option
            {route.count === 1 ? '' : 's'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-xs text-gray-600">Best option: {bestLabel}</div>
          {locked ? (
            <span className="text-xs text-gray-500">Locked</span>
          ) : (
            <Link
              href={`/search?${queryParams.toString()}`}
              className="inline-flex items-center rounded-full bg-orange-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-700"
            >
              View flights
            </Link>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 to-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 text-sm text-red-700">{error}</CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading routes…</div>
        ) : routes.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            No routes found yet. Add itineraries in Supabase to see them here.
          </div>
        ) : (
          grouped.map(({ region, available, locked }) => {
            if (available.length === 0 && locked.length === 0) return null;
            return (
              <div key={region} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{region}</h2>
                  <div className="text-xs text-muted-foreground">
                    {available.length} available / {locked.length} locked
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {available.map((r) => renderCard(r, false))}
                </div>

                {locked.length > 0 && (
                  <Card className="border-dashed">
                    <CardHeader
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => setShowLocked((prev) => !prev)}
                    >
                      <div>
                        <CardTitle className="text-base">Locked routes</CardTitle>
                        <CardDescription>Routes you can’t book yet with current points</CardDescription>
                      </div>
                      <ChevronDown
                        className={cn('h-4 w-4 transition', showLocked ? 'rotate-180' : '')}
                      />
                    </CardHeader>
                    {showLocked && (
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {locked.map((r) => renderCard(r, true))}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
