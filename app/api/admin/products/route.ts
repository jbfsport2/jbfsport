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

// GET /api/admin/products - Récupère tous les produits
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transforme les données pour correspondre à l'interface de la page admin
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.sku, // Utilise SKU comme slug
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
    }));

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Crée un nouveau produit
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

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

    // Validation des champs requis
    if (!name || !price || !sku) {
      return NextResponse.json(
        { message: 'Nom, prix et SKU sont requis' },
        { status: 400 }
      );
    }

    // Vérifie si le SKU existe déjà
    const existingProduct = await prisma.product.findUnique({
      where: { sku }
    });

    if (existingProduct) {
      return NextResponse.json(
        { message: 'Un produit avec ce SKU existe déjà' },
        { status: 400 }
      );
    }

    // Crée le produit
    const product = await (prisma as any).product.create({ // eslint-disable-line @typescript-eslint/no-explicit-any
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

    return NextResponse.json(transformedProduct, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du produit:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 