import React, { useState, useEffect } from 'react'
import { Box, Button, H2, Input, Label, Text } from '@adminjs/design-system'
import { useNotice, ApiClient } from 'adminjs'

interface ConfigData {
  loanDuration: number
  postponeLoanDuration: number
  maxBooksLimit: number
  startLoanLimit: number
  mainEmailInterval: number
  retryEmailInterval: number
  dailyEmailLimit: number
}

interface ApiResponse {
  data: {
    config?: ConfigData
    notice?: {
      message: string
      type: string
    }
  }
}

const ConfigPage: React.FC = () => {
  const [config, setConfig] = useState<ConfigData>({
    loanDuration: 0,
    postponeLoanDuration: 0,
    maxBooksLimit: 0,
    startLoanLimit: 0,
    mainEmailInterval: 0,
    retryEmailInterval: 0,
    dailyEmailLimit: 0,
  })
  const [loading, setLoading] = useState(false)
  const addNotice = useNotice()
  const api = new ApiClient()

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.getPage({
          pageName: 'settings',
        }) as ApiResponse

        if (response.data.config) {
          setConfig(response.data.config)
        }
      } catch (error) {
        addNotice({
          message: 'Erro ao carregar configurações',
          type: 'error',
        })
      }
    }

    fetchConfig()
  }, [])

  const handleInputChange = (name: keyof ConfigData) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value)
    setConfig(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    try {
      const response = await api.getPage({
        pageName: 'settings',
        method: 'post',
        data: config,
      }) as ApiResponse

      addNotice({
        message: 'Configurações salvas com sucesso!',
        type: 'success',
      })

      if (response.data.config) {
        setConfig(response.data.config)
      }
    } catch (error) {
      addNotice({
        message: 'Erro ao salvar configurações',
        type: 'error',
      })
    }
    setLoading(false)
  }

  return (
    <Box variant="grey">
      <Box variant="white" padding="24px">
        <H2 style={{color: "#e0631d", fontWeight: "bold",}}>Configurações do Sistema</H2>
        <form onSubmit={handleSubmit}>
          <Box margin="24px">
            <Label htmlFor="loanDuration" marginBottom="8px">Duração de empréstimos (dias)*</Label>
            <Input
              id="loanDuration"
              type="number"
              value={config.loanDuration}
              onChange={handleInputChange('loanDuration')}
            />
          </Box>

          <Box margin="24px">
            <Label htmlFor="postponeLoanDuration" marginBottom="8px">Duração da extensão de empréstimos (dias)*</Label>
            <Input
              id="postponeLoanDuration"
              type="number"
              value={config.postponeLoanDuration}
              onChange={handleInputChange('postponeLoanDuration')}
            />
          </Box>

          <Box margin="24px">
            <Label htmlFor="maxBooksLimit" marginBottom="8px">Limite máximo de livros emprestados por usuário</Label>
            <Input
              id="maxBooksLimit"
              type="number"
              value={config.maxBooksLimit}
              onChange={handleInputChange('maxBooksLimit')}
            />
          </Box>

          <Box margin="24px">
            <Label htmlFor="startLoanLimit" marginBottom="8px">Limite para o início de empréstimos (dias)*</Label>
            <Input
              id="startLoanLimit"
              type="number"
              value={config.startLoanLimit}
              onChange={handleInputChange('startLoanLimit')}
            />
          </Box>

          <Box margin="24px">
            <Label htmlFor="mainEmailInterval" marginBottom="8px">Intervalo principal de emails notificando usuários atrasados (dias)</Label>
            <Input
              id="mainEmailInterval"
              type="number"
              value={config.mainEmailInterval}
              onChange={handleInputChange('mainEmailInterval')}
            />
          </Box>

          <Box margin="24px">
            <Label htmlFor="retryEmailInterval" marginBottom="8px">Intervalo de reenvio de emails notificando usuários atrasados (dias)</Label>
            <Input
              id="retryEmailInterval"
              type="number"
              value={config.retryEmailInterval}
              onChange={handleInputChange('retryEmailInterval')}
            />
          </Box>

          <Box margin="24px">
            <Label htmlFor="dailyEmailLimit" marginBottom="8px">Limite diário de envio de emails</Label>
            <Input
              id="dailyEmailLimit"
              type="number"
              value={config.dailyEmailLimit}
              onChange={handleInputChange('dailyEmailLimit')}
            />
          </Box>

          <Box display="flex" flexDirection="column" alignItems="center" marginTop="48px">
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </form>

        <Text variant="sm" marginTop="24px">
          *Algumas mudanças só terão efeito para empréstimos ainda não iniciados. Empréstimos em andamento continuarão seguindo as configurações já aplicadas no momento de sua criação.
        </Text>
      </Box>
    </Box>
  )
}


export default ConfigPage