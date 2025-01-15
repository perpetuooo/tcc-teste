import React, { useEffect, useState } from 'react';
import {
  Box,
  Label,
  Input,
  FormGroup,
  Button,
  Text,
  MessageBox,
  Illustration,
} from '@adminjs/design-system';

export type LoginProps = {
  message?: string;
  action: string;
}

export const Login: React.FC<LoginProps> = (props) => {
  const { action, message: propMessage } = props

  const [message, setMessage] = useState<string | undefined>(propMessage)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const error = params.get('error')
    if (error) {
      setMessage(error)
    }
  }, [])

  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    height: '100%',
    background: 'linear-gradient(90deg, #FF7E5F 0%, #FFB347 100%)'
  }

  const globalStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    margin: 0,
    padding: 0,
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    marginTop: '80px',
  }

  const titleStyle: React.CSSProperties = {
    fontFamily: 'Arial',
    fontSize: '44px',
    fontWeight: 'bold',
    marginBottom: '80px',
    marginTop: '40px',
  }

  return (
    <div style={globalStyle}>
      <div style={wrapperStyle}>
        <Box
          as="form"
          action={action}
          method="POST"
          bg="white"
          p="x3"
          boxShadow="0px 6px 20px rgba(0, 0, 0, 0.3)"
          width="450px"
          height="550px"
          style={formStyle}
        >
          <Illustration variant='Padlock' width={250} height={250}></Illustration>
          {/* <div style={titleStyle}>Controle de Acervo</div> */}
          <FormGroup>
            <Label required>Email</Label>
            <Input name="email" placeholder="Email" />
          </FormGroup>
          <FormGroup>
            <Label required>Senha</Label>
            <Input
              type="password"
              name="password"
              placeholder="Senha"
              autoComplete="new-password"
            />
          </FormGroup>
          <Text mt="xxl" textAlign="center">
            <Button variant="primary">Login</Button>
          </Text>
          <Text mt="xl" textAlign="center">
            <a href="/forgot-password" color='blue'>Esqueceu a senha?</a>
          </Text>
        </Box>
      </div>
    </div>
  )
}

export default Login
