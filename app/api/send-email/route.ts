import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  const { name, email, phone, subject, message } = await req.json();

  // transporter with your Gmail credentials
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    // Email to You (the owner)
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: process.env.SMTP_EMAIL,
      subject: `New Form Submission: ${subject}`,
      html: `

    <div
          style="
            max-width: 600px;
            margin: auto;
            padding: 20px;
            background-color: #f7f7f7;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: auto;
              padding: 20px;
              background-color: #f7f7f7;
            "
          >
            <div
              style="
                background-color: #fff;
                border-radius: 10px;
                padding: 0;
                font-family: Arial, sans-serif;
              "
            >
              <!-- Red heading bar -->
              <h1
                style="
                  background-color: #dc2626;
                  color: white;
                  font-size: 16px;
                  font-weight: 600;
                  margin: 0;
                  padding: 16px;
                  border-top-left-radius: 10px;
                  border-top-right-radius: 10px;
                  text-align: center;
                "
              >
                New Form Submission
              </h1>

              <!-- Table with your data -->
              <table style="width: 100%; padding: 16px 24px 0; font-size: 14px">
                <tr>
                  <td style="padding: 6px 0; font-weight: bold; width: 100px">
                    Name
                  </td>
                  <td style="padding: 6px 0">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold">Email</td>
                  <td style="padding: 6px 0">${email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold">Phone</td>
                  <td style="padding: 6px 0">${phone}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-weight: bold">Subject</td>
                  <td style="padding: 6px 0">${subject}</td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 6px 0;
                      font-weight: bold;
                      vertical-align: top;
                    "
                  >
                    Message
                  </td>
                  <td style="padding: 6px 0">${message}</td>
                </tr>
              </table>

              <!-- Footer -->
              <p
                style="
                  text-align: center;
                  font-size: 12px;
                  color: #999;
                  padding: 16px;
                  border-top: 1px solid;
                "
              >
                Omega Ecosystem &copy; All rights reserved.
              </p>
            </div>
          </div>
        </div>

`,
    });

    // Email to User (confirmation)
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: "Your message has been received!",
      html: `
        <p style="color: #ffffff;" >Dear ${name},</p>
        <p style="color: #ffffff;" >Thank you for contacting us. We have received your message and will get back to you shortly.</p>
        <p style="color: #ffffff;" >Best regards,<br/>Omega Team</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error });
  }
}

