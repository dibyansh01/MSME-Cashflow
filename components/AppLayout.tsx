'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { Menu } from 'lucide-react'

export function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(true)

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar
                isOpen={isSidebarOpen}
                isCollapsed={isCollapsed}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                setIsCollapsed={setIsCollapsed}
            />

            <div className="flex flex-col min-h-screen w-full transition-all duration-300 ease-in-out md:pl-[70px]">
                {/* Mobile Header */}
                <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur px-4 md:hidden">
                    <button
                        className="p-2 -ml-2 rounded-md hover:bg-muted"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <span className="font-bold text-lg">CashFlow</span>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}
