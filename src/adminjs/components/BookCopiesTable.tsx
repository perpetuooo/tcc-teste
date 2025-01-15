import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ApiClient } from 'adminjs';
import { Box, Table, TableRow, TableCell, Badge, CardTitle, Label, Header } from '@adminjs/design-system';

const api = new ApiClient()

interface Copy {
  id: string
  params: {
    ISBN: string
    condition: 'GOOD' | 'BAD'
    isLoaned: boolean
    book: number
  }
}

const BookCopiesTable: React.FC = () => {
  const [copies, setCopies] = useState<Copy[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const recordId: number = Number(location.pathname.split('/').filter(Boolean).slice(-2, -1)[0])

  useEffect(() => {
    const fetchCopies = async () => {
      const response = await api.resourceAction({
        resourceId: 'Copies',
        actionName: 'list',
      })

      if (recordId) {
        const filteredCopies = response.data.records.filter((copy: Copy) =>
          copy.params.book === recordId
        )

        setCopies(filteredCopies)
      }
    }

    fetchCopies()
  }, [recordId])

  const handleRowClick = (copyId: string) => {
    navigate(`/admin/resources/Copies/records/${copyId}/show`)
  }

  return (
    <Box variant="white">
      <Header.H5>Exemplares</Header.H5>
      <Table>
        <thead>
          <TableRow>
            <TableCell><strong>ISBN</strong></TableCell>
            <TableCell><strong>Condição</strong></TableCell>
            <TableCell><strong>Emprestado</strong></TableCell>
          </TableRow>
        </thead>
        <tbody>
          {copies.map((copy: Copy) => (
            <TableRow 
              key={copy.id} 
              onClick={() => handleRowClick(copy.id)} 
              style={{ cursor: 'pointer' }}
            >
              <TableCell>{copy.params.ISBN || 'Não disponível'}</TableCell>
              <TableCell>
                <Badge variant={copy.params.condition === 'GOOD' ? 'success' : 'danger'}>
                  {copy.params.condition === 'GOOD' ? 'BOM' : 'RUIM'}
                </Badge>
              </TableCell>
              <TableCell>
                {copy.params.isLoaned ? <Badge variant="warning">Sim</Badge> : <Badge variant="success">Não</Badge>}
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Box>
  )
}

export default BookCopiesTable
