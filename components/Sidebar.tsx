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
            { name: 'Settings', href: '/settings', icon: Settings },
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
                    className="fixed inset-0 z-20 bg-black/50 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={cn(
                    'z-50 flex flex-col bg-card border-r transition-[width,transform] duration-300 ease-in-out',
                    isOpen ? 'translate-x-0' : '-translate-x-full md:transform-none',
                    isCollapsed ? 'w-[70px]' : 'w-64',
                )}
                style={{
                    width: isCollapsed ? '70px' : '256px',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    height: '100vh'
                }}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >
                {/* Header */}
                <div className={cn("flex h-16 items-center border-b transition-all duration-300", isCollapsed ? "justify-center px-2" : "justify-between px-4")}>
                    <Link href="/dashboard" className={cn("flex items-center font-bold text-primary transition-all duration-300", isCollapsed ? "text-xs" : "text-xl gap-2")}>
                        <div className={cn("flex items-center justify-center transition-all duration-300", isCollapsed ? "w-full" : "")}>
                            <span className="whitespace-nowrap">CashFlow</span>
                        </div>
                    </Link>
                    {isOpen && (
                        <button onClick={toggleSidebar} className="md:hidden">
                            <X className="h-6 w-6" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-6 p-3 overflow-y-auto overflow-x-hidden">
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.title}>
                            {!isCollapsed && (
                                <h3 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider transition-opacity duration-300 opacity-100">
                                    {group.title}
                                </h3>
                            )}
                            {isCollapsed && groupIndex > 0 && (
                                <div className="border-t my-2 mx-2" />
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
                                                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap',
                                                isActive
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                                isCollapsed && 'justify-center px-2'
                                            )}
                                        >
                                            <item.icon className="h-5 w-5 min-w-[20px]" />
                                            <span className={cn('transition-all duration-300', isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100')}>
                                                {item.name}
                                            </span>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Footer / User */}
                <div className="p-3 border-t space-y-2">
                    <div className={cn("flex items-center gap-3 p-1 overflow-hidden", isCollapsed && "justify-center")}>
                        <div className="w-8 h-8 min-w-[32px] rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center font-bold text-sm">
                            U
                        </div>
                        <div className={cn("text-sm transition-all duration-300 overflow-hidden whitespace-nowrap", isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
                            <p className="font-medium">User</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[120px]">user@example.com</p>
                        </div>
                        {!isCollapsed && (
                            <button className="ml-auto text-muted-foreground hover:text-foreground">
                                <LogOut className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>
            </aside >
        </>
    )
}
