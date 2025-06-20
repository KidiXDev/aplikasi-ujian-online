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
        listening: number;
        structure: number;
        reading: number;
        overall: number;
    };
}

const ScoreChart: React.FC<ScoreChartProps> = ({ averageScores }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    font: {
                        size: 12
                    }
                }
            },
            title: {
                display: true,
                text: 'Average Test Scores',
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
                callbacks: {                    label: (context: { raw: number }) => {
                        return `Score: ${context.raw.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                title: {
                    display: true,
                    text: 'Score',
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
                    text: 'Sections',
                    font: {
                        size: 12,
                        weight: 'bold' as const
                    }
                }
            }
        },
    };

    const data = {
        labels: ['Listening', 'Structure', 'Reading', 'Overall'],
        datasets: [
            {
                label: 'Average Score',
                data: [
                    averageScores.listening,
                    averageScores.structure,
                    averageScores.reading,
                    averageScores.overall
                ],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)',
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)',
                ],
                borderWidth: 1,
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
