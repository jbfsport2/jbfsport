import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { nom, email, telephone, entreprise, sujet, message } = await request.json();

    // Validation des champs requis
    if (!nom || !email || !sujet || !message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Configuration du transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Configuration de l'email
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // Envoi à la même adresse (contact@oxelya.com)
      replyTo: email,
      subject: `Nouveau message de contact - ${sujet}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            Nouveau message de contact - JBF SPORT
          </h2>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #374151; margin-top: 0;">Informations du contact :</h3>
            <p><strong>Nom :</strong> ${nom}</p>
            <p><strong>Email :</strong> ${email}</p>
            ${telephone ? `<p><strong>Téléphone :</strong> ${telephone}</p>` : ''}
            ${entreprise ? `<p><strong>Entreprise :</strong> ${entreprise}</p>` : ''}
            <p><strong>Sujet :</strong> ${sujet}</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
            <h3 style="color: #374151; margin-top: 0;">Message :</h3>
            <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              <strong>Note :</strong> Ce message a été envoyé depuis le formulaire de contact du site JBF SPORT.
              Vous pouvez répondre directement à cet email pour contacter ${nom}.
            </p>
          </div>
        </div>
      `,
      text: `
        Nouveau message de contact - JBF SPORT
        
        Informations du contact :
        - Nom : ${nom}
        - Email : ${email}
        ${telephone ? `- Téléphone : ${telephone}` : ''}
        ${entreprise ? `- Entreprise : ${entreprise}` : ''}
        - Sujet : ${sujet}
        
        Message :
        ${message}
        
        Note : Ce message a été envoyé depuis le formulaire de contact du site JBF SPORT.
        Vous pouvez répondre directement à cet email pour contacter ${nom}.
      `,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Message envoyé avec succès !' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message. Veuillez réessayer.' },
      { status: 500 }
    );
  }
} 