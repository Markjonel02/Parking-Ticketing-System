// client/src/pages/users/Users.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { userApi } from "../../services/api/userApi.js";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { ConfirmDialog } from "../../components/common/ConfirmDialog.jsx";
import { useAppContext } from "../../context/AppContext.jsx";
import {
  PlusCircle,
  UserCheck,
  UserX,
  Lock,
  X,
  MoreVertical,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
// Pulled out of the component so they aren't recreated on every render and
// so the create-user form and any future "edit role" UI share one source
// of truth for available roles.
const ROLE_OPTIONS = [
  { value: "OFFICER", label: "OFFICER (Field Enforcement)" },
  { value: "SUPERVISOR", label: "SUPERVISOR (Adjudication)" },
  { value: "CASHIER", label: "CASHIER (Treasury Counter)" },
  { value: "ADMIN", label: "ADMIN (Full Authority)" },
];

const DEFAULT_FORM_STATE = {
  name: "",
  email: "",
  role: "OFFICER",
  badgeNumber: "",
  department: "Downtown Enforcement Patrol",
  phone: "",
};

// All roles currently share the same badge styling; kept as a lookup so a
// role can get its own color later without touching the table code.
const ROLE_BADGE_CLASS = "text-blue-800";

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function UserAvatar({ user }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
        {user.name?.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <span className="font-semibold text-xs text-slate-900 block">
          {user.name}
        </span>
        <span className="text-[11px] text-slate-400">{user.email}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
        isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
      }`}
    >
      {status}
    </span>
  );
}

/**
 * Calls `handler` on any mousedown that lands outside `ref`. Used to close
 * the actions dropdown when the user clicks elsewhere on the page.
 */
function useOnClickOutside(ref, handler) {
  useEffect(() => {
    function handleClick(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        handler();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [ref, handler]);
}

function MenuItem({
  icon,
  label,
  onClick,
  disabled,
  disabledReason,
  colorClass,
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      title={disabledReason}
      className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-left ${
        disabled
          ? "text-slate-300 cursor-not-allowed"
          : `${colorClass} hover:bg-slate-50 cursor-pointer`
      }`}
    >
      {icon}
      <span className="flex-1">{label}</span>
      {disabled && disabledReason && (
        <Lock className="w-3 h-3 text-slate-300" />
      )}
    </button>
  );
}

/**
 * Per-row "..." menu with Suspend / Activate actions. Only one of the two
 * actions is ever meaningful for a given user (you can't activate someone
 * who's already active), so the inapplicable option is shown disabled
 * rather than hidden — that keeps the menu's shape predictable and makes
 * it obvious *why* an option can't be used (already in that state, or
 * protected as the last active admin).
 */
function ActionsMenu({ user, isLastActiveAdmin, onRequestStatusChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  useOnClickOutside(menuRef, () => setIsOpen(false));

  const isActive = user.status === "ACTIVE";

  function selectAction() {
    setIsOpen(false);
    onRequestStatusChange(user);
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
        aria-label={`Actions for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-10"
        >
          <MenuItem
            icon={<UserX className="w-3.5 h-3.5" />}
            label="Suspend"
            colorClass="text-red-600"
            onClick={selectAction}
            disabled={!isActive || isLastActiveAdmin}
            disabledReason={
              isLastActiveAdmin
                ? "Cannot suspend the last active administrator"
                : !isActive
                  ? "Already suspended"
                  : undefined
            }
          />
          <MenuItem
            icon={<UserCheck className="w-3.5 h-3.5" />}
            label="Activate"
            colorClass="text-emerald-600"
            onClick={selectAction}
            disabled={isActive}
            disabledReason={isActive ? "Already active" : undefined}
          />
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function Users() {
  const { showToast, refreshKey } = useAppContext();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);

  // Single-user suspend/activate confirmation. `statusConfirmTarget` is the
  // user awaiting confirmation, or null when the dialog is closed.
  const [statusConfirmTarget, setStatusConfirmTarget] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Bulk selection + bulk suspend/activate confirmation.
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkAction, setBulkAction] = useState(null); // "SUSPEND" | "ACTIVATE" | null
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const selectAllRef = useRef(null);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userApi.getAllUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, refreshKey]);

  // If the list reloads and a previously-selected user is gone, drop it
  // from the selection so the "N selected" count stays accurate.
  useEffect(() => {
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const validIds = new Set(users.map((u) => u.id));
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [users]);

  const activeAdminCount = users.filter(
    (u) => u.role === "ADMIN" && u.status === "ACTIVE",
  ).length;

  // ---- Selection helpers --------------------------------------------------

  const selectedCount = selectedIds.size;
  const isAllSelected = users.length > 0 && selectedCount === users.length;
  const isSomeSelected = selectedCount > 0 && !isAllSelected;

  // Checkbox inputs don't have an "indeterminate" prop — it has to be set
  // imperatively on the DOM node.
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedIds.has(u.id)),
    [users, selectedIds],
  );

  function toggleSelectAll() {
    setSelectedIds(isAllSelected ? new Set() : new Set(users.map((u) => u.id)));
  }

  function toggleSelectOne(id) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function clearSelection() {
    setSelectedIds(new Set());
  }

  // ---- Single-user suspend / activate -------------------------------------

  async function confirmToggleStatus() {
    if (!statusConfirmTarget || isTogglingStatus) return;

    setIsTogglingStatus(true);
    try {
      const res = await userApi.toggleStatus(statusConfirmTarget.id);
      if (res.success) {
        showToast({
          title: "Status Updated",
          description: `${statusConfirmTarget.name} is now ${res.data.status}.`,
          status: "success",
          duration: 2000,
        });
        loadUsers();
      }
    } catch (err) {
      showToast({
        title: "Update Failed",
        description: err.message,
        status: "error",
      });
    } finally {
      setIsTogglingStatus(false);
      setStatusConfirmTarget(null);
    }
  }

  // ---- Bulk suspend / activate ---------------------------------------------

  /**
   * `toggleStatus` flips whatever status a user currently has, so a bulk
   * "Suspend" only makes sense for users who are currently ACTIVE (and
   * vice versa for "Activate"). Anyone already in the target state is
   * skipped rather than sent to the API. The server still enforces the
   * last-active-admin rule per request, so we fire everything in parallel
   * and tally successes/failures instead of trying to duplicate that
   * check on the client.
   */
  async function confirmBulkAction() {
    if (!bulkAction || isBulkProcessing) return;

    const eligibleUsers = selectedUsers.filter((u) =>
      bulkAction === "SUSPEND" ? u.status === "ACTIVE" : u.status !== "ACTIVE",
    );

    if (eligibleUsers.length === 0) {
      setBulkAction(null);
      return;
    }

    setIsBulkProcessing(true);
    try {
      const results = await Promise.allSettled(
        eligibleUsers.map((u) => userApi.toggleStatus(u.id)),
      );
      const succeededCount = results.filter(
        (r) => r.status === "fulfilled",
      ).length;
      const failedCount = results.length - succeededCount;

      reportBulkResult(bulkAction, succeededCount, failedCount);
      clearSelection();
      loadUsers();
    } finally {
      setIsBulkProcessing(false);
      setBulkAction(null);
    }
  }

  function reportBulkResult(action, succeededCount, failedCount) {
    if (succeededCount === 0) {
      showToast({
        title: "Bulk Update Failed",
        description:
          "None of the selected staff could be updated (this may include the last active administrator).",
        status: "error",
      });
      return;
    }

    const verb = action === "SUSPEND" ? "suspended" : "activated";
    showToast({
      title: action === "SUSPEND" ? "Staff Suspended" : "Staff Activated",
      description: `${succeededCount} staff member${succeededCount === 1 ? "" : "s"} ${verb}${
        failedCount > 0 ? `, ${failedCount} could not be updated.` : "."
      }`,
      status: failedCount > 0 ? "warning" : "success",
    });
  }

  // ---- Create user ----------------------------------------------------------

  async function handleCreateUser(e) {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast({
        title: "Validation Error",
        description: "Name and email are required.",
        status: "error",
      });
      return;
    }

    try {
      const res = await userApi.createUser(formData);
      if (res.success) {
        showToast({
          title: "Staff Provisioned",
          description: `${formData.name} added to roster.`,
          status: "success",
        });
        setIsCreateOpen(false);
        setFormData(DEFAULT_FORM_STATE);
        loadUsers();
      }
    } catch (err) {
      showToast({
        title: "Provisioning Failed",
        description: err.message,
        status: "error",
      });
    }
  }

  function updateFormField(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  // ---- Table columns ----------------------------------------------------------

  const columns = useMemo(
    () => [
      {
        header: (
          <input
            ref={selectAllRef}
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            aria-label="Select all staff members"
          />
        ),
        key: "select",
        align: "center",
        render: (u) => (
          <input
            type="checkbox"
            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            checked={selectedIds.has(u.id)}
            onChange={() => toggleSelectOne(u.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${u.name}`}
          />
        ),
      },
      {
        header: "Staff Member",
        key: "name",
        render: (u) => <UserAvatar user={u} />,
      },
      {
        header: "Authority Role",
        key: "role",
        render: (u) => (
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-bold ${ROLE_BADGE_CLASS}`}
          >
            {u.role}
          </span>
        ),
      },
      {
        header: "Badge #",
        key: "badgeNumber",
        render: (u) => (
          <span className="font-mono text-xs font-semibold text-slate-700">
            {u.badgeNumber || "—"}
          </span>
        ),
      },
      {
        header: "Department / Unit",
        key: "department",
        render: (u) => (
          <span className="text-xs text-slate-600">
            {u.department || "Enforcement"}
          </span>
        ),
      },
      {
        header: "Status",
        key: "status",
        align: "center",
        render: (u) => <StatusBadge status={u.status} />,
      },
      {
        header: "Actions",
        key: "actions",
        align: "right",
        render: (u) => {
          const isLastActiveAdmin =
            u.role === "ADMIN" &&
            u.status === "ACTIVE" &&
            activeAdminCount <= 1;

          return (
            <div
              className="flex justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <ActionsMenu
                user={u}
                isLastActiveAdmin={isLastActiveAdmin}
                onRequestStatusChange={setStatusConfirmTarget}
              />
            </div>
          );
        },
      },
    ],
    // isAllSelected/selectedIds/activeAdminCount drive per-row rendering
    // (checkbox state, "last admin" lock), so the column list needs to be
    // rebuilt whenever they change.
    [isAllSelected, selectedIds, activeAdminCount],
  );

  // ---- Render ----------------------------------------------------------------

  const eligibleForBulkAction = selectedUsers.filter((u) =>
    bulkAction === "SUSPEND" ? u.status === "ACTIVE" : u.status !== "ACTIVE",
  ).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Staff & Field Officers Roster
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Role assignments, badge credentialing, and officer department
            administration
          </p>
        </div>

        <Button
          size="sm"
          colorScheme="brand"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<PlusCircle className="w-4 h-4" />}
        >
          Provision Officer
        </Button>
      </div>

      {/* Bulk selection summary bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-900">
            <span>
              {selectedCount} staff member{selectedCount === 1 ? "" : "s"}{" "}
              selected
            </span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-blue-500 hover:text-blue-700"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              colorScheme="red"
              onClick={() => setBulkAction("SUSPEND")}
              leftIcon={<UserX className="w-3.5 h-3.5" />}
            >
              Bulk Suspend
            </Button>
            <Button
              size="xs"
              variant="outline"
              colorScheme="teal"
              onClick={() => setBulkAction("ACTIVATE")}
              leftIcon={<UserCheck className="w-3.5 h-3.5" />}
            >
              Bulk Activate
            </Button>
          </div>
        </div>
      )}

      <DataTable columns={columns} data={users} isLoading={isLoading} />

      {/* Suspend / Activate confirmation — single user, triggered from the "..." menu */}
      <ConfirmDialog
        isOpen={!!statusConfirmTarget}
        onClose={() => setStatusConfirmTarget(null)}
        onConfirm={confirmToggleStatus}
        title={
          statusConfirmTarget?.status === "ACTIVE"
            ? "Suspend Staff Member"
            : "Activate Staff Member"
        }
        message={
          statusConfirmTarget
            ? `Are you sure you want to ${
                statusConfirmTarget.status === "ACTIVE" ? "suspend" : "activate"
              } ${statusConfirmTarget.name}?`
            : ""
        }
        confirmText={
          statusConfirmTarget?.status === "ACTIVE"
            ? "Yes, Suspend"
            : "Yes, Activate"
        }
        cancelText="Cancel"
        colorScheme={statusConfirmTarget?.status === "ACTIVE" ? "red" : "teal"}
        type={statusConfirmTarget?.status === "ACTIVE" ? "warning" : "info"}
        isLoading={isTogglingStatus}
      />

      {/* Suspend / Activate confirmation — bulk */}
      <ConfirmDialog
        isOpen={!!bulkAction}
        onClose={() => setBulkAction(null)}
        onConfirm={confirmBulkAction}
        title={
          bulkAction === "SUSPEND"
            ? "Suspend Selected Staff"
            : "Activate Selected Staff"
        }
        message={
          bulkAction
            ? `Are you sure you want to ${
                bulkAction === "SUSPEND" ? "suspend" : "activate"
              } ${eligibleForBulkAction} of the ${selectedCount} selected staff member${
                selectedCount === 1 ? "" : "s"
              }? Staff already in that status will be skipped, and the last active administrator cannot be suspended.`
            : ""
        }
        confirmText={
          bulkAction === "SUSPEND"
            ? "Yes, Suspend Selected"
            : "Yes, Activate Selected"
        }
        cancelText="Cancel"
        colorScheme={bulkAction === "SUSPEND" ? "red" : "teal"}
        type={bulkAction === "SUSPEND" ? "warning" : "info"}
        isLoading={isBulkProcessing}
      />

      {/* Create Officer Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Provision Municipal Staff Member"
        subtitle="Issue credentials and departmental clearance"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              colorScheme="gray"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button colorScheme="brand" size="sm" onClick={handleCreateUser}>
              Provision User
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Full Legal Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => updateFormField("name", e.target.value)}
              placeholder="e.g. Officer James Cole"
              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Municipal Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => updateFormField("email", e.target.value)}
              placeholder="officer@parkguard.gov"
              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Role Permission
              </label>
              <select
                value={formData.role}
                onChange={(e) => updateFormField("role", e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Badge / Shield ID
              </label>
              <input
                type="text"
                value={formData.badgeNumber}
                onChange={(e) =>
                  updateFormField("badgeNumber", e.target.value.toUpperCase())
                }
                placeholder="e.g. EO-5542"
                className="w-full font-mono uppercase p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Department / Division
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) => updateFormField("department", e.target.value)}
              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Users;
