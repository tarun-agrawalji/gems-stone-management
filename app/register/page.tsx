"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

// Diamond SVG (Hope UI brand mark)
const DiamondLogo = () => (
  <svg className="text-primary icon-30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="currentColor" />
    <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="currentColor" />
    <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="currentColor" />
    <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="currentColor" />
  </svg>
);

export default function RegisterPage() {
  const [organizationName, setOrganizationName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, organizationName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong during registration.");
        setLoading(false);
        return;
      }

      setSuccess(true);

      // Attempt auto-login after successful registration
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // If auto-login fails, redirect them to login manually
        router.push("/login?registered=true");
      } else {
        router.push("/dashboard");
        router.refresh();
      }

    } catch (err) {
      setError("A network error occurred.");
      setLoading(false);
    }
  }

  return (
    <div className="wrapper">
      {/* page loader */}
      {loading && (
        <div id="loading">
          <div className="loader simple-loader">
            <div className="loader-body"></div>
          </div>
        </div>
      )}

      <section className="login-content">
        <div className="row m-0 align-items-center bg-white vh-100">
          {/* ── Left: form panel ── */}
          <div className="col-md-6 overflow-auto" style={{ maxHeight: '100vh' }}>
            <div className="row justify-content-center">
              <div className="col-md-10">
                <div className="card card-transparent shadow-none d-flex justify-content-center mb-0 auth-card py-4">
                  <div className="card-body">
                    {/* Logo */}
                    <a href="#" className="navbar-brand d-flex align-items-center mb-3">
                      <DiamondLogo />
                      <h4 className="logo-title ms-3">Gem Inventory</h4>
                    </a>

                    <h2 className="mb-2 text-center">Sign Up</h2>
                    <p className="text-center text-muted">
                      Create your organization and admin account
                    </p>

                    {error && (
                      <div className="alert alert-danger" role="alert">
                        {error}
                      </div>
                    )}

                    {success && (
                      <div className="alert alert-success" role="alert">
                        Registration successful! Logging you in...
                      </div>
                    )}

                    <form onSubmit={handleRegister}>
                      <div className="row">
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label htmlFor="organizationName" className="form-label">
                              Company / Organization Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="organizationName"
                              placeholder="e.g. Acme Gems Inc."
                              value={organizationName}
                              onChange={(e) => setOrganizationName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label htmlFor="name" className="form-label">
                              Your Full Name
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="name"
                              placeholder="e.g. John Doe"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-group">
                            <label htmlFor="email" className="form-label">
                              Email Address
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="email"
                              placeholder="admin@company.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              autoComplete="email"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label htmlFor="password" className="form-label">
                              Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="password"
                              placeholder="Create a password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              autoComplete="new-password"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">
                              Confirm Password
                            </label>
                            <input
                              type="password"
                              className="form-control"
                              id="confirmPassword"
                              placeholder="Repeat password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              autoComplete="new-password"
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 d-flex justify-content-center mt-3">
                          <div className="form-check mb-3">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="customCheck1"
                              required
                            />
                            <label className="form-check-label" htmlFor="customCheck1">
                              I agree with the terms of use
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-center">
                        <button
                          type="submit"
                          className="btn btn-primary px-5"
                          disabled={loading || success}
                        >
                          {loading ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              />
                              Creating account…
                            </>
                          ) : (
                            "Sign Up"
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="mt-4 pt-3 border-top text-center">
                      <p className="mb-0">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary text-decoration-underline fw-bold">
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative background SVG */}
            <div className="sign-bg">
              <svg width="280" height="230" viewBox="0 0 431 398" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.05">
                  <rect x="-157.085" y="193.773" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 -157.085 193.773)" fill="#3B8AFF" />
                  <rect x="7.46875" y="358.327" width="543" height="77.5714" rx="38.7857" transform="rotate(-45 7.46875 358.327)" fill="#3B8AFF" />
                  <rect x="61.9355" y="138.545" width="310.286" height="77.5714" rx="38.7857" transform="rotate(45 61.9355 138.545)" fill="#3B8AFF" />
                  <rect x="62.3154" y="-190.173" width="543" height="77.5714" rx="38.7857" transform="rotate(45 62.3154 -190.173)" fill="#3B8AFF" />
                </g>
              </svg>
            </div>
          </div>

          {/* ── Right: blue decorative panel ── */}
          <div className="col-md-6 d-md-block d-none bg-primary p-0 mt-n1 vh-100 overflow-hidden">
            <div
              className="d-flex flex-column align-items-center justify-content-center h-100 p-5 text-white"
              style={{ background: "linear-gradient(135deg,#3b8aff 0%,#5e60ce 100%)" }}
            >
              {/* Large decorative diamond */}
              <svg viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 120, height: 120, opacity: 0.25, marginBottom: 32 }}>
                <rect x="-0.757324" y="19.2427" width="28" height="4" rx="2" transform="rotate(-45 -0.757324 19.2427)" fill="white" />
                <rect x="7.72803" y="27.728" width="28" height="4" rx="2" transform="rotate(-45 7.72803 27.728)" fill="white" />
                <rect x="10.5366" y="16.3945" width="16" height="4" rx="2" transform="rotate(45 10.5366 16.3945)" fill="white" />
                <rect x="10.5562" y="-0.556152" width="28" height="4" rx="2" transform="rotate(45 10.5562 -0.556152)" fill="white" />
              </svg>
              <h2 className="text-white fw-bold mb-3">Gem Inventory</h2>
              <p className="text-center" style={{ opacity: 0.8, maxWidth: 320 }}>
                Get started organizing your inventory in minutes. Multiple warehouses, strict ledger tracking, and instant reports.
              </p>

              {/* Floating stat pills */}
              <div className="d-flex gap-3 mt-4 flex-wrap justify-content-center">
                {[
                  { label: "Fast Setup", icon: "🚀" },
                  { label: "Secure", icon: "🔒" },
                  { label: "Scalable", icon: "📈" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}
                  >
                    <span>{item.icon}</span>
                    <span className="fw-semibold small">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
