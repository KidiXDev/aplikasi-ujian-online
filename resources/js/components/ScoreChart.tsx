import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { TooltipItem } from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface ScoreChartProps {
    averageScores: {
        benar: number;
        salah: number;
        score: number;
    };
}

const ScoreChart: React.FC<ScoreChartProps> = ({ averageScores }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                text: 'Rata-Rata Soal Benar, Salah, dan Score',
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
                    label: function(tooltipItem: TooltipItem<'bar'>) {
                        return `Rata-Rata: ${tooltipItem.raw}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Jumlah',
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    }
                },
                ticks: {
                    callback: (value: number) => `${value}`
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tipe',
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    }
                }
            }
        },
    };

    const data = {
        labels: ['Soal Benar', 'Soal Salah', 'Score'],
        datasets: [
            {
                label: 'Jumlah',
                data: [averageScores.benar, averageScores.salah, averageScores.score],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(255, 206, 86, 0.6)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 1
            },
        ],
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
            <div className="h-[300px]">
                <Bar options={options} data={data} />
            </div>
        </div>
    );
};

export default ScoreChart;
