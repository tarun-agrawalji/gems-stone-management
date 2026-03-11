"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { useSidebar } from "@/components/SidebarProvider";

export default function AppLayoutWrapper({ children, user }: { children: React.ReactNode, user: any }) {
  const { isMini } = useSidebar();
  
  return (
    <div className="wrapper" suppressHydrationWarning>
      <Sidebar 
        userRole={user.role}
        userName={user.name || "User"}
        userEmail={user.email || ""}
      />
      
      <main 
        className="main-content" 
        style={{ 
          marginLeft: isMini ? '4.8rem' : '16.2rem',
          transition: 'all 300ms ease'
        }}
      >
        <div className="position-relative iq-banner">
          <Navbar userName={user.name || "User"} userRole={user.role} />
          <div className="iq-navbar-header" style={{ height: 215 }}>
            <div className="container-fluid iq-container">
              <div className="row">
                <div className="col-md-12">
                  <div className="flex-wrap d-flex justify-content-between align-items-center">
                    <div>
                      {/* Dynamic Page Headers will overlap here */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="iq-header-img">
              <img
                src="/hopeui/images/dashboard/top-header.png"
                alt="header"
                className="img-fluid w-100 h-100"
                style={{ objectFit: "cover", objectPosition: "center" }}
              />
            </div>
          </div>
        </div>

        {/* Page content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .content-inner > .container-fluid > div > div:first-child {
              margin-bottom: 90px !important;
            }
          `
        }} />
        <div className="content-inner pb-4 animate-fade-in" style={{ zIndex: 10, position: "relative" }}>
          <div className="container-fluid" style={{ marginTop: "-170px" }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
