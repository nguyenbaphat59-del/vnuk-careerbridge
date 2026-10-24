import { useCallback, useEffect, useState } from 'react';
import { api } from './lib/api';
import { useAuth } from './auth';

// Keep the last successful plan per account so moving between Overview and
// My Roadmap does not replace a full page with a loading screen on every click.
const planCache = new Map();

export function invalidatePlanCache(userId) {
  if (userId) planCache.delete(userId);
  else planCache.clear();
}

export function usePlan() {
  const { user } = useAuth();
  const userId = user?.id || null;
  const [plan, setPlan] = useState(() => userId ? planCache.get(userId) || null : null);
  const [loading, setLoading] = useState(() => !userId || !planCache.has(userId));
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    if (!userId) {
      setPlan(null);
      setLoading(false);
      return () => { active = false; };
    }

    const cached = planCache.get(userId);
    setPlan(cached || null);
    if (cached) {
      setLoading(false);
      return () => { active = false; };
    }

    setLoading(true);
    api('/plan')
      .then((nextPlan) => {
        if (!active) return;
        planCache.set(userId, nextPlan);
        setPlan(nextPlan);
      })
      .catch((err) => {
        if (active) setError(err.message || 'Could not load your roadmap.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return null;
    setError('');
    if (!planCache.has(userId)) setLoading(true);
    try {
      const nextPlan = await api('/plan');
      planCache.set(userId, nextPlan);
      setPlan(nextPlan);
      return nextPlan;
    } catch (err) {
      // A cached plan can still be shown if a background refresh fails.
      if (!planCache.has(userId)) setError(err.message || 'Could not load your roadmap.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return { plan, setPlan, loading, error, refresh };
}
