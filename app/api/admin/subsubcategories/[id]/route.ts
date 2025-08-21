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

// GET - Récupérer une sous-sous-catégorie spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Récupération de la sous-sous-catégorie
    const subSubCategory = await prisma.subSubCategory.findUnique({
      where: { id },
      include: {
        subCategory: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        products: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!subSubCategory) {
      return NextResponse.json(
        { error: 'Sous-sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(subSubCategory);

  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Mettre à jour une sous-sous-catégorie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification du token
    const authHeader = request.headers.get('authorization');
    const decoded = verifyToken(authHeader);
    
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token invalide ou manquant' },
        { status: 500 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { name, description, order, isActive, subCategoryId } = await request.json();

    // Validation des données
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom de la sous-sous-catégorie est requis' },
        { status: 400 }
      );
    }

    if (!subCategoryId) {
      return NextResponse.json(
        { error: 'La sous-catégorie parente est requise' },
        { status: 400 }
      );
    }

    // Vérification de l'existence de la sous-sous-catégorie
    const existingSubSubCategory = await prisma.subSubCategory.findUnique({
      where: { id }
    });

    if (!existingSubSubCategory) {
      return NextResponse.json(
        { error: 'Sous-sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Vérification de l'existence de la nouvelle sous-catégorie parente
    const newParentSubCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId }
    });

    if (!newParentSubCategory) {
      return NextResponse.json(
        { error: 'La nouvelle sous-catégorie parente n\'existe pas' },
        { status: 400 }
      );
    }

    // Génération du nouveau slug
    const newSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Vérification de l'unicité du slug (sauf pour la sous-sous-catégorie actuelle)
    const slugConflict = await prisma.subSubCategory.findFirst({
      where: {
        slug: newSlug,
        id: { not: id }
      }
    });

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Une sous-sous-catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Mise à jour de la sous-sous-catégorie
    const updatedSubSubCategory = await prisma.subSubCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: newSlug,
        description: description || '',
        order: order !== undefined ? order : existingSubSubCategory.order,
        isActive: isActive !== undefined ? isActive : existingSubSubCategory.isActive,
        subCategoryId
      },
      include: {
        subCategory: {
          include: {
            category: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedSubSubCategory);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la sous-sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Supprimer une sous-sous-catégorie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Vérification de l'existence de la sous-sous-catégorie
    const existingSubSubCategory = await prisma.subSubCategory.findUnique({
      where: { id },
      include: {
        products: true
      }
    });

    if (!existingSubSubCategory) {
      return NextResponse.json(
        { error: 'Sous-sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Vérification des dépendances
    if (existingSubSubCategory.products.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une sous-sous-catégorie qui contient des produits' },
        { status: 400 }
      );
    }

    // Suppression de la sous-sous-catégorie
    await prisma.subSubCategory.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Sous-sous-catégorie supprimée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de la sous-sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 