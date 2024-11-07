import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  const { feedbackType, subject, message, name, email } = await request.json();

  console.log("Received feedback:", {
    feedbackType,
    subject,
    message,
    name,
    email,
  });

  // Create a transporter using SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  console.log("Transporter created with user:", process.env.EMAIL_USER);

  try {
    // Send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Linkty Feedback" <noreply@linkty.com>',
      to: "Linkty.io@gmail.com",
      subject: `New ${feedbackType}: ${subject}`,
      text: `
        Feedback Type: ${feedbackType}
        From: ${name} (${email})
        Subject: ${subject}

        Message: ${message}
      `,
      html: `
        <h2>New ${feedbackType} Received</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    console.log("Message sent: %s", info.messageId);
    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email", details: error.message },
      { status: 500 }
    );
  }
}
