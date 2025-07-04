import React from 'react';
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

const ScoreChart: React.FC<ScoreChartProps> = ({ pesertaScores = [] }) => {
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
                    size: 16,
                    weight: 'bold' as const
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            tooltip: {
                callbacks: {
                    label: function(tooltipItem: TooltipItem<'line'>) {
                        return `Score: ${tooltipItem.raw}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Score',
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    }
                },
                ticks: {
                    callback: (tickValue: string | number) => `${tickValue}`
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Peserta',
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    }
                }
            }
        },
    };

    const data = {
        labels: pesertaScores.map(p => p.nama),
        datasets: [
            {
                label: 'Score',
                data: pesertaScores.map(p => p.score),
                fill: false,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.3)',
                tension: 0.3,
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
            <div className="h-[300px]">
                <Line options={options} data={data} />
            </div>
        </div>
    );
};

export default ScoreChart;
