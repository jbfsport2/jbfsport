import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Vérification du token admin
async function verifyAdminToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any; // eslint-disable-line @typescript-eslint/no-explicit-any
    
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return null;
  }
}

// PUT /api/admin/products/[id] - Met à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      price,
      priceHT,
      priceTTC,
      imageUrl,
      isActive,
      isFeatured,
      isProductCategorySelected,
      stock,
      sku,
      subCategoryId,
      subSubCategoryId
    } = body;

    console.log('🔄 API PUT - Données reçues:', {
      id,
      name,
      isProductCategorySelected,
      isFeatured
    });

    // Validation des champs requis
    if (!name || !price || !sku) {
      return NextResponse.json(
        { message: 'Nom, prix et SKU sont requis' },
        { status: 400 }
      );
    }

    // Vérifie si le SKU existe déjà sur un autre produit
    const existingProduct = await prisma.product.findFirst({
      where: {
        sku,
        id: { not: id }
      }
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: 'Un autre produit avec ce SKU existe déjà' },
        { status: 400 }
      );
    }

    // Met à jour le produit
    const product = await (prisma as any).product.update({ // eslint-disable-line @typescript-eslint/no-explicit-any
      where: { id },
      data: {
        name,
        description,
        shortDescription,
        sku,
        price: price || priceTTC || 0,
        costPrice: priceHT || 0,
        stock: stock || 0,
        images: imageUrl ? [imageUrl] : [],
        isActive: isActive !== undefined ? isActive : true,
        isFeatured: isFeatured || false,
        isProductCategorySelected: isProductCategorySelected || false,
        subCategoryId: subCategoryId || null,
        subSubCategoryId: subSubCategoryId || null
      },
      include: {
        subCategory: {
          include: {
            category: true
          }
        },
        subSubCategory: {
          include: {
            subCategory: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    console.log('💾 API PUT - Produit mis à jour dans la DB:', {
      id: product.id,
      name: product.name,
      isProductCategorySelected: product.isProductCategorySelected,
      isFeatured: product.isFeatured
    });

    // Transforme la réponse
    const transformedProduct = {
      id: product.id,
      name: product.name,
      slug: product.sku,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price,
      priceHT: product.costPrice || 0,
      priceTTC: product.price,
      imageUrl: product.images.length > 0 ? product.images[0] : '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isProductCategorySelected: product.isProductCategorySelected || false,
      stock: product.stock,
      sku: product.sku,
      subCategoryId: product.subCategoryId || '',
      subSubCategoryId: product.subSubCategoryId || '',
      subCategory: product.subCategory ? {
        id: product.subCategory.id,
        name: product.subCategory.name,
        category: {
          id: product.subCategory.category.id,
          name: product.subCategory.category.name
        }
      } : null,
      subSubCategory: product.subSubCategory ? {
        id: product.subSubCategory.id,
        name: product.subSubCategory.name,
        subCategory: {
          id: product.subSubCategory.subCategory.id,
          name: product.subSubCategory.subCategory.name,
          category: {
            id: product.subSubCategory.subCategory.category.id,
            name: product.subSubCategory.subCategory.category.name
          }
        }
      } : null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString()
    };

    console.log('📤 API PUT - Réponse envoyée au frontend:', {
      id: transformedProduct.id,
      name: transformedProduct.name,
      isProductCategorySelected: transformedProduct.isProductCategorySelected,
      isFeatured: transformedProduct.isFeatured
    });

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error);
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        { message: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Supprime un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Supprime le produit
    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error);
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        { message: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 