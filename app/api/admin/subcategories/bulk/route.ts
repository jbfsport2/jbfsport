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

// POST - Créer plusieurs sous-catégories en masse
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

    const { categoryId, subCategories, startOrder = 0 } = await request.json();

    // Validation des données
    if (!categoryId) {
      return NextResponse.json(
        { error: 'L\'ID de la catégorie est requis' },
        { status: 400 }
      );
    }

    if (!Array.isArray(subCategories) || subCategories.length === 0) {
      return NextResponse.json(
        { error: 'La liste des sous-catégories est requise et ne peut pas être vide' },
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

    // Traitement des sous-catégories
    const createdSubCategories = [];
    const errors = [];
    let currentOrder = startOrder;

    for (const subCategoryName of subCategories) {
      try {
        const name = subCategoryName.trim();
        
        if (name.length === 0) {
          continue; // Ignorer les lignes vides
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
          errors.push(`"${name}" : Une sous-catégorie avec ce nom existe déjà`);
          continue;
        }

        // Création de la sous-catégorie
        const subCategory = await prisma.subCategory.create({
          data: {
            name,
            slug,
            description: `Sous-catégorie: ${name}`,
            order: currentOrder++,
            isActive: true,
            categoryId
          }
        });

        createdSubCategories.push(subCategory);
      } catch (error) {
        errors.push(`"${subCategoryName}" : Erreur lors de la création`);
        console.error(`Erreur lors de la création de "${subCategoryName}":`, error);
      }
    }

    // Retour du résultat
    if (createdSubCategories.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucune sous-catégorie n\'a pu être créée',
          details: errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      created: createdSubCategories.length,
      total: subCategories.length,
      subCategories: createdSubCategories,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'import en masse des sous-catégories:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 