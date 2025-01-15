import { locales as AdminJSLocales } from 'adminjs';

export const customLocale = {
    language: 'pt-BR',
    availableLanguages: Object.keys(AdminJSLocales),
    localeDetection: true,
    translations: {
      'pt-BR': {
        pages: {
          settings: "Configurações"
        },
        labels: {
          Navigation: 'Navegação',
          Users: 'Usuários',
          Books: 'Livros',
          Copies: 'Exemplares',
          Loans: 'Empréstimos',
          ActiveLoans: 'Ativos',
          ArchivedLoans: 'Arquivados',
          Categories: 'Categorias',
          Others: 'Outros',
          Logs: 'Registros',
          confirm: 'Confirmação',
          loginWelcome: 'Controle de Acervo',
          condition: {
            GOOD: 'BOM',
            BAD: 'RUIM',
          },
          status: {
            REQUESTED: 'SOLICITADO',
            ONGOING: 'EM ANDAMENTO',
            RETURNED: 'RETORNADO',
            TERMINATED: 'ENCERRADO',
            OVERDUE: 'ATRASADO',
          },
          action: {
            START: 'INICIAR',
            CREATE: 'CRIAR',
            UPDATE: 'ATUALIZAR',
            DELETE: 'DELETAR',
            RETURN: 'RETORNAR',
            TERMINATE: 'ENCERRAR',
          },
          role: {
            USER: 'USUÁRIO',
            ADMIN: 'ADMINISTRADOR',
          },
        },
        actions: {
          add: 'Adicionar'
        },
        buttons: {
          confirm: 'Confirmar',
          cancel: 'Cancelar',
        },
        properties: {
          status: {
            ONGOING: 'EM ANDAMENTO',
            REQUESTED: 'SOLICITADO',
            OVERDUE: 'ATRASADO',
            RETURNED: 'RETORNADO',
            TERMINATED: 'ENCERRADO',
          },
          role: {
            USER: 'USUÁRIO',
            ADMIN: 'ADMINISTRADOR',
          },
          condition: {
            GOOD: 'BOM',
            BAD: 'RUIM',
          },
          action: {
            START: 'INICIAR',
            CREATE: 'CRIAR',
            UPDATE: 'ATUALIZAR',
            DELETE: 'DELETAR',
            RETURN: 'RETORNAR',
            TERMINATE: 'ENCERRAR',
          },
          entityType: {
            USER: 'USUÁRIO',
            BOOK: 'LIVRO',
            CATEGORY: 'CATEGORIA',
            COPY: 'EXEMPLAR',
            LOAN: 'EMPRÉSTIMO',
          },
          image: {
            image: 'Imagem'
          },
        },
        resources: {
          Users: {
            properties: {
              id: 'ID',
              name: 'Nome',
              email: 'E-mail',
              phone: 'Telefone',
              cpf: 'CPF',
              role: 'Função',
              isBlocked: 'Bloqueado',
              createdAt: 'Data de Criação',
              updatedAt: 'Última Atualização',
            },
            labels: {
              isBlocked: {
                true: 'Sim',
                false: 'Não',
              },
            },
          },
          Books: {
            properties: {
              id: 'ID',
              title: 'Título',
              author: 'Autor',
              description: 'Descrição',
              category: 'Categoria',
              copies: 'Exemplares',
              copiesAvailable: 'Exemplares Disponíveis',
              createdAt: 'Data de Criação',
              updatedAt: 'Última Atualização',
              image: 'Imagem',
            },
            actions: {
              add: 'Adicionar exemplar'
            }
          },
          Copies: {
            properties: {
              id: 'ID',
              book: 'Livro',
              ISBN: 'ISBN',
              condition: 'Condição',
              isLoaned: 'Emprestado',
              createdAt: 'Data de Criação',
              updatedAt: 'Última Atualização',
            },
            labels: {
              isLoaned: {
                true: 'Sim',
                false: 'Não',
              },
            },
          },
          Categories: {
            properties: {
              id: 'ID',
              name: 'Nome',
              booksCount: '# Livros',
            },
          },
          ActiveLoans: {
            properties: {
              id: 'ID',
              userName: 'Usuário',
              user: 'Usuário',
              bookTitle: 'Livro',
              book: 'Livro',
              ISBN: 'ISBN',
              expirationDate: 'Expira em:',
              loanDate: 'Data do Empréstimo',
              returnDate: 'Data de Devolução',
              status: 'Status',
              postponed: 'Adiado',
            },
            labels: {
              postponed: {
                true: 'Sim',
                false: 'Não',
              },
            },
            actions: {
              start: 'Iniciar',
              terminate: 'Encerrar',
              return: 'Concluir',
            },
          },
          ArchivedLoans: {
            properties: {
              id: 'ID',
              userName: 'Usuário',
              bookTitle: 'Livro',
              ISBN: 'ISBN',
              expirationDate: 'Data de Expiração',
              loanDate: 'Data do Empréstimo',
              returnDate: 'Data da Devolução',
              status: 'Status',
              postponed: 'Adiado',
            },
            labels: {
              postponed: {
                true: 'Sim',
                false: 'Não',
              },
            },
          },
          Logs: {
            properties: {
              id: 'ID',
              adminId: 'ID do Administrador',
              adminName: 'Administrador',
              action: 'Ação',
              entityType: 'Entidade',
              entityId: 'ID da Entidade',
              entityName: 'Nome da Entidade',
              time: 'Data',
            }
          }
        },
      },
    },
  }
  