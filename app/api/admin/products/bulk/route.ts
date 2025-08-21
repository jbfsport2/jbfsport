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

// POST /api/admin/products/bulk - Import en masse de produits
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request);
    if (!admin) {
      return NextResponse.json({ message: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const {
      subCategoryId,
      subSubCategoryId,
      products,
      price,
      stock
    } = body;

    // Validation des champs requis
    if (!subCategoryId || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { message: 'Sous-catégorie et liste de produits sont requis' },
        { status: 400 }
      );
    }

    // Vérifie que la sous-catégorie existe
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: subCategoryId }
    });

    if (!subCategory) {
      return NextResponse.json(
        { message: 'Sous-catégorie non trouvée' },
        { status: 400 }
      );
    }

    // Vérifie que la sous-sous-catégorie existe si spécifiée
    if (subSubCategoryId) {
      const subSubCategory = await prisma.subSubCategory.findUnique({
        where: { id: subSubCategoryId }
      });

      if (!subSubCategory) {
        return NextResponse.json(
          { message: 'Sous-sous-catégorie non trouvée' },
          { status: 400 }
        );
      }
    }

    const createdProducts = [];
    const errors = [];

    // Traite chaque produit
    for (const productName of products) {
      try {
        if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
          continue;
        }

        const trimmedName = productName.trim();
        
        // Génère un SKU unique basé sur le nom
        const baseSku = trimmedName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 20);
        
        let sku = baseSku;
        let counter = 1;
        
        // Vérifie que le SKU est unique
        while (await prisma.product.findUnique({ where: { sku } })) {
          sku = `${baseSku}${counter}`;
          counter++;
        }

        // Crée le produit
        const product = await prisma.product.create({
          data: {
            name: trimmedName,
            sku,
            price: price || 0,
            costPrice: price || 0,
            stock: stock || 0,
            images: [],
            isActive: true,
            isFeatured: false,
            subCategoryId,
            subSubCategoryId: subSubCategoryId || null
          }
        });

        createdProducts.push(product);
      } catch (error) {
        console.error(`Erreur lors de la création du produit "${productName}":`, error);
        errors.push({
          product: productName,
          error: 'Erreur lors de la création'
        });
      }
    }

    return NextResponse.json({
      message: `${createdProducts.length} produits créés avec succès`,
      created: createdProducts.length,
      total: products.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Erreur lors de l\'import en masse:', error);
    return NextResponse.json(
      { message: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
} 