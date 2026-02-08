'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function DashboardFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [selectedPreset, setSelectedPreset] = useState('next_30')
    const [showCustom, setShowCustom] = useState(false)
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [error, setError] = useState('')

    // Initialize from URL
    useEffect(() => {
        const from = searchParams.get('from')
        const to = searchParams.get('to')
        const preset = searchParams.get('preset')

        if (preset) {
            setSelectedPreset(preset)
            setShowCustom(false)
        } else if (from && to) {
            setSelectedPreset('custom')
            setShowCustom(true)
            setCustomFrom(from)
            setCustomTo(to)
        }
    }, [searchParams])

    // Format Date to YYYY-MM-DD using Local Time
    // prevents timezone shifts (e.g. UTC-1 resulting in previous day)
    const formatDateLocal = (date: Date) => {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const applyPreset = (preset: string) => {
        setSelectedPreset(preset)
        if (preset === 'custom') {
            setShowCustom(true)
            return
        }
        setShowCustom(false)
        setError('')

        const now = new Date()
        let from = new Date()
        let to = new Date()

        // Reset hours to avoid time drift implications during calculation
        // though we allow new Date() to keep current time for 'next_30/7' logic if strict 24h cycle desired
        // but for 'months' we want start of day.

        switch (preset) {
            case 'next_30':
                // Today to +30 days
                from = new Date(now)
                to = new Date(now)
                to.setDate(to.getDate() + 30)
                break

            case 'next_7':
                // Today to +7 days
                from = new Date(now)
                to = new Date(now)
                to.setDate(to.getDate() + 7)
                break

            case 'this_month':
                // 1st of current month to Last day of current month
                from = new Date(now.getFullYear(), now.getMonth(), 1)
                to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                break

            case 'last_month':
                // 1st of previous month to Last day of previous month
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
                to = new Date(now.getFullYear(), now.getMonth(), 0)
                break

            case 'last_3_months':
                // 1st of (M-2) to Last day of Current Month?
                // OR Last 3 COMPLETED months? 
                // Context "Last 3 Months" in dashboards usually means "Trailing 3 Months including current" or "Last 90 days".
                // Let's stick to "Start of 2 months ago" to "End of current month" (Approx 3 month window: M-2, M-1, M)
                from = new Date(now.getFullYear(), now.getMonth() - 2, 1)
                to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
                break
        }

        const fromStr = formatDateLocal(from)
        const toStr = formatDateLocal(to)

        router.push(`?from=${fromStr}&to=${toStr}&preset=${preset}`)
    }

    const applyCustom = () => {
        if (!customFrom || !customTo) {
            setError('Please select both dates')
            return
        }
        if (customFrom > customTo) {
            setError('Start date cannot be after End date')
            return
        }
        setError('')
        router.push(`?from=${customFrom}&to=${customTo}&preset=custom`)
    }

    return (
        <div className="flex flex-col gap-2 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-border">
            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'next_30', label: 'Next 30 Days' },
                    { id: 'next_7', label: 'Next 7 Days' },
                    { id: 'this_month', label: 'This Month' },
                    { id: 'last_month', label: 'Last Month' },
                    { id: 'last_3_months', label: 'Last 3 Months' },
                    { id: 'custom', label: 'Custom Range 📅' },
                ].map((p) => (
                    <button
                        key={p.id}
                        onClick={() => applyPreset(p.id)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${selectedPreset === p.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
                            }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {showCustom && (
                <div className="flex items-end gap-2 mt-2 animate-in slide-in-from-top-2 fade-in">
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">From</label>
                        <input
                            type="date"
                            value={customFrom}
                            onChange={(e) => setCustomFrom(e.target.value)}
                            className="text-sm p-1.5 rounded border border-input bg-background"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground block mb-1">To</label>
                        <input
                            type="date"
                            value={customTo}
                            onChange={(e) => setCustomTo(e.target.value)}
                            className="text-sm p-1.5 rounded border border-input bg-background"
                        />
                    </div>
                    <button
                        onClick={applyCustom}
                        className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black text-sm rounded font-medium hover:opacity-90"
                    >
                        Apply
                    </button>
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    )
}
