"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useSidebar } from "@/components/SidebarProvider";

interface NavbarProps {
  userName?: string;
  userRole?: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar({ userName, userRole }: NavbarProps) {
  const initials = getInitials(userName || "User");
  const { isMini, toggleSidebar } = useSidebar();

  return (
    <nav 
      className="nav navbar navbar-expand-lg navbar-light iq-navbar" 
      style={{ transition: 'all 300ms ease' }}
      suppressHydrationWarning
    >
      <div className="container-fluid navbar-inner">

        {/* Sidebar toggle */}
        <div className="sidebar-toggle" data-toggle="sidebar" data-active="true" onClick={toggleSidebar}>
          <i className="icon">
            <svg width="20px" className="icon-20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
            </svg>
          </i>
        </div>

        {/* Search — always visible */}
        <div className="input-group search-input" style={{ maxWidth: 260 }}>
          <span className="input-group-text" id="search-input">
            <svg className="icon-18" width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11.7669" cy="11.7666" r="8.98856" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M18.0186 18.4851L21.5426 22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input type="search" className="form-control" placeholder="Search..." aria-label="Search" />
        </div>

        {/* Right icons — always visible (NOT inside collapse) */}
        <ul className="mb-0 navbar-nav ms-auto align-items-center navbar-list d-flex flex-row gap-2">

          {/* Notification Bell */}
          <li className="nav-item dropdown">
            <a
              href="#"
              className="nav-link d-flex align-items-center"
              id="notification-drop"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <svg className="icon-22" width="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.7695 11.6453C19.039 10.7923 18.7071 10.0531 18.7071 8.79716V8.37013C18.7071 6.73354 18.3304 5.67907 17.5115 4.62459C16.2493 2.98699 14.1244 2 12.0442 2H11.9558C9.91935 2 7.86106 2.94167 6.577 4.5128C5.71333 5.58842 5.29293 6.68822 5.29293 8.37013V8.79716C5.29293 10.0531 4.98284 10.7923 4.23049 11.6453C3.67691 12.2738 3.5 13.0815 3.5 13.9557C3.5 14.8309 3.78723 15.6598 4.36367 16.3336C5.11602 17.1413 6.17846 17.6569 7.26375 17.7466C8.83505 17.9258 10.4063 17.9933 12.0005 17.9933C13.5937 17.9933 15.165 17.8805 16.7372 17.7466C17.8215 17.6569 18.884 17.1413 19.6363 16.3336C20.2118 15.6598 20.5 14.8309 20.5 13.9557C20.5 13.0815 20.3231 12.2738 19.7695 11.6453Z" fill="currentColor"/>
                <path opacity="0.4" d="M14.0088 19.2283C13.5088 19.1215 10.4627 19.1215 9.96275 19.2283C9.53539 19.327 9.07324 19.5566 9.07324 20.0602C9.09809 20.5406 9.37935 20.9646 9.76895 21.2335C10.2718 21.6273 10.8632 21.877 11.4824 21.9667C11.8123 22.012 12.1482 22.01 12.4901 21.9667C13.1083 21.877 13.6997 21.6273 14.2036 21.2345C14.5922 20.9646 14.8734 20.5406 14.8983 20.0602C14.8983 19.5566 14.4361 19.327 14.0088 19.2283Z" fill="currentColor"/>
              </svg>
              <span className="bg-danger dots"></span>
            </a>
            <div className="p-0 sub-drop dropdown-menu dropdown-menu-end" aria-labelledby="notification-drop" style={{ minWidth: 280 }}>
              <div className="m-0 shadow-none card">
                <div className="py-3 px-3 card-header d-flex justify-content-between bg-primary">
                  <div className="header-title">
                    <h5 className="mb-0 text-white">Notifications</h5>
                  </div>
                </div>
                <div className="p-0 card-body">
                  <a href="#" className="iq-sub-card d-flex align-items-center gap-3 p-3">
                    <div
                      className="rounded-pill bg-soft-primary d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{ width: 40, height: 40 }}
                    >
                      <svg width="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path opacity="0.4" d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#3b8aff"/>
                      </svg>
                    </div>
                    <div className="w-100">
                      <h6 className="mb-0">System Status</h6>
                      <div className="d-flex justify-content-between">
                        <p className="mb-0 text-muted small">All systems operational</p>
                        <small className="text-muted">Just now</small>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </li>

          {/* User Avatar Dropdown */}
          <li className="nav-item dropdown">
            <a
              href="#"
              className="nav-link d-flex align-items-center gap-2"
              id="navbarDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div
                className="rounded-pill bg-primary d-flex align-items-center justify-content-center"
                style={{ width: 36, height: 36, fontWeight: 700, color: "#fff", fontSize: 13, flexShrink: 0 }}
              >
                {initials}
              </div>
            </a>
            <div className="p-0 sub-drop dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown" style={{ minWidth: 220 }}>
              <div className="m-0 shadow-none card">
                {/* Header */}
                <div className="py-3 px-3 card-header d-flex align-items-center gap-3 bg-primary">
                  <div
                    className="rounded-pill bg-white d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 42, height: 42, fontWeight: 700, color: "#3b8aff", fontSize: 15 }}
                  >
                    {initials}
                  </div>
                  <div>
                    <h6 className="mb-1 text-white fw-semibold">{userName || "User"}</h6>
                    {userRole && (
                      <span className="badge bg-white text-primary" style={{ fontSize: "0.65rem" }}>
                        {userRole}
                      </span>
                    )}
                  </div>
                </div>
                {/* Body */}
                <div className="p-0 card-body">
                  <Link href="#" className="iq-sub-card d-flex align-items-center gap-2 px-3 py-2 text-decoration-none text-dark">
                    <svg width="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.9488 14.54C8.498 14.54 5.588 15.104 5.588 17.28C5.588 19.456 8.518 20 11.9488 20C15.399 20 18.31 19.436 18.31 17.261C18.31 15.084 15.38 14.54 11.9488 14.54Z" fill="currentColor"/>
                      <path opacity="0.4" d="M11.949 12.467C14.285 12.467 16.158 10.583 16.158 8.234C16.158 5.883 14.285 4 11.949 4C9.613 4 7.74 5.883 7.74 8.234C7.74 10.583 9.613 12.467 11.949 12.467Z" fill="currentColor"/>
                    </svg>
                    My Profile
                  </Link>
                  <div className="dropdown-divider m-0"></div>
                  <button
                    className="iq-sub-card d-flex align-items-center gap-2 w-100 border-0 bg-transparent text-danger px-3 py-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => signOut({ callbackUrl: "/login" })}
                  >
                    <svg width="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path opacity="0.4" d="M15.016 7.389C14.697 3.374 12.63 1.77 8.082 1.77H7.937C2.916 1.77 1 3.686 1 8.706V15.316C1 20.336 2.916 22.253 7.937 22.253H8.082C12.599 22.253 14.666 20.669 15.006 16.7L15.016 7.389Z" fill="currentColor"/>
                      <path d="M22.955 12.012L19.495 8.552C19.205 8.262 18.735 8.262 18.445 8.552C18.155 8.842 18.155 9.312 18.445 9.602L20.635 11.792H9.295C8.885 11.792 8.545 12.132 8.545 12.542C8.545 12.952 8.885 13.292 9.295 13.292H20.635L18.445 15.482C18.155 15.772 18.155 16.242 18.445 16.532C18.595 16.682 18.795 16.752 18.995 16.752C19.195 16.752 19.395 16.682 19.545 16.532L23.005 13.072C23.295 12.782 22.955 12.012 22.955 12.012Z" fill="currentColor"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </li>
        </ul>

      </div>
    </nav>
  );
}
