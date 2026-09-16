// client/src/pages/users/Users.jsx
import React, { useState, useEffect } from "react";
import { userApi } from "../../services/api/userApi.js";
import { DataTable } from "../../components/common/DataTable.jsx";
import { Button } from "../../components/common/Button.jsx";
import { Modal } from "../../components/common/Modal.jsx";
import { formatDate } from "../../utils/formatDate.js";
import { useAppContext } from "../../context/AppContext.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  Users as UsersIcon,
  PlusCircle,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";

export function Users() {
  const { showToast, refreshKey, triggerRefresh } = useAppContext();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // New user form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "OFFICER",
    badgeNumber: "",
    department: "Downtown Enforcement Patrol",
    phone: "",
  });

  async function loadUsers() {
    setIsLoading(true);
    try {
      const res = await userApi.getUsers();
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error("Error fetching users", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, [refreshKey]);

  async function handleToggleStatus(targetUser) {
    try {
      const res = await userApi.toggleStatus(targetUser.id);
      if (res.success) {
        showToast({
          title: "Status Updated",
          description: `${targetUser.name} is now ${res.data.status}.`,
          status: "success",
        });
        loadUsers();
      }
    } catch (err) {
      showToast({
        title: "Update Failed",
        description: err.message,
        status: "error",
      });
    }
  }

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
        setFormData({
          name: "",
          email: "",
          role: "OFFICER",
          badgeNumber: "",
          department: "Downtown Enforcement Patrol",
          phone: "",
        });
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

  const roleColors = {
    ADMIN: "text-blue-800 ",
    SUPERVISOR: "text-blue-800 ",
    OFFICER: "text-blue-800 ",
    CASHIER: "text-blue-800 ",
    CITIZEN: "text-blue-800 ",
  };

  const columns = [
    {
      header: "Staff Member",
      key: "name",
      render: (u) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
            {u.name?.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <span className="font-semibold text-xs text-slate-900 block">
              {u.name}
            </span>
            <span className="text-[11px] text-slate-400">{u.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Authority Role",
      key: "role",
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded text-[11px] font-bold ${roleColors[u.role] || roleColors.OFFICER}`}
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
      render: (u) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            u.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {u.status}
        </span>
      ),
    },
    {
      header: "Actions",
      key: "actions",
      align: "right",
      render: (u) => (
        <div
          className="flex justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="xs"
            variant="outline"
            colorScheme={u.status === "ACTIVE" ? "red" : "teal"}
            onClick={() => handleToggleStatus(u)}
          >
            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
          </Button>
        </div>
      ),
    },
  ];

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

      {/* Users DataTable */}
      <DataTable columns={columns} data={users} isLoading={isLoading} />

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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full p-2 rounded-lg border border-slate-300 bg-white"
              >
                <option value="OFFICER">OFFICER (Field Enforcement)</option>
                <option value="SUPERVISOR">SUPERVISOR (Adjudication)</option>
                <option value="CASHIER">CASHIER (Treasury Counter)</option>
                <option value="ADMIN">ADMIN (Full Authority)</option>
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
                  setFormData({
                    ...formData,
                    badgeNumber: e.target.value.toUpperCase(),
                  })
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
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              className="w-full p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Users;
