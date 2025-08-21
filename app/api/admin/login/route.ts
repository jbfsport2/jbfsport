import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validation des données
    if (!username || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nom d\'utilisateur et mot de passe requis' 
        },
        { status: 400 }
      );
    }

    // Recherche de l'utilisateur admin dans la DB
    const admin = await prisma.admin.findFirst({
      where: { 
        username: username,
        isActive: true
      }
    });

    if (!admin) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nom d\'utilisateur ou mot de passe incorrect' 
        },
        { status: 401 }
      );
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Nom d\'utilisateur ou mot de passe incorrect' 
        },
        { status: 401 }
      );
    }

    // Génération du token JWT
    const token = jwt.sign(
      { 
        id: admin.id,
        username: admin.username, 
        email: admin.email,
        role: admin.role,
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24h
      },
      process.env.JWT_SECRET || 'fallback-secret'
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      message: 'Connexion réussie'
    });

  } catch (error) {
    console.error('Erreur lors de la connexion admin:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erreur interne du serveur' 
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 