import React, { useState } from 'react';
import { Box, Button, Label, Select, Input } from '@adminjs/design-system';
import { useNotice } from 'adminjs';

const NewCopyForm: React.FC = () => {
  const [ISBN, setISBN] = useState<string>('')
  const [condition, setCondition] = useState<string | undefined>(undefined)
  const sendNotice = useNotice()

  const options = [
    { value: 'GOOD', label: 'BOM' },
    { value: 'BAD', label: 'RUIM' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    if (!ISBN || !condition) {
      sendNotice({ message: 'Todos os campos são obrigatórios.', type: 'error' })
      return
    }
  
    const bookId = location.pathname.match(/\/Books\/records\/(\d+)\/add/)?.[1] || ''
  
    try {
      const response = await fetch('/admin/api/resources/Books/actions/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ISBN,
          condition,
          bookId,
        }),
      })
  
      const data = await response.json()
  
      if (!response.ok || data.notice?.type === 'error') {
        const errorMessage = data.notice?.message || 'Erro ao criar exemplar. Tente novamente.'
        throw new Error(errorMessage)
      }

      sendNotice({
        message: data.notice?.message || 'Exemplar criado com sucesso!',
        type: 'success',
      })

      window.location.href = `/admin/resources/Books/records/${bookId}/show`
    } catch (err: any) {
      console.error(err)
  
      sendNotice({
        message: err.message || 'Erro ao criar exemplar. Tente novamente.',
        type: 'error',
      })
    }
  }

  return (
    <Box variant="grey">
      <Box variant="white" p="xl" width={1}>
        <Box as="form" onSubmit={handleSubmit} mt="lg">
          <Box mb="xl"> 
            <Label required>ISBN</Label>
            <Input
              placeholder="Digite o ISBN"
              value={ISBN}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setISBN(e.target.value)}
              required
              width={1}
            />
          </Box>
          <Box mb="lg" width={1}>
            <Label required>Condição</Label>
            <Select
              options={options}
              placeholder="Selecione..."
              value={options.find((opt) => opt.value === condition)}
              onChange={(selected) => setCondition(selected?.value)}
            />
          </Box>
          <Box textAlign="center" mt="xl">
            <Button variant="contained" size="default" type="submit" mx="auto" my="auto" ml="600px" mr="600px" display="flex" mt='xl'>
              Salvar
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default NewCopyForm
