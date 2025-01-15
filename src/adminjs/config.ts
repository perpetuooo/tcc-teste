import { newBookApiHandler, editBookApiHandler, deleteBookApiHandler, newCopyApiHandler, editCopyApiHandler, deleteCopyApiHandler, deleteCategoryApiHandler, newCategoryApiHandler } from './handlers/books.ts';
import { startLoanApiHandler, returnLoanApiHandler, terminateLoanApiHandler } from './handlers/loans.ts';
import { activeLoansBeforeHook, archivedLoansBeforeHook, populateBooksHook, populateDashboardHandler, settingsPageHandler } from './handlers/utils.ts';
import { editUserApiHandler, deleteUserApiHandler } from './handlers/users.ts';
import { ActionContext, ActionRequest, ActionResponse } from 'adminjs';
import { componentLoader, Components } from './comp.loader.ts';
import { getModelByName } from '@adminjs/prisma';
// import uploadFeature from '@adminjs/upload';
import { customLocale } from './locale.ts';
import prisma from '../utils/prisma.ts';

export const adminConfig = {
  databases: [],
  rootPath: '/admin',
  loginPath: '/admin/login',
  logoutPath: '/admin/logout',
  dashboard: {
    component: Components.Dashboard,
    handler: populateDashboardHandler,
  },
  pages: {
    settings: {
      icon: 'Settings',
      handler: settingsPageHandler,
      component: Components.Settings,
    },
  },
  branding: {
    companyName: 'Controle de Acervo',
    logo: '/public/logo-racnege.png',
    favIcon: '/public/favicon.ico',
    theme: {
        colors: {
          primary100: '#e0631d', //'#4268F6', 
          primary80:  '#6483F8', // '#ED7A3E',
          primary60: '#EF9368', //'#879FFA',
          primary40: '#F1AC91', //'#A9BAFA',
          primary20: '#F3C5BB', //'#CBD5FD',
          // accent: '#38CAF1',
          // love: '#e6282b',
          // grey100: '#1C1C38',
          // grey80: '#454655',
          // grey60: '#898A9A',
          // grey40: '#C0C0CA',
          // grey20: '#F6F7FB',
          // white: '#fff',
          // errorDark: '#DE405D',
          // error: '#FF4567',
          // errorLight: '#FFA5B5',
          // successDark: '#32A887',
          // success: '#70C9B0',
          // successLight: '#DBF0F1',
          // infoDark: '#4268F6',
          // info: '#879FFA',
          // infoLight: '#CBD5FD',
          // filterBg: '#343F87',
          // hoverBg: '#535B8E',
          // inputBorder: '#898A9A',
          // border: '#DDE1E5',  
          // separator: '#C0C0CA',
          // highlight: '#F6F7FB',
          // bg: '#F6F7FB',
      },
    },
    softwareBrothers: false,
    withMadeWithLove: false,
  },
  resources: [
    {
      resource: { model: getModelByName('User'), client: prisma },
      options: {
        id: 'Users',
        navigation: { icon: "Users" },
        actions: { 
          show: { showInDrawer: true },
          new: { isAccessible: false },
          edit: {
            handler: editUserApiHandler
          },
          delete: {
            guard: 'Tem certeza de que deseja excluir este usuário?', 
            handler: deleteUserApiHandler
          },
          bulkDelete: { isAccessible: false },
        },
        properties: {
          role: {
            availableValues: [ 
              { value: 'USER' },
              { value: 'ADMIN' },
            ]
          },
          isBlocked: {
            availableValues: [
              { value: true },
              { value: false },
            ]
          },
        },
        listProperties: ['name', 'email', 'phone', 'role'],
        filterProperties: ['id', 'name', 'email', 'role', 'isBlocked'],
        editProperties: ['email', 'phone', 'role', 'isBlocked'],
        showProperties: ['id', 'name', 'email', 'phone', 'cpf', 'role', 'createdAt', 'updatedAt', 'isBlocked'],
      },
    },
    {
      resource: { model: getModelByName('Book'), client: prisma },
      options: {
        id: 'Books',
        navigation: { icon: "Book" },
        actions: {
          new: { handler: newBookApiHandler },
          add: {  
            actionType: 'record',
            handler: newCopyApiHandler,
            icon: 'PlusCircle',
            label: 'Adicionar Exemplar',
            component: Components.NewCopyForm
          },
          edit: { 
            handler: editBookApiHandler, 
          },
          delete: {
            guard: 'Tem certeza de que deseja excluir este livro?', 
            handler: deleteBookApiHandler
          },
          bulkDelete: { isAccessible: false },
        },
        properties: {
          category: {
            reference: 'Categories',
          },
          bookCopies: {
            reference: 'Copies',
            components: {
              show: Components.BookCopiesTable,
            },
          },
          image: {
            type: 'mixed',
            isRequired: false,
            components: {
              new: Components.ImageUpload,
              edit: Components.ImageUpload,
              show: Components.ImagePreview,
            }
          }
        },
        listProperties: ['title', 'author', 'category', 'copies'],
        filterProperties: ['id', 'title', 'author', 'category'],
        editProperties: ['title', 'description', 'author', 'category', 'image'],
        showProperties: ['image', 'id', 'title', 'description', 'author', 'category', 'bookCopies'],
      },
    },
    {
      resource: { model: getModelByName('Copy'), client: prisma },
      options: {
        id: 'Copies',
        navigation: { icon: "Layers" },
        sort: {
          sortBy: 'book',
          direction: 'desc',
        },
        actions: {
          new: { isVisible: false },
          edit: { handler: editCopyApiHandler },
          delete: { handler: deleteCopyApiHandler },
          bulkDelete: { isAccessible: false },
        },
        properties: {
          book: {
            reference: 'Books',
          },
          condition : {
            availableValues: [
              { value: 'GOOD' },
              { value: 'BAD' },
            ]
          }
        },
        listProperties: ['book', 'ISBN',  'condition', 'isLoaned'],
        filterProperties: ['book', 'ISBN',  'condition', 'isLoaned'],
        editProperties: ['ISBN',  'condition'],
        showProperties: ['id', 'book', 'ISBN',  'condition', 'isLoaned', 'createdAt', 'updatedAt'],
      },
    },
    {
      resource: { model: getModelByName('Category'), client: prisma },
      options: {
        id: 'Categories',
        navigation: { icon: "Bookmark" },
        actions: {
          list: { after: populateBooksHook },
          show: { isAccessible: false },
          new: { handler: newCategoryApiHandler },
          edit: { isAccessible: false },
          delete: { handler: deleteCategoryApiHandler },
          bulkDelete: { isAccessible: false },
        },
        properties: {
          booksCount: {
            reference: 'Books',
            components: {
              list: Components.CategoryBookCount,
            },
            label: 'Books',
            isVisible: { new: false },
            actions: {
              show: { isVisible: true, isAccessible: true },
              list: { isVisible: true, isAccessible: true },
            },
          },
        },
        
        listProperties: ['id', 'name', 'booksCount'],
        filterProperties: ['id', 'name'],
        showProperties: ['id', 'name'],
      },
    },
    {
      resource: { model: getModelByName('Loan'), client: prisma },
      options: {
        id: 'ActiveLoans',
        navigation: { name: "Loans", icon: "Inbox" },
        sort: {
          sortBy: 'status',
          direction: 'desc',
        },
        // Algumas ações dependem do status do empréstimo.
        actions: {
          list: {
            before: activeLoansBeforeHook
          },
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
          bulkDelete: { isAccessible: false },
          start: { 
            actionType: 'record',
            handler: startLoanApiHandler,
            component: false,
            icon: 'CheckCircle',
            variant: 'success',
            isVisible: ({ record }: ActionContext) => record?.params.status === 'REQUESTED', 
          },
          return: { 
            actionType: 'record',
            handler: returnLoanApiHandler,
            component: false,
            icon: 'CornerDownLeft',
            variant: 'success',
            isVisible: ({ record }: ActionContext) => record?.params.status === 'ONGOING', 
          },
          terminate: { 
            actionType: 'record',
            handler: terminateLoanApiHandler,
            component: false,
            icon: 'XCircle',
            guard: 'Tem certeza de que deseja encerrar este empréstimo?',
            variant: 'danger',
            isVisible: ({ record }: ActionContext) => record?.params.status === 'ONGOING', 
          }
        },
        properties: {
          status: {
            availableValues: [
              { value: 'OVERDUE' },
              { value: 'REQUESTED' },
              { value: 'ONGOING' },
            ]
          },
          user: { reference: 'Users' },
          book: { reference: 'Books' },
          copy: { reference: 'Copies' },
        },
        listProperties: ['book', 'user', 'ISBN', 'status', 'postponed'],
        showProperties: ['id', 'user', 'book', 'ISBN', 'loanDate', 'expirationDate', 'status', 'postponed'],
        filterProperties: ['id', 'userName', 'book', 'ISBN', 'status'],
      },
    },
    {
      resource: { model: getModelByName('Loan'), client: prisma },
      options: {
        id: 'ArchivedLoans',
        navigation: { name: "Loans", icon: "Inbox" },
        sort: {
          sortBy: 'returnDate',
          direction: 'desc',
        },
        actions: {
          list: {
            before: archivedLoansBeforeHook
          },
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
          bulkDelete: { isAccessible: false },
        },
        properties: {
          status: {
            availableValues: [
              { value: 'RETURNED' },
              { value: 'TERMINATED' },
            ]
          },
          user: { reference: 'Users' },
          book: { reference: 'Books' },
          copy: { reference: 'Copies' },
        },
        listProperties: ['bookTitle', 'userName', 'ISBN', 'status', 'postponed'],
        showProperties: ['id', 'userName', 'bookTitle', 'ISBN', 'loanDate', 'expirationDate', 'returnDate', 'status', 'postponed'],
        filterProperties: ['id', 'userName', 'bookTitle', 'ISBN', 'status'],
      },
    },
    {
      resource: { model: getModelByName('AdminLog'), client: prisma },
      options: {
        id: 'Logs',
        navigation: { icon: 'Clipboard' },
        sort: {
          sortBy: 'time',
          direction: 'desc',
        },
        actions: {
          new: { isAccessible: false },
          edit: { isAccessible: false },
          delete: { isAccessible: false },
          bulkDelete: { isAccessible: false },
        },
        properties: {
          action: {
            availableValues: [
              { value: 'START' },
              { value: 'CREATE' },
              { value: 'UPDATE' },
              { value: 'DELETE' },
              { value: 'RETURN' },
              { value: 'TERMINATE' },
            ],
          },
          entity: {
            availableValues: [
              { value: 'USER' },
              { value: 'BOOK' },
              { value: 'CATEGORY' },
              { value: 'COPY' },
              { value: 'LOAN' },
            ],
          },
          admin: { reference: 'Users' },
        },
        listProperties: ['adminName', 'action', 'entityType', 'time'],
        showProperties: ['id', 'adminId', 'adminName', 'action', 'entityType', 'entityId', 'entityName', 'time'],
        filterProperties: ['admin', 'action', 'entityType', 'entityName', 'entityId', 'time'],
      }
    }
  ],
  componentLoader,
  locale: customLocale,
}
