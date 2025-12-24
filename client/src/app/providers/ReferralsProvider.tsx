/**
 * @file client/src/app/providers/ReferralsProvider.tsx
 * @description Global referrals state provider - fetches and caches referral data
 *
 * @responsibility
 *   - Owns: Referrals state, API data fetching, derived metrics computation
 *   - Does NOT own: UI rendering, domain logic implementation, auth state
 *
 * @dependencies @/features/referrals/domain
 * @lastReviewed 2024-12-24
 */

import { createContext, useContext, useState, useMemo, ReactNode, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { useAuth } from "@/app/providers/AuthProvider";
import { getDerivedMetrics } from "@/features/referrals/domain/deriveMetrics";
import { ReferralEvent, ReferralState, ReconciledMap } from "@/features/referrals/domain/models";

// Re-export types for convenience
export type { ReferralEvent, ReferralState };

// Infer metrics type from the function
type DerivedMetrics = ReturnType<typeof getDerivedMetrics>;

interface ReferralsContextType {
    referralsMap: ReconciledMap;
    referrals: ReferralState[];
    metrics: DerivedMetrics;
    isLoading: boolean;
    refresh: () => Promise<void>;
}

const ReferralsContext = createContext<ReferralsContextType | undefined>(undefined);

export function ReferralsProvider({ children }: { children: ReactNode }) {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [referrals, setReferrals] = useState<ReferralState[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        if (!isAuthenticated) {
            setReferrals([]);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const data = await apiClient<{ referrals: ReferralState[] }>("/referrals");
            setReferrals(data.referrals);
        } catch (error) {
            console.error("Failed to fetch referrals:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Re-fetch when auth state changes
    useEffect(() => {
        if (!authLoading) {
            fetchData();
        }
    }, [isAuthenticated, authLoading]);

    const { map, metrics } = useMemo(() => {
        const referralMap: ReconciledMap = {};
        referrals.forEach(r => {
            referralMap[r.referral_id] = r;
        });

        const derivedMetrics = getDerivedMetrics(referralMap);

        return {
            map: referralMap,
            metrics: derivedMetrics,
        };
    }, [referrals]);

    const sortedList = useMemo(() => {
        return [...referrals].sort((a, b) => {
            return a.referral_id.localeCompare(b.referral_id, undefined, { numeric: true });
        });
    }, [referrals]);

    return (
        <ReferralsContext.Provider
            value={{
                referralsMap: map,
                referrals: sortedList,
                metrics,
                isLoading,
                refresh: fetchData,
            }}
        >
            {children}
        </ReferralsContext.Provider>
    );
}

export function useReferrals() {
    const context = useContext(ReferralsContext);
    if (context === undefined) {
        throw new Error("useReferrals must be used within a ReferralsProvider");
    }
    return context;
}
