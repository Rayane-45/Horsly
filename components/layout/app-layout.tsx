"use client"

import type { ReactNode } from "react"
import { AppSidebar } from "./app-sidebar"
import { AppBottomNav } from "./app-bottom-nav"
import { PageHeader } from "./page-header"
import { Toaster } from "@/components/ui/toaster"

interface AppLayoutProps {
  children: ReactNode
  pageTitle: string
  pageSubtitle: string
  primaryAction?: {
    label: string
    onClick: () => void
  }
}

export function AppLayout({ children, pageTitle, pageSubtitle, primaryAction }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      <div className="lg:ml-64 transition-[margin] duration-300 ease-in-out">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <PageHeader title={pageTitle} subtitle={pageSubtitle} primaryAction={primaryAction} />

          <main className="pb-20 lg:pb-8">{children}</main>
        </div>
      </div>

      {/* Bottom Navigation - visible on phone/tablet only */}
      <div className="lg:hidden">
        <AppBottomNav />
      </div>

      <Toaster />
    </div>
  )
}
