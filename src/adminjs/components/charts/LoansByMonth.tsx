import React, { useRef, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";

ChartJS.register(Title, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

interface LoansByMonthProps {
  loansByDay: Record<string, Record<string, number>> | undefined; // { "09/01": { REQUESTED: 5, ONGOING: 3, ... } }
}

// Mapeamento dos status em inglês para português
const statusTranslation: { [key: string]: string } = {
  REQUESTED: "Solicitados",
  RETURNED: "Retornados",
  OVERDUE: "Atrasados",
  ONGOING: "Em Andamento",
  TERMINATED: "Encerrados",
};

const LoansByMonth: React.FC<LoansByMonthProps> = ({ loansByDay }) => {
  const chartRef = useRef(null);

  if (!loansByDay) {
    return <div>Carregando...</div>;
  }

  const convertToDate = (dateStr: string) => {
    const [day, month] = dateStr.split('/').map(Number);
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    const year = month > currentMonth ? currentYear - 1 : currentYear;
    const date = new Date(year, month - 1, day);

    if (date > today) {
      date.setFullYear(date.getFullYear() - 1);
    }
    
    return date;
  };

  const today = new Date();

  // Filtrar e ordenar as datas
  const labels = Object.keys(loansByDay)
    .filter(dateStr => {
      const date = convertToDate(dateStr);
      return date <= today;
    })
    .sort((a, b) => {
      const dateA = convertToDate(a);
      const dateB = convertToDate(b);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-30); // Pegar apenas os últimos 30 dias

  // Definir os status de empréstimos para criar datasets.
  const statuses = ["REQUESTED", "ONGOING", "OVERDUE", "TERMINATED", "RETURNED"];

  // Construir os datasets dinamicamente para cada status.
  const datasets = statuses.map((status) => ({
    label: statusTranslation[status] || status,
    data: labels.map((label) => loansByDay[label][status] || 0), // Preenche com 0 se não houver dados.
    borderColor: getStatusColor(status), // Cor dinâmica para cada status.
    backgroundColor: "rgba(0,0,0,0)", // Sem preenchimento.
    borderWidth: 2,
    tension: 0,
  }));

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        beginAtZero: true,
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
        ticks: {
          callback: (value: any) => `${value}`,
        },
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Line ref={chartRef} data={data} options={options} />
    </div>
  );
};

// Função para definir cores dinâmicas para cada status.
const getStatusColor = (status: string) => {
  switch (status) {
    case "REQUESTED":
      return "rgba(75, 192, 192, 1)";
    case "ONGOING":
      return "rgba(54, 162, 235, 1)";
    case "OVERDUE":
      return "rgba(255, 99, 132, 1)";
    case "TERMINATED":
      return "rgba(153, 102, 255, 1)";
    case "RETURNED":
      return "rgba(255, 206, 86, 1)";
    default:
      return "rgba(200, 200, 200, 1)";
  }
};

export default LoansByMonth;
