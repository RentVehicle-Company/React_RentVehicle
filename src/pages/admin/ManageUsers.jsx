import React, { useEffect, useMemo, useState } from "react";
import {
  LuMail,
  LuSearch,
  LuTrash2,
  LuUserX,
  LuLoader,
  LuShield,
} from "react-icons/lu";
import { getAllUsersWithFallback, updateUserRole, deleteUser } from "../../services/userService";
import { getCurrentUserRole, getCurrentUserId } from "../../services/authServices";

const ROLE_OPTIONS = [
  { value: "USER", label: "User", classes: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" },
  { value: "ADMIN", label: "Admin", classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
];

const getInitials = (name) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getRoleMeta = (role) => {
  const found = ROLE_OPTIONS.find((r) => r.value === role);
  return found || ROLE_OPTIONS[0];
};

const getRoleSelectClassName = (isOwnProfile) => {
  if (isOwnProfile) {
    return "appearance-none pr-8 py-1.5 px-2.5 text-xs font-medium rounded-lg border bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed border-borderColor focus:outline-none focus:ring-1 focus:ring-primary";
  }
  return "appearance-none pr-8 py-1.5 px-2.5 text-xs font-medium rounded-lg border bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer hover:border-primary/50 border-borderColor dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-primary";
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user's role and ID from JWT (secure - from backend-issued token)
  useEffect(() => {
    const role = getCurrentUserRole();
    const userId = getCurrentUserId();
    setCurrentUserRole(role);
    setCurrentUserId(userId);
  }, []);

  const isCurrentUserAdmin = currentUserRole === "ADMIN" || currentUserRole === "ROLE_ADMIN";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersWithFallback();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (user, newRole) => {
    if (user.role === newRole) return;

    // Prevent self-role-escalation
    if (currentUserId && String(user.id) === String(currentUserId)) {
      alert("You cannot change your own role.");
      return;
    }

    // Prevent non-admins from changing roles
    if (!isCurrentUserAdmin) {
      alert("Only administrators can modify user roles.");
      return;
    }

    setUpdatingId(user.id);
    try {
      const updated = await updateUserRole(user.id, newRole);
      setUsers(users.map((u) => (String(u.id) === String(user.id) ? updated : u)));
    } catch (err) {
      console.error("Failed to update role:", err);
      if (err.status === 403) {
        alert("Access denied: Only administrators can modify user roles.");
      } else {
        alert("Failed to update role. Please try again.");
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(
      `Delete user "${user.name}" (${user.email})? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(user.id);
    try {
      await deleteUser(user.id);
      setUsers(users.filter((u) => String(u.id) !== String(user.id)));
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Failed to delete user. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => {
      const haystack = [user.name, user.email, user.phone, user.role]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [users, search]);

  return (
    <div className="overflow-hidden rounded-2xl border border-borderColor bg-white dark:border-slate-700 dark:bg-slate-800 shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 border-b border-slate-100 dark:border-slate-700 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            User Management
            <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
              {users.length} users
            </span>
          </h3>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Manage user accounts and roles.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <LuSearch
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, phone…"
              className="w-full rounded-xl border border-borderColor dark:border-slate-600 bg-white dark:bg-slate-700 py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead>
            <tr className="border-y border-slate-100 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-700/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <div className="flex items-center justify-center gap-2 text-slate-400">
                    <LuLoader className="animate-spin" size={20} />
                    Loading users...
                  </div>
                </td>
              </tr>
            ) : filtered.map((user) => {
              const roleMeta = getRoleMeta(user.role);
              const isOwnProfile = currentUserId && String(user.id) === String(currentUserId);
              return (
                <tr
                  key={String(user.id)}
                  className="group border-b border-slate-100 dark:border-slate-700 transition-colors last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-700/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary font-semibold">
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          getInitials(user.name || "U")
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900 dark:text-white">
                          {user.name || "—"}
                        </p>
                        <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                          ID: {String(user.id)}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <LuMail size={14} className="text-slate-400" />
                      {user.email || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {user.phone || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleMeta.classes}`}
                    >
                      {roleMeta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Role dropdown - only visible to admins */}
                      {isCurrentUserAdmin && (
                        <div className="relative">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            disabled={
                              updatingId === user.id ||
                              deletingId === user.id ||
                              isOwnProfile
                            }
                            className={getRoleSelectClassName(isOwnProfile)}
                          >
                            {ROLE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          {updatingId === user.id && (
                            <LuLoader className="animate-spin absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
                          )}
                          {isOwnProfile && (
                            <LuShield className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400" size={12} title="Cannot change your own role" />
                          )}
                        </div>
                      )}
                      {/* Delete button */}
                      <button
                        type="button"
                        onClick={() => handleDelete(user)}
                        aria-label="Delete user"
                        disabled={updatingId === user.id || deletingId === user.id}
                        className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        {deletingId === user.id ? (
                          <LuLoader className="animate-spin" size={15} />
                        ) : (
                          <LuTrash2 size={15} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-14 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
                    {search ? <LuSearch size={20} /> : <LuUserX size={20} />}
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {search ? "No users match your search" : "No users yet"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {search
                      ? "Try a different keyword."
                      : "No users have been registered yet."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-700 px-5 py-3.5">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Showing {filtered.length} of {users.length} users
        </p>
      </div>
    </div>
  );
};

export default ManageUsers;