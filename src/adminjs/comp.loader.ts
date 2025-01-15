import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader()

const Components = {
    Test: componentLoader.add('TestComponent', './components/TestComponent'),
    CategoryBookCount: componentLoader.add('CategoryBookCount', './components/CategoryBookCount'),
    NewCopyForm: componentLoader.add('NewCopyForm', './components/NewCopyForm'),
    BookCopiesTable: componentLoader.add('BookCopiesTable', './components/BookCopiesTable'),
    ImageUpload: componentLoader.add('ImageUpload', './components/ImageUpload'),
    ImagePreview: componentLoader.add('ImagePreview', './components/ImagePreview'),
    Dashboard: componentLoader.add('Dashboard', './components/Dashboard'),
    Settings: componentLoader.add('SettingsPage', './components/SettingsPage'),
    Login: componentLoader.override('Login', './components/LoginPage'),
}

export { componentLoader, Components }