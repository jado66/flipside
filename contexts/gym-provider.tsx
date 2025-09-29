"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Member,
  ClassItem,
  EquipmentItem,
  IncidentItem,
  WaiverItem,
  StaffMemberItem,
  PaymentItem,
  DemoLimits,
  OperationResult,
} from "@/types/gym-management";
import {
  initGymDB,
  getAll,
  putItem,
  deleteItem,
  getOrInitMeta,
  updateMeta,
  STORE,
  clearAllData,
} from "@/contexts/gym-db";
import { ALL_SEEDS } from "@/contexts/gym-seed";
import { bulkPut } from "@/contexts/gym-db";

// Demo limits (default)
const DEMO_LIMITS: DemoLimits = {
  classes: 1,
  members: 3,
  equipment: 3,
  incidents: 5,
  waivers: 5,
  staff: 3,
  payments: 10,
};

interface GymContextValue {
  loading: boolean;
  demoMode: boolean;
  toggleDemoMode: () => Promise<void>;
  limits: DemoLimits;
  // Collections (filtered to exclude archived for staff & waivers by default)
  members: Member[];
  classes: ClassItem[];
  equipment: EquipmentItem[];
  incidents: IncidentItem[];
  waivers: WaiverItem[]; // active (non-archived) only
  staff: StaffMemberItem[]; // active (non-archived) only
  payments: PaymentItem[];
  // CRUD helpers (auto-enforce limits in demo mode)
  addMember: (
    m: Omit<Member, "id" | "joinDate" | "lastVisit">
  ) => Promise<OperationResult<Member>>;
  addClass: (c: Omit<ClassItem, "id">) => Promise<OperationResult<ClassItem>>;
  addEquipment: (
    e: Omit<EquipmentItem, "id">
  ) => Promise<OperationResult<EquipmentItem>>;
  addIncident: (
    i: Omit<IncidentItem, "id" | "status">
  ) => Promise<OperationResult<IncidentItem>>;
  addWaiver: (
    w: Omit<WaiverItem, "id" | "status">
  ) => Promise<OperationResult<WaiverItem>>;
  addStaff: (
    s: Omit<StaffMemberItem, "id" | "classes">
  ) => Promise<OperationResult<StaffMemberItem>>;
  addPayment: (
    p: Omit<PaymentItem, "id">
  ) => Promise<OperationResult<PaymentItem>>;
  updateMember: (
    id: string,
    partial: Partial<Member>
  ) => Promise<OperationResult<Member>>;
  updateClass: (
    id: string,
    partial: Partial<ClassItem>
  ) => Promise<OperationResult<ClassItem>>;
  updateEquipment: (
    id: string,
    partial: Partial<EquipmentItem>
  ) => Promise<OperationResult<EquipmentItem>>;
  updateIncident: (
    id: string,
    partial: Partial<IncidentItem>
  ) => Promise<OperationResult<IncidentItem>>;
  updateWaiver: (
    id: string,
    partial: Partial<WaiverItem>
  ) => Promise<OperationResult<WaiverItem>>;
  updateStaff: (
    id: string,
    partial: Partial<StaffMemberItem>
  ) => Promise<OperationResult<StaffMemberItem>>;
  updatePayment: (
    id: string,
    partial: Partial<PaymentItem>
  ) => Promise<OperationResult<PaymentItem>>;
  removeMember: (id: string) => Promise<void>;
  removeClass: (id: string) => Promise<void>;
  removeEquipment: (id: string) => Promise<void>;
  removeIncident: (id: string) => Promise<void>;
  removeWaiver: (id: string) => Promise<void>; // archives instead of hard delete
  removeStaff: (id: string) => Promise<void>; // archives instead of hard delete
  removePayment: (id: string) => Promise<void>;
  // Archive controls
  archiveStaff: (id: string) => Promise<OperationResult<StaffMemberItem>>;
  archiveWaiver: (id: string) => Promise<OperationResult<WaiverItem>>;
  unarchiveStaff: (id: string) => Promise<OperationResult<StaffMemberItem>>;
  unarchiveWaiver: (id: string) => Promise<OperationResult<WaiverItem>>;
  // Hard reset (purge) everything except meta/demo flag
  purgeAllGymData: () => Promise<void>;
  // Reset DB contents to the bundled seed/demo data (for debugging)
  resetToSeed: () => Promise<void>;
}

const GymContext = createContext<GymContextValue | undefined>(undefined);

function useEnforceLimit<T>(
  demoMode: boolean,
  current: T[],
  limit: number,
  label: string
): string | null {
  if (!demoMode) return null;
  if (current.length >= limit) {
    return `Demo limit reached: ${label} limit is ${limit}. Upgrade to add more.`;
  }
  return null;
}

export const GymProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);
  const [waivers, setWaivers] = useState<WaiverItem[]>([]);
  const [staff, setStaff] = useState<StaffMemberItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initGymDB();
        const meta = await getOrInitMeta();
        if (cancelled) return;
        setDemoMode(false); //meta.demoMode);
        const [m, c, e, i, w, s, p] = await Promise.all([
          getAll<Member>(STORE.members),
          getAll<ClassItem>(STORE.classes),
          getAll<EquipmentItem>(STORE.equipment),
          getAll<IncidentItem>(STORE.incidents),
          getAll<WaiverItem>(STORE.waivers),
          getAll<StaffMemberItem>(STORE.staff),
          getAll<PaymentItem>(STORE.payments),
        ]);
        if (cancelled) return;
        setMembers(m);
        setClasses(c);
        setEquipment(e);
        setIncidents(i);
        setWaivers(w);
        setStaff(s);
        setPayments(p);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDemoMode = useCallback(async () => {
    const updated = await updateMeta({ demoMode: !demoMode });
    setDemoMode(updated.demoMode);
  }, [demoMode]);

  // Generic add factory
  const createAdd = useCallback(
    <T extends { id: string }>(
      state: T[],
      setState: React.Dispatch<React.SetStateAction<T[]>>,
      store: string,
      limitKey: keyof DemoLimits,
      label: string,
      transform: (partial: any) => T
    ) => {
      return async (partial: any): Promise<OperationResult<T>> => {
        const limit = DEMO_LIMITS[limitKey];
        // For waiver & staff, exclude archived items from limit enforcement
        const effectiveLength =
          limitKey === "staff" || limitKey === "waivers"
            ? (state as any[]).filter((i: any) => !i.archived).length
            : state.length;
        const limitError =
          demoMode && effectiveLength >= limit
            ? `Demo limit reached: ${label} limit is ${limit}. Upgrade to add more.`
            : null;
        if (limitError) return { success: false, error: limitError };
        const item = transform(partial);
        await putItem(store as any, item as any);
        setState((prev) => [...prev, item]);
        return { success: true, item };
      };
    },
    [demoMode]
  );

  const addMember = useMemo(
    () =>
      createAdd<Member>(
        members,
        setMembers,
        STORE.members,
        "members",
        "members",
        (partial) => ({
          id: crypto.randomUUID(),
          joinDate: new Date().toISOString().split("T")[0],
          lastVisit: "Never",
          ...partial,
        })
      ),
    [createAdd, members]
  );

  const addClass = useMemo(
    () =>
      createAdd<ClassItem>(
        classes,
        setClasses,
        STORE.classes,
        "classes",
        "classes",
        (partial) => ({
          id: crypto.randomUUID(),
          students: [],
          enrolled: 0,
          ...partial,
        })
      ),
    [createAdd, classes]
  );

  const addEquipment = useMemo(
    () =>
      createAdd<EquipmentItem>(
        equipment,
        setEquipment,
        STORE.equipment,
        "equipment",
        "equipment items",
        (partial) => ({ id: crypto.randomUUID(), ...partial })
      ),
    [createAdd, equipment]
  );

  const addIncident = useMemo(
    () =>
      createAdd<IncidentItem>(
        incidents,
        setIncidents,
        STORE.incidents,
        "incidents",
        "incident reports",
        (partial) => ({
          id: crypto.randomUUID(),
          status: "reported",
          ...partial,
        })
      ),
    [createAdd, incidents]
  );

  const addWaiver = useMemo(
    () =>
      createAdd<WaiverItem>(
        waivers,
        setWaivers,
        STORE.waivers,
        "waivers",
        "waivers",
        (partial) => ({
          id: crypto.randomUUID(),
          status: "pending",
          archived: false,
          ...partial,
        })
      ),
    [createAdd, waivers]
  );

  const addStaff = useMemo(
    () =>
      createAdd<StaffMemberItem>(
        staff,
        setStaff,
        STORE.staff,
        "staff",
        "staff members",
        (partial) => ({
          id: crypto.randomUUID(),
          classes: 0,
          archived: false,
          ...partial,
        })
      ),
    [createAdd, staff]
  );

  const addPayment = useMemo(
    () =>
      createAdd<PaymentItem>(
        payments,
        setPayments,
        STORE.payments,
        "payments",
        "payments",
        (partial) => ({ id: crypto.randomUUID(), ...partial })
      ),
    [createAdd, payments]
  );

  // Generic update factory
  const createUpdate = useCallback(
    <T extends { id: string }>(
        state: T[],
        setState: React.Dispatch<React.SetStateAction<T[]>>,
        store: string,
        label: string
      ) =>
      async (id: string, partial: Partial<T>): Promise<OperationResult<T>> => {
        const existing = state.find((i) => i.id === id);
        if (!existing) return { success: false, error: `${label} not found` };
        const updated = { ...existing, ...partial } as T;
        await putItem(store as any, updated as any);
        setState((prev) => prev.map((i) => (i.id === id ? updated : i)));
        return { success: true, item: updated };
      },
    []
  );

  const updateMember = useMemo(
    () => createUpdate<Member>(members, setMembers, STORE.members, "Member"),
    [createUpdate, members]
  );
  const updateClass = useMemo(
    () => createUpdate<ClassItem>(classes, setClasses, STORE.classes, "Class"),
    [createUpdate, classes]
  );
  const updateEquipment = useMemo(
    () =>
      createUpdate<EquipmentItem>(
        equipment,
        setEquipment,
        STORE.equipment,
        "Equipment"
      ),
    [createUpdate, equipment]
  );
  const updateIncident = useMemo(
    () =>
      createUpdate<IncidentItem>(
        incidents,
        setIncidents,
        STORE.incidents,
        "Incident"
      ),
    [createUpdate, incidents]
  );
  const updateWaiver = useMemo(
    () =>
      createUpdate<WaiverItem>(waivers, setWaivers, STORE.waivers, "Waiver"),
    [createUpdate, waivers]
  );
  const updateStaff = useMemo(
    () =>
      createUpdate<StaffMemberItem>(
        staff,
        setStaff,
        STORE.staff,
        "Staff member"
      ),
    [createUpdate, staff]
  );
  const updatePayment = useMemo(
    () =>
      createUpdate<PaymentItem>(
        payments,
        setPayments,
        STORE.payments,
        "Payment"
      ),
    [createUpdate, payments]
  );

  // Remove helpers
  const removeFactory = useCallback(
    <T extends { id: string }>(
        setState: React.Dispatch<React.SetStateAction<T[]>>,
        store: string
      ) =>
      async (id: string) => {
        await deleteItem(store as any, id);
        setState((prev) => prev.filter((i) => i.id !== id));
      },
    []
  );

  const removeMember = useMemo(
    () => removeFactory<Member>(setMembers, STORE.members),
    [removeFactory]
  );
  const removeClass = useMemo(
    () => removeFactory<ClassItem>(setClasses, STORE.classes),
    [removeFactory]
  );
  const removeEquipment = useMemo(
    () => removeFactory<EquipmentItem>(setEquipment, STORE.equipment),
    [removeFactory]
  );
  const removeIncident = useMemo(
    () => removeFactory<IncidentItem>(setIncidents, STORE.incidents),
    [removeFactory]
  );
  // Soft delete (archive) for waivers & staff instead of physical delete
  const archiveWaiver = useCallback(
    async (id: string): Promise<OperationResult<WaiverItem>> => {
      const existing = waivers.find((w) => w.id === id);
      if (!existing) return { success: false, error: "Waiver not found" };
      if (existing.archived) return { success: true, item: existing }; // already archived
      const updated = { ...existing, archived: true };
      await putItem(STORE.waivers as any, updated as any);
      setWaivers((prev) => prev.map((w) => (w.id === id ? updated : w)));
      return { success: true, item: updated };
    },
    [waivers]
  );

  const unarchiveWaiver = useCallback(
    async (id: string): Promise<OperationResult<WaiverItem>> => {
      const existing = waivers.find((w) => w.id === id);
      if (!existing) return { success: false, error: "Waiver not found" };
      if (!existing.archived) return { success: true, item: existing };
      const updated = { ...existing, archived: false };
      await putItem(STORE.waivers as any, updated as any);
      setWaivers((prev) => prev.map((w) => (w.id === id ? updated : w)));
      return { success: true, item: updated };
    },
    [waivers]
  );

  const archiveStaff = useCallback(
    async (id: string): Promise<OperationResult<StaffMemberItem>> => {
      const existing = staff.find((s) => s.id === id);
      if (!existing) return { success: false, error: "Staff not found" };
      if (existing.archived) return { success: true, item: existing };
      const updated = { ...existing, archived: true };
      await putItem(STORE.staff as any, updated as any);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return { success: true, item: updated };
    },
    [staff]
  );

  const unarchiveStaff = useCallback(
    async (id: string): Promise<OperationResult<StaffMemberItem>> => {
      const existing = staff.find((s) => s.id === id);
      if (!existing) return { success: false, error: "Staff not found" };
      if (!existing.archived) return { success: true, item: existing };
      const updated = { ...existing, archived: false };
      await putItem(STORE.staff as any, updated as any);
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
      return { success: true, item: updated };
    },
    [staff]
  );

  const removeWaiver = useCallback(
    async (id: string) => {
      await archiveWaiver(id);
    },
    [archiveWaiver]
  );
  const removeStaff = useCallback(
    async (id: string) => {
      await archiveStaff(id);
    },
    [archiveStaff]
  );
  const removePayment = useMemo(
    () => removeFactory<PaymentItem>(setPayments, STORE.payments),
    [removeFactory]
  );

  // Purge (hard delete) everything but meta/demo flag
  const purgeAllGymData = useCallback(async () => {
    await clearAllData();
    setMembers([]);
    setClasses([]);
    setEquipment([]);
    setIncidents([]);
    setWaivers([]);
    setStaff([]);
    setPayments([]);
  }, []);

  // Reset to seeded demo data (start over). This clears all stores then writes the
  // seed rows and refreshes memory state. It preserves meta (demo flag) in meta store.
  const resetToSeed = useCallback(async () => {
    setLoading(true);
    // Clear all non-meta stores
    await clearAllData();
    // Bulk seed each store
    await Promise.all([
      bulkPut(STORE.members, ALL_SEEDS.members),
      bulkPut(STORE.classes, ALL_SEEDS.classes),
      bulkPut(STORE.equipment, ALL_SEEDS.equipment),
      bulkPut(STORE.incidents, ALL_SEEDS.incidents),
      bulkPut(STORE.waivers, ALL_SEEDS.waivers),
      bulkPut(STORE.staff, ALL_SEEDS.staff),
      bulkPut(STORE.payments, ALL_SEEDS.payments),
    ]);
    // Refresh in-memory state from DB
    const [mRaw, cRaw, eRaw, iRaw, wRaw, sRaw, pRaw] = await Promise.all([
      getAll<any>(STORE.members),
      getAll<any>(STORE.classes),
      getAll<any>(STORE.equipment),
      getAll<any>(STORE.incidents),
      getAll<any>(STORE.waivers),
      getAll<any>(STORE.staff),
      getAll<any>(STORE.payments),
    ]);
    setMembers(mRaw as Member[]);
    setClasses(cRaw as ClassItem[]);
    setEquipment(eRaw as EquipmentItem[]);
    setIncidents(iRaw as IncidentItem[]);
    setWaivers(wRaw as WaiverItem[]);
    setStaff(sRaw as StaffMemberItem[]);
    setPayments(pRaw as PaymentItem[]);
    setLoading(false);
  }, []);

  const value: GymContextValue = {
    loading,
    demoMode,
    toggleDemoMode,
    limits: DEMO_LIMITS,
    members,
    classes,
    equipment,
    incidents,
    waivers: waivers.filter((w) => !w.archived),
    staff: staff.filter((s) => !s.archived),
    payments,
    addMember,
    addClass,
    addEquipment,
    addIncident,
    addWaiver,
    addStaff,
    addPayment,
    updateMember,
    updateClass,
    updateEquipment,
    updateIncident,
    updateWaiver,
    updateStaff,
    updatePayment,
    removeMember,
    removeClass,
    removeEquipment,
    removeIncident,
    removeWaiver,
    removeStaff,
    removePayment,
    archiveStaff,
    archiveWaiver,
    unarchiveStaff,
    unarchiveWaiver,
    purgeAllGymData,
    // debug helper: reset DB to initial seeds
    // (keeps meta/demo flag intact)
    resetToSeed,
  };

  // Expose a dev console helper for quick resets in development only
  React.useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    window.__resetGymToSeed = async () => {
      await resetToSeed();
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return true;
    };
    return () => {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        delete window.__resetGymToSeed;
      } catch {}
    };
  }, [resetToSeed]);

  // Avoid rendering children until initial load finishes to prevent
  // UI showing default/empty state then quickly swapping to indexeddb data
  // which causes the flicker.
  if (loading) {
    // Render nothing while loading; components can read `loading` from context
    // after GymProvider mounts. This silent gate avoids layout flicker.
    return <GymContext.Provider value={value}>{null}</GymContext.Provider>;
  }

  return <GymContext.Provider value={value}>{children}</GymContext.Provider>;
};

export function useGym() {
  const ctx = useContext(GymContext);
  if (!ctx) throw new Error("useGym must be used within GymProvider");
  return ctx;
}
