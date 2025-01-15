import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import dotenv from 'dotenv';

const formData = require('form-data')
const Mailgun = require('mailgun.js')

dotenv.config()

const mailgun = new Mailgun(formData)

const mg = mailgun.client({
  username: 'api',
  key: process.env.EMAIL_API_KEY!,
  // url: 'https://api.mailgun.net',
})

export default mg
