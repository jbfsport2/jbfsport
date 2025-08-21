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

// GET - Récupérer une sous-catégorie spécifique
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

    // Récupération de la sous-catégorie
    const subCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        subSubCategories: {
          orderBy: { order: 'asc' }
        },
        products: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!subCategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(subCategory);

  } catch (error) {
    console.error('Erreur lors de la récupération de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT - Mettre à jour une sous-catégorie
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
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
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

    // Vérification de l'existence de la sous-catégorie
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id }
    });

    if (!existingSubCategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Vérification de l'existence de la nouvelle catégorie parente
    const newParentCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!newParentCategory) {
      return NextResponse.json(
        { error: 'La nouvelle catégorie parente n\'existe pas' },
        { status: 400 }
      );
    }

    // Génération du nouveau slug
    const newSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');

    // Vérification de l'unicité du slug (sauf pour la sous-catégorie actuelle)
    const slugConflict = await prisma.subCategory.findFirst({
      where: {
        slug: newSlug,
        id: { not: id }
      }
    });

    if (slugConflict) {
      return NextResponse.json(
        { error: 'Une sous-catégorie avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    // Mise à jour de la sous-catégorie
    const updatedSubCategory = await prisma.subCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        slug: newSlug,
        description: description || '',
        order: order !== undefined ? order : existingSubCategory.order,
        isActive: isActive !== undefined ? isActive : existingSubCategory.isActive,
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

    return NextResponse.json(updatedSubCategory);

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Supprimer une sous-catégorie
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

    // Vérification de l'existence de la sous-catégorie
    const existingSubCategory = await prisma.subCategory.findUnique({
      where: { id },
      include: {
        subSubCategories: true,
        products: true
      }
    });

    if (!existingSubCategory) {
      return NextResponse.json(
        { error: 'Sous-catégorie non trouvée' },
        { status: 404 }
      );
    }

    // Vérification des dépendances
    if (existingSubCategory.subSubCategories.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une sous-catégorie qui contient des sous-sous-catégories' },
        { status: 400 }
      );
    }

    if (existingSubCategory.products.length > 0) {
      return NextResponse.json(
        { error: 'Impossible de supprimer une sous-catégorie qui contient des produits' },
        { status: 400 }
      );
    }

    // Suppression de la sous-catégorie
    await prisma.subCategory.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Sous-catégorie supprimée avec succès' });

  } catch (error) {
    console.error('Erreur lors de la suppression de la sous-catégorie:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
} 