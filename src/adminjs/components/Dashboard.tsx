import React, { useState,useEffect } from 'react';
import { Box, H2, Text } from '@adminjs/design-system';
import { ApiClient, ForbiddenError } from 'adminjs';
import EmailsChart from './charts/Emails.tsx';
import LoansByMonth from './charts/LoansByMonth.tsx';
import CategoriesChart from './charts/Categories.tsx';

interface DashboardData {
  card: {
    totalUsers: number
    totalBooks: number
    totalCopies: number
    totalCategories: number
  },
  loansByStatus: {
    status: string
    count: number
  }[],
  loansByDay: Record<string, Record<string, number>> | undefined,
  emails: {
    totalSent: number
    remaining: number
  },
  categories: {
    categoryName: string
    bookCount: number
    totalCopies: number
    availableCopies: number
  }[]
}

const Dashboard: React.FC = () => {

  const [data, setData] = useState<DashboardData | null>(null)
  const api = new ApiClient()

  
  useEffect(() => {
    api.getDashboard<DashboardData>()
      .then((response) => {
        setData(response.data)
      })
      .catch((error) => {
        console.log(error)
        throw new ForbiddenError("Não foi possível exibir o dashboard.")
      })
  }, [])

  const cards = [
    { label: "Usuários", value: data?.card?.totalUsers, color: '#007bff' },
    { label: "Livros", value: data?.card?.totalBooks, color: '#ffc107' },
    { label: "Exemplares", value: data?.card?.totalCopies, color: '#dc3545' },
    { label: "Categorias", value: data?.card?.totalCategories, color: '#6f42c1' },
  ];


  return (
    <Box variant="grey" width="100%" height="100vh" padding="lg">
      <Box display="flex" justifyContent="space-between" marginBottom="xl">
        {cards.map((item, idx) => (
          <Box
            key={idx}
            style={{
              backgroundColor: "#fff",
              width: "23%",
              padding: "25px 30px",
              borderRadius: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <Box style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <Text
                  style={{
                    color: item.color,
                    fontSize: "32px",
                    fontWeight: "bold",
                    lineHeight: 1,
                    margin: 0
                  }}
                >
                  {item.value}
                </Text>
                <Text
                  style={{
                    color: "#6c757d",
                    fontSize: "16px",
                    fontWeight: "bold",
                    margin: 0
                  }}
                >
                  {item.label}
                </Text>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
      <Box display="flex" alignItems="flex-start" marginBottom="xl">
        <Box style={{ width: "65%" }}>
          <H2 style={{ marginBottom: "10px", marginLeft: "10px", color: "#e0631d", fontWeight: "bold", }}>Livros</H2>
          <Box
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              height: "450px",
            }}
          >
            <Box
              style={{
                height: "410px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9f9f9",
                borderRadius: "10px",
              }}
            >
              <CategoriesChart categories={data?.categories} />
            </Box>
          </Box>
        </Box>
        <Box style={{ width: "35%", marginLeft: "20px" }}>
          <H2 style={{ marginBottom: "10px", marginLeft: "10px", color: "#e0631d", fontWeight: "bold", }}>Emails</H2>
          <Box
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
              height: "450px", 
            }}
          >
            <Box
              style={{
                height: "410px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9f9f9",
                borderRadius: "10px",
              }}
            >
              <EmailsChart emails={data?.emails}></EmailsChart>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box style={{ width: "100%" }}>
        <H2 style={{ marginBottom: "10px", marginLeft: "10px", color: "#e0631d", fontWeight: "bold", }}>Empréstimos</H2>
        <Box
          style={{
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            height: "500px",
          }}
        >
          <Box
            style={{
              height: "465px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f9f9f9",
              borderRadius: "10px",
            }}
          >
            <LoansByMonth loansByDay={data?.loansByDay}></LoansByMonth>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
