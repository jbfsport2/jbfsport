import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware de vérification JWT
function verifyToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    return decoded;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return null;
  }
}

// GET - Récupérer toutes les sous-catégories
export async function GET(request: NextRequest) {
  try {
    // Vérification du token
    const authHeader = request.headers.get('authorization');
    const decoded = verifyToken(authHeader);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide ou manquant' },
        { status: 401 }
      );
    }

    // Récupération des sous-catégories avec leurs catégories parentes
    const subCategories = await prisma.subCategory.findMany({
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { category: { order: 'asc' } },
        { order: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json(subCategories);

  } catch (error) {
    console.error('Erreur lors de la récupération des sous-catégories:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Créer une nouvelle sous-catégorie
export async function POST(request: NextRequest) {
  try {
    // Vérification du token
    const authHeader = request.headers.get('authorization');
    const decoded = verifyToken(authHeader);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide ou manquant' },
        { status: 401 }
      );
    }

    const { name, description, order, isActive, categoryId } = await request.json();

    // Validation des données
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom de la sous-catégorie est requis' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { error: 'La catégorie parente est requise' },
        { status: 400 }
      );
    }

    // Vérification de l'existence de la catégorie parente
    const parentCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!parentCategory) {
      return NextResponse.json(
        { error: 'La catégorie parente spécifiée n\'existe pas' },
        { status: 400 }
      );
    }

    // Génération du slug
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Vérification de l'unicité du slug
    const existingSubCategory = await prisma.subCategory.findFirst({
      where: { slug }
    });

    if (existingSubCategory) {
      return NextResponse.json(
        { error: 'Une sous-catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Création de la sous-catégorie
    const subCategory = await prisma.subCategory.create({
      data: {
        name: name.trim(),
        slug,
        description: description || '',
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
        categoryId
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json(subCategory, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de la création de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 