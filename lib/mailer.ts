import axios, { AxiosInstance } from 'axios';

interface EmailParams {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}
  
interface EmailTemplate {
subject: string;
text: string;
html: string;
}

type TemplateFunction = (data: any) => EmailTemplate;
type TemplateMap = {
[key: string]: EmailTemplate | TemplateFunction;
}
  
const SENDGRID_API_KEY = "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"

// SendGrid client
const sendgridClient: AxiosInstance = axios.create({
  baseURL: 'https://api.sendgrid.com/v3/mail/send',
  headers: {
    'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    'Content-Type': 'application/json'
  }
});


export const sendEmail = async ({
  to,
  subject,
  text,
  html
}: EmailParams): Promise<EmailResponse> => {
  try {
    const payload = {
      personalizations: [{
        to: [{ email: to }]
      }],
      from: { email: `team@axone.co.uk` },
      subject: subject,
      content: [
        { type: 'text/plain', value: text },
        ...(html ? [{ type: 'text/html', value: html }] : [])
      ]
    };

    const response = await sendgridClient.post('', payload);

    return {
      success: true,
      messageId: response.headers['x-message-id']
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
    } else {
      console.error('General error:', error);
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};


const emailTemplates: TemplateMap = {
  welcome: {
    subject: 'Welcome to Our App!',
    text: 'Thank you for joining our app...',
    html: '<h1>Welcome!</h1><p>Thank you for joining our app...</p>'
  },
  missedDeadline: (data: {
    user: string, 
    deadlineName: string, 
    deadlineDate: Date
  }): EmailTemplate => ({
    subject: `Missed Deadline: ${data.deadlineName}`,
    text: `User ${data.user} has missed the deadline for ${data.deadlineName}. Missed at: ${data.deadlineDate.toLocaleString()}`,
    html: `<p>User <strong>${data.user}</strong> has missed the deadline for <em>${data.deadlineName}</em>. Missed at: ${data.deadlineDate.toLocaleString()}</p>`
  }),
  passwordReset: (resetToken: string): EmailTemplate => ({
    subject: 'Password Reset Request',
    text: `Click here to reset your password: ${resetToken}`,
    html: `<h1>Password Reset</h1><p>Click <a href="${resetToken}">here</a> to reset your password.</p>`
  })
};