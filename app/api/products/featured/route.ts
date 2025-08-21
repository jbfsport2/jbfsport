import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isFeatured: true 
      },
      include: {
        reviews: {
          where: { isVerified: true },
          select: {
            id: true,
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20 // Limite à 20 produits pour le carousel
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits mis en avant:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 