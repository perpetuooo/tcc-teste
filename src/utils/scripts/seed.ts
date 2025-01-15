import { Role, Status, Condition, Action, Entity } from '@prisma/client'
import prisma from '../prisma.ts'
import { hash } from 'bcrypt'
import readline from "readline"
import * as dotenv from 'dotenv';
import axios from 'axios';

const api = axios.create({
  baseURL: `http://${process.env.HOST}:${process.env.PORT}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

dotenv.config()

function askConfirmation(message: string): Promise<boolean> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    })

    return new Promise((resolve) => {
        rl.question(message, (answer) => {
            rl.close()
            resolve(answer.toLowerCase() === 'y')
        })
    })
}

async function main() {
    const confirm = await askConfirmation("Para continuar, será necessário deletar todo banco de dados. Deseja prosseguir? (y/n) ")

    if (!confirm) {
        console.log("Cancelado...")
        return
    }

    console.log('Seedando o banco de dados...')

  // Deleta o banco de dados atual.
  await prisma.$transaction([
    prisma.adminLog.deleteMany(),
    prisma.waitList.deleteMany(),
    prisma.loan.deleteMany(),
    prisma.copy.deleteMany(),
    prisma.book.deleteMany(),
    prisma.category.deleteMany(),
    prisma.user.deleteMany(),
  ])

  // Administrador.
  await prisma.user.create({
    data: {
        name: 'admin',
        email: process.env.ADMIN_EMAIL!,
        phone: '13987654321',
        cpf: '123.456.789-00',
        password: await hash('senha123', 10),
        role: Role.ADMIN
    }
}),

  // Categorias.
  console.log('Criando categorias...')
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Literatura Brasileira' } }),
    prisma.category.create({ data: { name: 'Ficção Científica' } }),
    prisma.category.create({ data: { name: 'Romance' } }),
    prisma.category.create({ data: { name: 'História' } }),
    prisma.category.create({ data: { name: 'Tecnologia' } }),
  ])

  // Usuários.
  console.log('Criando usuários...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '11987654321',
        cpf: '995.575.110-01',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '11987654322',
        cpf: '234.567.890-11',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        phone: '11987654323',
        cpf: '345.678.901-22',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ana Costa',
        email: 'ana.costa@email.com',
        phone: '11987654324',
        cpf: '456.789.012-33',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Lucas Ferreira',
        email: 'lucas.ferreira@email.com',
        phone: '11987654325',
        cpf: '567.890.123-44',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Beatriz Lima',
        email: 'beatriz.lima@email.com',
        phone: '11987654326',
        cpf: '678.901.234-55',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Rafael Almeida',
        email: 'rafael.almeida@email.com',
        phone: '11987654327',
        cpf: '789.012.345-66',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
    prisma.user.create({
      data: {
        name: 'Carolina Martins',
        email: 'carolina.martins@email.com',
        phone: '11987654328',
        cpf: '890.123.456-77',
        password: await hash('senha123', 10),
        role: Role.USER
      }
    }),
  ])

  // Livros.
  console.log('Criando livros...')
  const books = await Promise.all([
    prisma.book.create({
      data: {
        title: 'Grande Sertão: Veredas',
        author: 'João Guimarães Rosa',
        description: 'Uma obra-prima da literatura brasileira que narra a história de Riobaldo.',
        categoryId: categories[0].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/grande-sertao-veredas.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Memórias Póstumas de Brás Cubas',
        author: 'Machado de Assis',
        description: 'Romance que revolucionou a literatura brasileira.',
        categoryId: categories[0].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/memorias-postumas.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Fundação',
        author: 'Isaac Asimov',
        description: 'Primeiro livro da série Fundação.',
        categoryId: categories[1].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/fundacao.jpeg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Duna',
        author: 'Frank Herbert',
        description: 'Uma épica história de ficção científica.',
        categoryId: categories[1].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/duna.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Orgulho e Preconceito',
        author: 'Jane Austen',
        description: 'Um clássico romance da literatura inglesa.',
        categoryId: categories[2].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/orgulho-e-preconceito.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        description: 'Um dos romances mais famosos da literatura brasileira.',
        categoryId: categories[2].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/dom-casmurro.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Brasil: Uma Biografia',
        author: 'Lilia M. Schwarcz',
        description: 'Uma análise abrangente da história do Brasil.',
        categoryId: categories[3].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/brasil-uma-biografia.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: '1808',
        author: 'Laurentino Gomes',
        description: 'Sobre a chegada da família real portuguesa ao Brasil.',
        categoryId: categories[3].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/1808.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        description: 'Um guia para programação mais limpa e eficiente.',
        categoryId: categories[4].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/clean-code.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Algoritmos',
        author: 'Thomas H. Cormen',
        description: 'Uma introdução abrangente aos algoritmos.',
        categoryId: categories[4].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/algoritimos.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'O Senhor dos Anéis',
        author: 'J.R.R. Tolkien',
        description: 'A clássica saga de fantasia.',
        categoryId: categories[2].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/o-senhor-dos-aneis.jpg'
      }
    }),
    prisma.book.create({
      data: {
        title: 'Neuromancer',
        author: 'William Gibson',
        description: 'O romance que definiu o cyberpunk.',
        categoryId: categories[1].id,
        copies: 5,
        copiesAvailable: 5,
        imageUrl: '/public/uploads/neuromancer.jpg'
      }
    }),
  ])

  // Exemplares.
  console.log('Criando exemplares...')
  for (const book of books) {
    await Promise.all(
      Array(5).fill(null).map((_, index) => 
        prisma.copy.create({
          data: {
            bookId: book.id,
            bookTitle: book.title,
            ISBN: `978-85-${String(book.id).padStart(4, '0')}-${String(index).padStart(4, '0')}-${index}`,
            condition: Condition.GOOD,
          }
        })
      )
    )
  }

// Empréstimos
console.log('Criando empréstimos...')
const copies = await prisma.copy.findMany()
const currentDate = new Date()

const loanData = Array(30).fill(null).map(() => {
  const randomUser = users[Math.floor(Math.random() * users.length)]
  const randomBook = books[Math.floor(Math.random() * books.length)]
  const randomCopy = copies.find((copy) => copy.bookId === randomBook.id)

  const randomDaysAgo = Math.floor(Math.random() * 29) + 1
  const loanDate = new Date(currentDate.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000)
  
  // Diversificar a expiração entre 7 e 21 dias após a data do empréstimo
  const randomDaysToExpire = Math.floor(Math.random() * 15) + 7
  const expirationDate = new Date(loanDate.getTime() + randomDaysToExpire * 24 * 60 * 60 * 1000)

  const status = [
    Status.REQUESTED,
    Status.ONGOING,
    Status.RETURNED,
    Status.TERMINATED,
    Status.OVERDUE,
  ][Math.floor(Math.random() * 5)]

  const returnDate =
    status === Status.RETURNED || status === Status.TERMINATED
      ? new Date(loanDate.getTime() + Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
      : null

  return {
    userId: randomUser.id,
    userName: randomUser.name,
    bookId: randomBook.id,
    bookTitle: randomBook.title,
    copyId: randomCopy?.id || null,
    ISBN: randomCopy?.ISBN || '',
    status,
    loanDate: status === Status.REQUESTED ? null : loanDate,
    expirationDate: status === Status.REQUESTED ? null : expirationDate,
    returnDate,
    archived: status === Status.RETURNED || status === Status.TERMINATED
      ? true : false
  }
})

await Promise.all(
  loanData.map(loan => prisma.loan.create({ data: loan }))
)

  console.log('Começando a seed pela API...')
  try {
    const loginResponse = await api.post('/users/login', 
      {
      email: process.env.ADMIN_EMAIL,
      password: 'senha123'
      }
    )
    
    const token = loginResponse.data.access_token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`


    const apiBook = await api.post('/books/register',
      {
        title: 'Romeu e Julieta',
        description: 'Romance trágico.',
        author: 'William Shakespeare',
        category: categories[2].id,
        imageUrl: '/public/uploads/romeu-e-julieta.jpg'
      }
    )

    await api.post('/copies/create',
      {
        bookId: apiBook.data.id,
        ISBN: '9787434054045',
        bookTitle: apiBook.data.title,
        condition: 'GOOD',
      }
    )

    await api.post('/loans/create',
      {
        bookId: apiBook.data.id
      }
    )

    console.log('Seeds completada com sucesso!')
    return
  } catch(err) {
    console.error('Erro ao seedar pela API: ', err)
  }

  console.log('Seed inicial completada com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })