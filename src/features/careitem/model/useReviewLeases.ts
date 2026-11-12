import { useEffect, useRef, useState } from "react";
import {
  acquireEditLease,
  releaseEditLease,
  renewEditLease,
} from "../api/editLockApi";
import type { AcquiredLease } from "../api/editLockTypes";
export type LeaseTarget = { itemId: string; version: string };
type LeaseState = {
  key: string;
  leases: AcquiredLease[];
  error: unknown;
  ready: boolean;
};
export function useReviewLeases(
  space: string,
  targets: LeaseTarget[],
  enabled: boolean,
) {
  const key = JSON.stringify([space, targets, enabled]);
  const [state, setState] = useState<LeaseState>({
    key: "",
    leases: [],
    error: null,
    ready: false,
  });
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const leases: AcquiredLease[] = [];
    const previous = queue.current;
    const release = async () => {
      await Promise.allSettled(
        leases
          .splice(0)
          .map((lease) =>
            releaseEditLease(space, lease.itemId, lease.leaseToken),
          ),
      );
    };
    const publish = () =>
      active &&
      setState({ key, leases: [...leases], error: null, ready: true });
    const fail = (error: unknown) => {
      if (active) setState({ key, leases: [], error, ready: false });
    };
    const schedule = () => {
      if (!active || !leases.length) return;
      timer = setTimeout(
        () => void renew(),
        Math.max(
          1000,
          Math.min(...leases.map((l) => l.renewAfterSeconds)) * 1000,
        ),
      );
    };
    const renew = async () => {
      if (!active) return;
      if (document.visibilityState === "hidden") {
        schedule();
        return;
      }
      try {
        for (let i = 0; i < leases.length; i++) {
          const lease = leases[i];
          if (Date.parse(lease.expiresAt) <= Date.now())
            throw new Error(
              "편집 확인 시간이 만료됐어요. 최신 내용을 다시 확인해 주세요.",
            );
          const renewed = await renewEditLease(
            space,
            lease.itemId,
            lease.leaseToken,
          );
          if (!active) return;
          leases[i] = { ...renewed, leaseToken: lease.leaseToken };
        }
        publish();
        schedule();
      } catch (error) {
        fail(error);
        await release();
      }
    };
    const start = (async () => {
      await previous;
      if (!active) return;
      try {
        const targets: LeaseTarget[] = JSON.parse(key)[1];
        if (new Set(targets.map((t) => t.itemId)).size !== targets.length)
          throw new Error("같은 돌봄 항목의 제안은 하나씩 반영해 주세요.");
        for (const target of targets) {
          leases.push(
            await acquireEditLease(space, target.itemId, target.version),
          );
          if (!active) {
            await release();
            return;
          }
        }
        publish();
        schedule();
      } catch (error) {
        fail(error);
        await release();
      }
    })();
    queue.current = start;
    const visible = () => {
      if (
        document.visibilityState === "visible" &&
        leases.some((l) => Date.parse(l.expiresAt) <= Date.now())
      ) {
        if (timer) clearTimeout(timer);
        fail(
          new Error(
            "편집 확인 시간이 만료됐어요. 최신 내용을 다시 확인해 주세요.",
          ),
        );
        void release();
      }
    };
    document.addEventListener("visibilitychange", visible);
    return () => {
      active = false;
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", visible);
      queue.current = start.then(release);
    };
  }, [space, key, enabled]);
  return {
    ready: !targets.length || (state.key === key && state.ready),
    ensureCurrent: () => {
      if (!targets.length) return true;
      if (state.key !== key || !state.ready) return false;
      if (state.leases.every((l) => Date.parse(l.expiresAt) > Date.now()))
        return true;
      setState({
        ...state,
        ready: false,
        error: new Error(
          "편집 확인 시간이 만료됐어요. 최신 내용을 다시 확인해 주세요.",
        ),
      });
      return false;
    },
    error: state.key === key ? state.error : null,
    leases: state.key === key ? state.leases : [],
  };
}
