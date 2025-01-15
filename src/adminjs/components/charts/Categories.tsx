import React from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface CategoriesChartProps {
  categories: {
    categoryName: string;
    bookCount: number;
    totalCopies: number;
    availableCopies: number;
  }[] | undefined;
}

const CategoriesChart: React.FC<CategoriesChartProps> = ({ categories }) => {
  if (!categories || categories.length === 0) {
    return <div>Carregando...</div>;
  }

  const labels = categories.map((category) => category.categoryName);
  const bookCounts = categories.map((category) => category.bookCount);
  const totalCopies = categories.map((category) => category.totalCopies);
  const availableCopies = categories.map((category) => category.availableCopies);

  const data = {
    labels,
    datasets: [
      {
        label: "Livros Totais",
        data: bookCounts,
        backgroundColor: "rgba(0, 38, 66, 0.6)",
        borderColor: "rgba(0, 38, 66, 1)",
        borderWidth: 1,
      },
      {
        label: "Exemplares Totais",
        data: totalCopies,
        backgroundColor: "rgba(229, 149, 0, 0.6)",
        borderColor: "rgba(229, 149, 0, 1)",
        borderWidth: 1,
      },
      {
        label: "Exemplares Disponíveis",
        data: availableCopies,
        backgroundColor: "rgba(255, 77, 109, 0.6)",
        borderColor: "rgba(255, 77, 109, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false,
          color: "rgba(200, 200, 200, 0.2)",
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "95%" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default CategoriesChart;
