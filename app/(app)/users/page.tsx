"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2, X, AlertCircle, Shield, User } from "lucide-react";
import { formatDate } from "@/lib/utils";
import ModalPortal from "@/components/ModalPortal";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "STAFF" });

  const fetchUsers = async () => {
    setLoading(true);
    const r = await fetch("/api/users");
    const data = await r.json();
    setUsers(data.users || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const r = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (r.ok) {
      setShowForm(false);
      setForm({ name: "", email: "", password: "", role: "STAFF" });
      fetchUsers();
    } else {
      const d = await r.json();
      setError(d.error || "Failed to create user");
    }
  }

  const f = (k: string, v: string) => setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="row mb-2 mb-xl-3">
        <div className="col-auto d-none d-sm-block">
          <h1 className="h3 d-inline align-middle text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-white mb-1" /> User Management
          </h1>
          <p className="text-white text-opacity-75 text-sm mt-1">
            Admin only — manage system users and roles
          </p>
        </div>
        <div className="col-auto ms-auto text-end mt-n1">
          <button onClick={() => setShowForm(true)} className="btn btn-primary shadow-sm flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add User
          </button>
        </div>
      </div>

      <div className="card flex-fill w-100 mb-3">
        <div className="table-responsive">
          <table className="table table-hover my-0">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-5"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold" style={{ width: '28px', height: '28px', fontSize: '12px' }}>
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="fw-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <span className={`badge ${
                      u.role === "ADMIN" ? "bg-warning text-dark border border-warning" : "bg-info text-dark border border-info"
                    }`}>
                      {u.role === "ADMIN" ? <Shield className="w-3 h-3 me-1 d-inline" /> : <User className="w-3 h-3 me-1 d-inline" />}
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      u.isActive ? "bg-success" : "bg-danger"
                    }`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="text-muted small">{formatDate(u.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <ModalPortal>
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-scrollable mx-auto" style={{ marginTop: '100px', width: '92%', maxWidth: '500px' }}>
            <form onSubmit={handleSubmit} className="modal-content border-0 shadow">
              <div className="modal-header d-flex align-items-center justify-content-between px-4 rounded-top">
                <h5 className="modal-title fw-bold m-0">Add New User</h5>
                <button type="button" className="btn-close m-0" style={{ fontSize: '0.8rem', opacity: 0.6 }} onClick={() => setShowForm(false)} aria-label="Close"></button>
              </div>
              <div className="modal-body">
                {error && <div className="alert alert-danger p-2 text-sm d-flex align-items-center"><AlertCircle className="w-4 h-4 me-2" />{error}</div>}
                <div className="mb-3">
                  <label className="form-label mb-1">Full Name *</label>
                  <input required value={form.name} onChange={(e) => f("name", e.target.value)} placeholder="John Doe" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label mb-1">Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => f("email", e.target.value)} placeholder="john@example.com" className="form-control" />
                </div>
                <div className="mb-3">
                  <label className="form-label mb-1">Password *</label>
                  <input required type="password" minLength={6} value={form.password} onChange={(e) => f("password", e.target.value)} placeholder="Min 6 characters" className="form-control" />
                </div>
                <div>
                  <label className="form-label mb-1">Role *</label>
                  <select value={form.role} onChange={(e) => f("role", e.target.value)} className="form-select">
                    <option value="STAFF">Staff</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" disabled={saving} className="btn btn-primary d-flex align-items-center gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saving ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
        </ModalPortal>
      )}
    </div>
  );
}
