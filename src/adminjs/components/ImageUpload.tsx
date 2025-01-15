import React, { useCallback } from 'react';
import { Box, Label, DropZone, DropZoneProps } from '@adminjs/design-system';
import { BasePropertyProps } from 'adminjs';

const ImageUpload: React.FC<BasePropertyProps> = (props) => {
  const { onChange, property } = props

  const handleDrop = useCallback(async (files: Array<File>) => {
    if (files && files.length > 0) {
      const file = files[0]
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Data = reader.result as string

        onChange?.(property.name, base64Data)
      }
      
      // Gera a string no formato "data:image/{ext};base64,{dados}"
      reader.readAsDataURL(file)
    }
  }, [onChange, property])

  const dropZoneProps: DropZoneProps = {
    onChange: handleDrop,
    multiple: false,
    validate: {
      maxSize: 10 * 1024 * 1024, // 10MB
      mimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
    }
  }

  return (
    <Box>
      <Label color="grey60">Imagem</Label>
      <DropZone {...dropZoneProps} />
    </Box>
  )
}

export default ImageUpload
