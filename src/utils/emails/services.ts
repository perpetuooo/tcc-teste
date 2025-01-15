import mg from './client.ts';
import fs from 'fs';
import path from 'path';
import { Manager } from '../manager.ts';

const emailCounter = new Manager()

export async function sendEmail(
  to: string,
  subject: string,
  templateName: string,
  variables: Record<string, string>
) {
  try {
    if (emailCounter.getRemainingEmails() <= 0) {
      throw new Error('Limite diário de emails atingido. Tente novamente amanhã.')
    }

    const templatePath = path.resolve('./src/utils/emails/templates/', `${templateName}.html`)
    let template = fs.readFileSync(templatePath, 'utf-8')
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      const replacement = Array.isArray(value) ? value.join('') : value
      template = template.replace(regex, replacement)
    })

    const messageData = {
      from: `mailgun@${process.env.EMAIL_DOMAIN!}`,
      to,
      subject,
      html: template,
    }

    await mg.messages.create(process.env.EMAIL_DOMAIN!, messageData)
    emailCounter.incrementEmailCount()
  } catch (error) {
    console.error(error)
  }
}
