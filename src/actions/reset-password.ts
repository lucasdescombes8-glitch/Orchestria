'use server'

import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function requestPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
  const user = await prisma.utilisateur.findUnique({ where: { email } })

  // Always return success to avoid user enumeration
  if (!user) return { success: true }

  // Delete existing tokens for this email
  await prisma.passwordResetToken.deleteMany({ where: { email } })

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

  await prisma.passwordResetToken.create({ data: { email, token, expiresAt } })

  const resetUrl = `${process.env.NEXTAUTH_URL ?? 'https://orchestria-nu.vercel.app'}/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: 'Orchestria <noreply@orchestria-nu.vercel.app>',
      to: email,
      subject: 'Réinitialisation de votre mot de passe',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto; padding: 32px;">
          <div style="text-align:center; margin-bottom: 32px;">
            <div style="display:inline-block; background:#C41230; border-radius:16px; padding:16px 20px;">
              <span style="color:white; font-size:22px; font-weight:bold; letter-spacing:-0.5px;">Orchestria</span>
            </div>
          </div>
          <h2 style="color:#111; margin-bottom:8px;">Réinitialisation du mot de passe</h2>
          <p style="color:#555; line-height:1.6;">
            Bonjour ${user.prenom},<br/><br/>
            Vous avez demandé la réinitialisation de votre mot de passe.
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
            Ce lien est valable <strong>1 heure</strong>.
          </p>
          <div style="text-align:center; margin: 32px 0;">
            <a href="${resetUrl}"
               style="background:#C41230; color:white; padding:14px 32px; border-radius:12px; text-decoration:none; font-weight:600; font-size:15px;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color:#999; font-size:13px;">
            Si vous n'avez pas fait cette demande, ignorez cet email.<br/>
            Ce lien expirera dans 1 heure.
          </p>
          <hr style="border:none; border-top:1px solid #eee; margin:24px 0;"/>
          <p style="color:#bbb; font-size:12px; text-align:center;">
            Orchestria — Palais de la Bourse Lyon
          </p>
        </div>
      `,
    })
  } catch (err) {
    console.error('Email send error:', err)
    // Don't expose email errors to user
  }

  return { success: true }
}

export async function resetPassword(token: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (newPassword.length < 8) return { success: false, error: 'Le mot de passe doit contenir au moins 8 caractères' }

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!record) return { success: false, error: 'Lien invalide ou expiré' }
  if (record.usedAt) return { success: false, error: 'Ce lien a déjà été utilisé' }
  if (record.expiresAt < new Date()) return { success: false, error: 'Ce lien a expiré, veuillez refaire une demande' }

  const hash = await bcrypt.hash(newPassword, 12)

  await Promise.all([
    prisma.utilisateur.update({ where: { email: record.email }, data: { motDePasseHash: hash } }),
    prisma.passwordResetToken.update({ where: { token }, data: { usedAt: new Date() } }),
  ])

  return { success: true }
}
