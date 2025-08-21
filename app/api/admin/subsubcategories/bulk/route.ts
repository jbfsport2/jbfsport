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

// POST - Créer plusieurs sous-sous-catégories en masse
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

    const { subCategoryId, subSubCategories, startOrder = 0 } = await request.json();

    // Validation des données
    if (!subCategoryId) {
      return NextResponse.json(
        { error: 'L\'ID de la sous-catégorie est requis' },
        { status: 400 }
      );
    }

    if (!Array.isArray(subSubCategories) || subSubCategories.length === 0) {
      return NextResponse.json(
        { error: 'La liste des sous-sous-catégories est requise et ne peut pas être vide' },
        { status: 400 }
      );
    }

    // Vérification de l'existence de la sous-catégorie parente
    const parentSubCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId }
    });

    if (!parentSubCategory) {
      return NextResponse.json(
        { error: 'La sous-catégorie parente spécifiée n\'existe pas' },
        { status: 400 }
      );
    }

    // Traitement des sous-sous-catégories
    const createdSubSubCategories = [];
    const errors = [];
    let currentOrder = startOrder;

    for (const subSubCategoryName of subSubCategories) {
      try {
        const name = subSubCategoryName.trim();
        
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
        const existingSubSubCategory = await prisma.subSubCategory.findFirst({
          where: { slug }
        });

        if (existingSubSubCategory) {
          errors.push(`"${name}" : Une sous-sous-catégorie avec ce nom existe déjà`);
          continue;
        }

        // Création de la sous-sous-catégorie
        const subSubCategory = await prisma.subSubCategory.create({
          data: {
            name,
            slug,
            description: `Sous-sous-catégorie: ${name}`,
            order: currentOrder++,
            isActive: true,
            subCategoryId
          }
        });

        createdSubSubCategories.push(subSubCategory);
      } catch (error) {
        errors.push(`"${subSubCategoryName}" : Erreur lors de la création`);
        console.error(`Erreur lors de la création de "${subSubCategoryName}":`, error);
      }
    }

    // Retour du résultat
    if (createdSubSubCategories.length === 0) {
      return NextResponse.json(
        { 
          error: 'Aucune sous-sous-catégorie n\'a pu être créée',
          details: errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      created: createdSubSubCategories.length,
      total: subSubCategories.length,
      subSubCategories: createdSubSubCategories,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 });

  } catch (error) {
    console.error('Erreur lors de l\'import en masse des sous-sous-catégories:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 