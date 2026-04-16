"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// own brand slice
import {
  fetchMyBrands,
  createBrand,
  updateBrandName,
  deleteBrand,
  clearBrandError,
  selectMyBrands,
  selectOwnBrandLoading,
  selectOwnBrandError,
  Brand as BrandType,
} from "@/store/slices/ownBrandSlice";

// profile slice
import { fetchProfile } from "@/store/slices/profileSlice";

type RootState = any;

export default function MyBrandPage() {
  const dispatch = useDispatch<any>();

  // brands
  const brands = useSelector(selectMyBrands);
  const loading = useSelector(selectOwnBrandLoading);
  const error = useSelector(selectOwnBrandError);

  // profile
  const profile = useSelector((state: RootState) => state.profile?.data);
  const profileLoading = useSelector(
    (state: RootState) => state.profile?.loading
  );

  // local UI state
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const ownerLabel = useMemo(() => {
    if (!profile) return "—";
    const fullName = [profile.first_name, profile.last_name]
      .filter(Boolean)
      .join(" ");
    return fullName || profile.username || profile.email;
  }, [profile]);

  useEffect(() => {
    dispatch(fetchProfile(false));
  }, [dispatch]);

  useEffect(() => {
    if (profile) dispatch(fetchMyBrands());
  }, [profile, dispatch]);

  // Clear error toast-like behavior
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => dispatch(clearBrandError()), 4500);
    return () => clearTimeout(t);
  }, [error, dispatch]);

  const onCreate = async () => {
    const name = newName.trim();
    if (!name) return;
    await dispatch(createBrand({ name }));
    setNewName("");
  };

  const startEdit = (b: BrandType) => {
    setEditingId(b.id);
    setEditingName(b.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (!name) return;
    await dispatch(updateBrandName({ id: editingId, name }));
    cancelEdit();
  };

  const onDelete = async (id: number, name: string) => {
    const ok = window.confirm(`Delete brand "${name}"? This cannot be undone.`);
    if (!ok) return;
    await dispatch(deleteBrand({ id }));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            My Brand
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Create and manage the brands that belong to your account.
          </p>
        </div>

        {/* Owner chip */}
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">Owner:</span>
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {profileLoading ? "Loading..." : ownerLabel}
          </span>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Create Card */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Create a new brand
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              The brand will automatically be linked to your logged-in account.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 md:w-[520px] md:flex-row">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Brand name (e.g., Apple, Nike, Zara)"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600"
            />
            <button
              onClick={onCreate}
              disabled={!newName.trim() || loading}
              className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-white shadow-sm
                         bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed
                         dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {loading ? "Working..." : "Create"}
            </button>
          </div>
        </div>
      </div>

      {/* Brands list */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Your Brands
            </h3>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              {brands?.length || 0}
            </span>
          </div>

          <button
            onClick={() => dispatch(fetchMyBrands())}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
          >
            Refresh
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && brands.length === 0 ? (
            <SkeletonList />
          ) : brands.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {brands.map((b) => {
                const isEditing = editingId === b.id;

                return (
                  <div
                    key={b.id}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-slate-500 dark:text-slate-500">
                          Brand ID: <span className="font-medium">{b.id}</span>
                        </div>

                        {!isEditing ? (
                          <div className="mt-1 truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                            {b.name}
                          </div>
                        ) : (
                          <input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                            placeholder="New brand name"
                          />
                        )}

                        <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                          Owner:{" "}
                          <span className="font-medium">{ownerLabel}</span>
                        </div>
                      </div>

                      <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                        {b.name?.slice(0, 2)?.toUpperCase()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2">
                      {!isEditing ? (
                        <>
                          <button
                            onClick={() => startEdit(b)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(b.id, b.name)}
                            className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/60"
                          >
                            Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={saveEdit}
                            disabled={!editingName.trim()}
                            className="rounded-xl px-3 py-1.5 text-xs font-medium text-white shadow-sm
                                       bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed
                                       dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer hint */}
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-500">
        Tip: If you don’t see your brands, click{" "}
        <span className="font-medium">Refresh</span> or re-login to renew your
        token.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-800 dark:bg-slate-900/30">
      <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
        No brands yet
      </div>
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Create your first brand using the form above.
      </div>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="w-full">
              <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-2 h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="mt-3 h-3 w-32 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="flex gap-2">
            <div className="h-7 w-16 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-7 w-16 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
