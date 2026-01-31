import React from 'react';
import { Card } from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    highlight?: boolean;
    color?: 'default' | 'danger' | 'success' | 'warning';
    subtext?: string;
}

export function StatCard({ title, value, color = 'default', subtext }: StatCardProps) {
    const colorMap = {
        default: 'text-foreground',
        danger: 'text-danger',
        success: 'text-success',
        warning: 'text-warning',
    };

    return (
        <Card className="hover:scale-[1.02] transition-transform">
            <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {title}
                </p>
                <div className={`text-3xl font-bold ${colorMap[color]}`}>
                    {value}
                </div>
                {subtext && (
                    <p className="text-xs text-gray-400 mt-1">{subtext}</p>
                )}
            </div>
        </Card>
    );
}
