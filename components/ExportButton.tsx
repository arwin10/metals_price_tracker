'use client';

interface Holding {
    metal_type: string;
    quantity: number;
    unit: string;
    purchase_price: number;
    purchase_date: string;
    notes?: string;
    currentValue?: number;
    gain?: number;
}

interface ExportButtonProps {
    portfolioName: string;
    holdings: Holding[];
}

export default function ExportButton({ portfolioName, holdings }: ExportButtonProps) {
    const handleExport = () => {
        // Define CSV headers
        const headers = ['Metal', 'Quantity', 'Unit', 'Purchase Price', 'Purchase Date', 'Current Value', 'Gain/Loss', 'Notes'];

        // Map data to rows
        const rows = holdings.map(h => [
            h.metal_type,
            h.quantity,
            h.unit,
            h.purchase_price,
            new Date(h.purchase_date).toLocaleDateString(),
            h.currentValue?.toFixed(2) || '0.00',
            h.gain?.toFixed(2) || '0.00',
            `"${h.notes || ''}"` // Escape notes
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create blob and download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${portfolioName.replace(/\s+/g, '_')}_Holdings.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 gap-2"
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
        </button>
    );
}
