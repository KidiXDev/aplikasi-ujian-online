import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface PesertaScore {
    nama: string;
    score: number;
}

interface ScoreChartProps {
    pesertaScores: PesertaScore[];
}

const filterOptions = [
    { label: '50', value: 50 },
    { label: '100', value: 100 },
    { label: '200', value: 200 },
    { label: 'Semua', value: 'all' }
];

const ScoreChart: React.FC<ScoreChartProps> = ({ pesertaScores = [] }) => {
    const [filterCount, setFilterCount] = useState<number | 'all'>(50);

    // Data yang akan ditampilkan sesuai filter
    const filteredScores = filterCount === 'all'
        ? pesertaScores
        : pesertaScores.slice(0, filterCount);

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Rekap Nilai Peserta',
                font: {
                    size: 18,
                    weight: 'bold' as const,
                    family: "'Inter', 'Segoe UI', Arial, sans-serif"
                },
                color: '#22223b',
                padding: {
                    top: 16,
                    bottom: 24
                }
            },
            tooltip: {
                backgroundColor: 'rgba(34, 34, 59, 0.95)',
                borderColor: '#a3cef1',
                borderWidth: 1,
                titleColor: '#f8f9fa',
                bodyColor: '#f8f9fa',
                padding: 12,
                displayColors: false,
                callbacks: {
                    title: (items: TooltipItem<'line'>[]) => items[0]?.label ?? '',
                    label: function(tooltipItem: TooltipItem<'line'>) {
                        return `Nilai: ${tooltipItem.raw}`;
                    }
                }
            }
        },
        elements: {
            line: {
                borderWidth: 2,
                borderColor: 'rgba(100, 149, 237, 0.85)',
                backgroundColor: 'rgba(100, 149, 237, 0.10)',
                tension: 0.4,
            },
            point: {
                radius: 3,
                hoverRadius: 6,
                backgroundColor: '#48bfe3',
                borderColor: '#3a86ff',
                borderWidth: 2,
                hitRadius: 10,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(160, 160, 180, 0.12)',
                    borderDash: [4, 4],
                },
                title: {
                    display: true,
                    text: 'Score',
                    font: {
                        size: 13,
                        weight: 'bold' as const,
                        family: "'Inter', 'Segoe UI', Arial, sans-serif"
                    },
                    color: '#495057'
                },
                ticks: {
                    color: '#495057',
                    font: {
                        size: 12
                    }
                }
            },
            x: {
                grid: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Peserta',
                    font: {
                        size: 13,
                        weight: 'bold' as const,
                        family: "'Inter', 'Segoe UI', Arial, sans-serif"
                    },
                    color: '#495057'
                },
                ticks: {
                    color: '#495057',
                    font: {
                        size: 11
                    },
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 30,
                    callback: function(value: string | number /*, index: number, values: unknown[] */) {
                        // @ts-expect-error chart.js context: getLabelForValue is not typed on 'this'
                        const label = this.getLabelForValue(value);
                        return label.length > 10 ? label.slice(0, 10) + '…' : label;
                    }
                }
            }
        },
        layout: {
            padding: {
                left: 16,
                right: 16,
                top: 8,
                bottom: 8
            }
        }
    };

    const data = {
        labels: filteredScores.map(p => p.nama),
        datasets: [
            {
                label: 'Score',
                data: filteredScores.map(p => p.score),
                fill: true,
                borderColor: 'rgba(100, 149, 237, 0.85)',
                backgroundColor: 'rgba(100, 149, 237, 0.10)',
                tension: 0.4,
                pointRadius: 3,
                pointHoverRadius: 6,
                pointBackgroundColor: '#48bfe3',
                pointBorderColor: '#3a86ff',
                pointBorderWidth: 2,
                pointHitRadius: 10,
            },
        ],
    };

    return (
        <div
            className="bg-white rounded-xl border shadow-md p-6 mb-6"
            style={{
                boxShadow: '0 2px 16px 0 rgba(100, 149, 237, 0.07)',
                minHeight: 340,
                transition: 'box-shadow 0.2s',
            }}
        >
            {/* Filter jumlah data */}
            <div className="flex items-center mb-4">
                <label className="mr-2 text-sm text-gray-700 font-medium">Tampilkan</label>
                <select
                    className="border rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-400"
                    value={filterCount}
                    onChange={e => {
                        const val = e.target.value;
                        setFilterCount(val === 'all' ? 'all' : parseInt(val));
                    }}
                >
                    {filterOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <span className="ml-2 text-sm text-gray-500">data</span>
            </div>
            <div className="h-[320px] w-full">
                <Line options={options} data={data} />
            </div>
        </div>
    );
};

export default ScoreChart;
