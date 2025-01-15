import React from 'react';
import { Box, Label, Text } from '@adminjs/design-system';
import { ShowPropertyProps } from 'adminjs';

const ImagePreview: React.FC<ShowPropertyProps> = (props) => {
  const { record } = props;
  const imageUrl = record?.params?.imageUrl;

  if (!imageUrl) {
    return (
      <Box marginBottom="xl">
        <Label color="grey60">Imagem</Label>
        <Text>Nenhuma imagem disponível.</Text>
      </Box>
    );
  }

  return (
    <Box marginBottom="xl">
      <Label color="grey60">Imagem</Label>
      <img 
        src={imageUrl}
        alt="Imagem do livro."
        style={{
          maxWidth: '100%',
          maxHeight: '300px',
          objectFit: 'contain'
        }}
      />
    </Box>
  );
}

export default ImagePreview;
