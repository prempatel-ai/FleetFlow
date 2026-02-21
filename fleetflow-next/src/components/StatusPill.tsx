import React from 'react';

interface StatusPillProps {
    status: string;
}

const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
    const styles: Record<string, string> = {
        'Available': 'bg-success/10 text-success border-success/20',
        'On Trip': 'bg-primary/10 text-primary border-primary/20',
        'In Shop': 'bg-danger/10 text-danger border-danger/20',
        'Out of Service': 'bg-slate-100 text-slate-500 border-slate-200',
        'On Duty': 'bg-success/10 text-success border-success/20',
        'Off Duty': 'bg-slate-100 text-slate-500 border-slate-200',
        'Suspended': 'bg-danger/10 text-danger border-danger/20',
        'Completed': 'bg-success/10 text-success border-success/20',
        'Dispatched': 'bg-primary/10 text-primary border-primary/20',
        'Cancelled': 'bg-danger/10 text-danger border-danger/20',
    };

    return (
        <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${styles[status] || styles['Available']}`}>
            {status}
        </span>
    );
};

export default StatusPill;
