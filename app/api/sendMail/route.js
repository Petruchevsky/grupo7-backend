// Archivo: app/api/mailer/route.js
import { NextResponse } from 'next/server';
import nodemailer from "nodemailer";

export async function POST(request) {
    const { email, subject, message } = await request.json();

    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: process.env.SMTP_USERNAME,
        to: email,
        subject: subject,
        replyTo: email,
        html: `
            <div>
                <h2>${subject}</h2>
                <h4><strong>${message}</strong></h4>
                <br/><br/><br/>
                <a>Mensaje enviado de manera automática por Grupo 7. No es necesario que conteste este mensaje.</h5>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        return NextResponse.json({ message: "¡Mensaje Enviado Exitosamente!" }, { status: 200 });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "¡Oh no! Algo salió Mal con tu Email" }, { status: 500 });
    }
}
