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
        suppressHydrationWarning
        style={{ 
          marginLeft: isMini ? '4.8rem' : '16.2rem',
          transition: 'all 300ms ease'
        }}
      >
        <div className="position-relative iq-banner" suppressHydrationWarning>
          <Navbar userName={user.name || "User"} userRole={user.role} />
          <div className="iq-navbar-header" style={{ height: 215 }} suppressHydrationWarning>
            <div className="container-fluid iq-container" suppressHydrationWarning>
              <div className="row" suppressHydrationWarning>
                <div className="col-md-12" suppressHydrationWarning>
                  <div className="flex-wrap d-flex justify-content-between align-items-center" suppressHydrationWarning>
                    <div suppressHydrationWarning>
                      {/* Dynamic Page Headers will overlap here */}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="iq-header-img" suppressHydrationWarning>
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
        <div className="content-inner pb-4 animate-fade-in" style={{ zIndex: 10, position: "relative" }} suppressHydrationWarning>
          <div className="container-fluid" style={{ marginTop: "-170px" }} suppressHydrationWarning>
            {children}
          </div>
        </div>
      </main>
    </div>
  );

}
