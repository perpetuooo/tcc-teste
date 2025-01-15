import React from 'react';
import { ActionProps } from 'adminjs';

const CategoryBookCount: React.FC<ActionProps> = (props) => {
  const { record } = props
  const categoryId = record?.params?.id

  // Obtém a contagem de livros diretamente dos parâmetros do record
  const bookCount = record?.params?.books ?? 0
  
  const bookListUrl = `/admin/resources/Books?page=1&filters.category=${categoryId}`

  return (
    <div>
      <a style={{ color: '#e0631d', display: 'flex' }} href={bookListUrl}>{bookCount}</a>
    </div>
  )
}

export default CategoryBookCount
