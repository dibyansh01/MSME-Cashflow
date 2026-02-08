import React from 'react';
import Link from 'next/link';
import { Card } from './Card';

interface StatCardProps {
    title: string;
    value: string | number;
    highlight?: boolean;
    color?: 'default' | 'danger' | 'success' | 'warning' | 'info';
    subtext?: string;
    href?: string;
}

export function StatCard({ title, value, color = 'default', subtext, href }: StatCardProps) {
    const colorMap = {
        default: 'text-foreground',
        danger: 'text-danger',
        success: 'text-success',
        warning: 'text-warning',
        info: 'text-blue-500',
    };

    const cardContent = (
        <Card className={`hover:scale-[1.02] transition-transform h-full ${href ? 'cursor-pointer' : ''}`}>
            <div className="flex flex-col gap-1 h-full justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                        {title}
                    </p>
                    <div className={`text-3xl font-bold ${colorMap[color]}`}>
                        {value}
                    </div>
                </div>
                {subtext && (
                    <p className="text-xs text-gray-400 mt-1">{subtext}</p>
                )}
            </div>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block h-full">
                {cardContent}
            </Link>
        );
    }

    return cardContent;
}
