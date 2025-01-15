import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

interface EmailsChartProps {
  emails: {
    totalSent: number;
    remaining: number;
  } | undefined;
}

const EmailsChart: React.FC<EmailsChartProps> = ({ emails }) => {
  if (!emails) {
    return <div>Carregando...</div>;
  }

  const { totalSent, remaining } = emails;

  const data = {
    labels: ["Enviados", "Restantes"],
    datasets: [
      {
        data: [totalSent, remaining],
        backgroundColor: [
          "rgba(33,37,41, 0.6)",
          "rgba(154,3,30, 0.6)",
        ],
        borderColor: [
          "rgba(33,37,41, 1)",
          "rgba(154,3,30, 1)",
        ],
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
    // cutout: "40%",
  };

  return (
    <div style={{ width: "100%", height: "95%" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default EmailsChart;
