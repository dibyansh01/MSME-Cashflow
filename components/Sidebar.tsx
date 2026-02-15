'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Users,
    CreditCard,
    PieChart,
    Settings,
    X,
    Store,
    ChevronLeft,
    ChevronRight,
    LogOut,
    ListTodo,
    ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
    isOpen: boolean
    isCollapsed: boolean
    toggleSidebar: () => void
    setIsCollapsed: (value: boolean) => void
}

const navGroups = [
    {
        title: 'Overview',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Cash Flow', href: '/cash-flow', icon: PieChart },
        ]
    },
    {
        title: 'Cash In',
        items: [
            { name: 'Invoices', href: '/invoices', icon: FileText },
            { name: 'Customers', href: '/customers', icon: Users },
            { name: 'Follow-ups', href: '/followups', icon: ListTodo },
        ]
    },
    {
        title: 'Cash Out',
        items: [
            { name: 'Vendor Invoices', href: '/vendor-invoices', icon: FileText },
            { name: 'Payables Queue', href: '/payables-queue', icon: ClipboardList },
            { name: 'Expenses', href: '/expenses', icon: CreditCard },
            { name: 'Vendors', href: '/vendors', icon: Store },
        ]
    },
    {
        title: 'System',
        items: [
            { name: 'Reports', href: '/reports', icon: PieChart },
        ]
    }
]

export function Sidebar({ isOpen, isCollapsed, toggleSidebar, setIsCollapsed }: SidebarProps) {
    const pathname = usePathname()

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 2xl:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'z-50 flex-col bg-[#0f172a] border-r border-[#1e293b] transition-[width,transform] duration-300 ease-in-out h-screen',
                    // Logic: Hidden on mobile when closed. Visible (Flex) on mobile when open. Always Flex on Desktop (2xl).
                    isOpen ? 'flex translate-x-0' : 'hidden 2xl:flex 2xl:translate-x-0',
                    isCollapsed ? 'w-[80px]' : 'w-72',
                )}
                style={{
                    width: isCollapsed ? '80px' : '288px',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh',
                    backgroundColor: '#0f172a'
                }}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >
                {/* Header */}
                <div className={cn("flex h-16 items-center transition-all duration-300 border-b border-[#1e293b] shrink-0", isCollapsed ? "justify-center px-2" : "justify-between px-6")}>
                    <Link href="/dashboard" className={cn("flex items-center font-bold text-white transition-all duration-300", isCollapsed ? "justify-center" : "gap-3")}>
                        <div className="relative flex items-center h-12 px-3">
                            {/* Full logo */}
                            <span
                                className={cn(
                                    "text-white font-bold whitespace-nowrap text-2xl",
                                    isCollapsed ? "hidden" : "block"
                                )}
                            >
                                CashFlow
                            </span>

                            {/* Collapsed logo */}
                            <span
                                className={cn(
                                    "absolute left-1/2 -translate-x-1/2 text-white font-extrabold text-xl",
                                    isCollapsed ? "block" : "hidden"
                                )}
                            >
                                CF
                            </span>
                        </div>
                    </Link>
                    {!isCollapsed && (
                        <button onClick={toggleSidebar} className="2xl:hidden text-white hover:text-orange-500">
                            <X className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-6 p-4 overflow-y-auto overflow-x-hidden custom-scrollbar min-h-0">
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.title}>
                            {!isCollapsed && (
                                <h3
                                    className="mb-2 px-4 text-xs font-bold uppercase tracking-wider transition-opacity duration-300 opacity-100"
                                    style={{ color: '#f1f5f9' }} // Force color with inline style
                                >
                                    {group.title}
                                </h3>
                            )}
                            {isCollapsed && groupIndex > 0 && (
                                <div className="border-t border-[#1e293b] my-4 mx-4" />
                            )}

                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const isActive = pathname.startsWith(item.href)
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            title={isCollapsed ? item.name : undefined}
                                            className={cn(
                                                'flex items-center gap-4 px-4 py-3 text-[15px] font-medium rounded-xl transition-all duration-200 whitespace-nowrap group relative overflow-hidden',
                                                isActive
                                                    ? '!bg-[#ea580c] !text-white shadow-lg shadow-orange-900/20'
                                                    : '!text-[#f1f5f9] hover:bg-[#1e293b] hover:text-white',
                                                isCollapsed && 'justify-center px-0 w-12 h-12 mx-auto rounded-lg'
                                            )}
                                            style={{
                                                backgroundColor: isActive ? '#ea580c' : undefined,
                                                color: isActive ? '#ffffff' : '#f1f5f9'
                                            }}
                                        >
                                            <item.icon className={cn("transition-transform duration-300 shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5", isActive && !isCollapsed && "scale-110")} />
                                            <span className={cn('block transition-all duration-300 overflow-hidden', isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto transform translate-x-0')}>
                                                {item.name}
                                            </span>

                                            {/* Tooltip for collapsed state (hover only) */}
                                            {isCollapsed && (
                                                <div className="absolute left-full ml-4 bg-[#1e293b] text-white px-3 py-1.5 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none drop-shadow-lg hidden 2xl:block border border-[#334155]">
                                                    {item.name}
                                                    <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-[#1e293b]" />
                                                </div>
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer / User */}
                <div className="p-4 border-t border-[#1e293b] space-y-2 mt-auto bg-[#0f172a]/50 backdrop-blur-sm shrink-0">
                    {/* Settings */}
                    <Link
                        href="/settings"
                        title={isCollapsed ? 'Settings' : undefined}
                        className={cn(
                            'flex items-center gap-4 px-4 py-3 text-[15px] font-medium rounded-xl transition-all duration-200 whitespace-nowrap group relative overflow-hidden',
                            pathname.startsWith('/settings')
                                ? '!bg-[#ea580c] !text-white shadow-lg shadow-orange-900/20'
                                : '!text-[#f1f5f9] hover:bg-[#1e293b] hover:text-white',
                            isCollapsed && 'justify-center px-0 w-12 h-12 mx-auto rounded-lg'
                        )}
                        style={{
                            backgroundColor: pathname.startsWith('/settings') ? '#ea580c' : undefined,
                            color: pathname.startsWith('/settings') ? '#ffffff' : '#f1f5f9'
                        }}
                    >
                        <Settings className={cn("transition-transform duration-300 shrink-0", isCollapsed ? "h-6 w-6" : "h-5 w-5", pathname.startsWith('/settings') && !isCollapsed && "scale-110")} />
                        <span className={cn('block transition-all duration-300 overflow-hidden', isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto transform translate-x-0')}>
                            Settings
                        </span>

                        {/* Tooltip for collapsed state */}
                        {isCollapsed && (
                            <div className="absolute left-full ml-4 bg-[#1e293b] text-white px-3 py-1.5 rounded-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-[60] pointer-events-none drop-shadow-lg hidden 2xl:block border border-[#334155]">
                                Settings
                                <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-[#1e293b]" />
                            </div>
                        )}
                    </Link>

                    <div className={cn("flex items-center gap-4 p-2 rounded-xl transition-colors hover:bg-[#1e293b] cursor-pointer group", isCollapsed && "justify-center p-0 hover:bg-transparent")}>
                        <div className="w-10 h-10 min-w-[40px] rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md ring-2 ring-[#1e293b] group-hover:ring-[#334155] transition-all shrink-0">
                            U
                        </div>
                        <div className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100 flex-1')}>
                            <p className="font-semibold text-white text-sm">User Name</p>
                            <p className="text-xs text-[#cbd5e1] truncate max-w-[140px]">user@example.com</p>
                        </div>
                        {!isCollapsed && (
                            <button className="text-[#cbd5e1] hover:text-white transition-colors p-1.5 rounded-lg hover:bg-[#334155]">
                                <LogOut className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </aside >
        </>
    )
}
