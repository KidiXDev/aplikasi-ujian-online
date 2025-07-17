import { Copy, RefreshCw } from 'lucide-react';

export interface TokenMenuProps {
    currentToken: {
        token: string;
        waktu: string | null;
        status: number;
    };
    isGenerating: boolean;
    copyTokenToClipboard: () => void;
    generateNewToken: () => void;
    formatDateTime: (dateString: string | null) => string;
}

export function TokenMenu({ currentToken, isGenerating, copyTokenToClipboard, generateNewToken, formatDateTime }: TokenMenuProps) {
    return (
        <div className="w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
            {/* Compact Header */}
            <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-blue-50">
                        <Copy className="h-3 w-3 text-blue-600" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900">Token Ujian</h3>
                </div>
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        currentToken.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                >
                    {currentToken.status === 1 ? 'Aktif' : 'Tidak Aktif'}
                </span>
            </div>

            {/* Compact Token Display */}
            <div className="mb-2 text-center">
                <div
                    className="cursor-pointer rounded border-2 border-dashed border-gray-300 bg-gray-50 px-3 py-1.5 transition-colors hover:border-blue-400 hover:bg-blue-50"
                    onClick={copyTokenToClipboard}
                >
                    <span className="font-mono text-lg font-bold text-gray-800 select-all">{currentToken.token}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">Klik untuk menyalin</p>
            </div>

            {/* Compact Last Updated */}
            <div className="mb-2 rounded bg-gray-50 p-1.5">
                <p className="text-center text-xs text-gray-600">
                    Update: <span className="font-medium">{currentToken.waktu ? formatDateTime(currentToken.waktu) : '-'}</span>
                </p>
            </div>

            {/* Compact Action Button */}
            <button
                onClick={generateNewToken}
                disabled={isGenerating}
                className="flex w-full items-center justify-center gap-1.5 rounded bg-green-600 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
            >
                <RefreshCw className={`h-3 w-3 ${isGenerating ? 'animate-spin' : ''}`} />
                {isGenerating ? 'Generating...' : 'Buat Baru'}
            </button>
        </div>
    );
}
