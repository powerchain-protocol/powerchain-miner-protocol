export type MailAddress = {
  email: string;
  name?: string;
};

export type MailMessage = {
  to: readonly MailAddress[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: MailAddress;
};

export type MailDelivery = {
  id: string;
  status: "queued" | "sent" | "failed";
  message: MailMessage;
};
