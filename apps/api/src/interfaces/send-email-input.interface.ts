export interface SendEmailInput {
    to: string;
    subject: string;
    html: string;
    from?: string;
}
