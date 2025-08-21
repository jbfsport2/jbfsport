import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Récupère toutes les catégories actives
    const allCategories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    });

    // Mélange et prend 4 catégories aléatoires
    const shuffled = allCategories.sort(() => 0.5 - Math.random());
    const randomCategories = shuffled.slice(0, 4);

    return NextResponse.json(randomCategories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories aléatoires:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des catégories' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 