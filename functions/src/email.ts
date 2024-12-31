import { IntParam, StringParam } from "firebase-functions/lib/params/types"
import { compile } from "handlebars"
import { createTransport } from "nodemailer"

export type EmailDataType = {
    name: string
    appName: string
    signupLink: string
    appDomain: string
    currentYear: number
}
export type SMTPConfigType = {
  User: StringParam
  Password: StringParam
  Server: StringParam
  Port: IntParam
}

export type TemplateType = "SignUpNotification"


export const sendEmail = async (
  template: TemplateType,
  to: string,
  data: EmailDataType,
  SMTPConfig: SMTPConfigType
) => {
  const from = `no-reply@${data.appDomain}`
  const transporter = createTransport({
    host: SMTPConfig.Server.value(),
    port: SMTPConfig.Port.value(),
    secure: false,
    auth: {
      user: SMTPConfig.User.value(),
      pass: SMTPConfig.Password.value(),
    },
  })
  const html = await compileHTMLTemplate(template, data)

  const mailOptions = {
    from,
    to,
    subject: "Welcome to RSMF Application",
    html,
  }
  const response = await transporter.sendMail(mailOptions)
  return response
}

async function compileHTMLTemplate(template: TemplateType, data: EmailDataType): Promise<string> {
  const templateContent: string = (await import(`./templates/${template}`)).default
  const compiledTemplate = compile(templateContent)
  return compiledTemplate(data)
}
