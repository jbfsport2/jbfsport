const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🔐 Création de l\'utilisateur admin...');

  try {
    // Vérifier si un admin existe déjà
    const existingAdmin = await prisma.admin.findFirst({
      where: { username: 'admin' }
    });

    if (existingAdmin) {
      console.log('⚠️  Un utilisateur admin existe déjà');
      return;
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('jbfsport@2025', 12);

    // Création de l'admin
    const admin = await prisma.admin.create({
      data: {
        username: 'admin',
        email: 'contact@jbfsport.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      }
    });

    console.log('✅ Utilisateur admin créé avec succès !');
    console.log('👤 Username:', admin.username);
    console.log('📧 Email:', admin.email);
    console.log('🔑 Mot de passe: admin123');
    console.log('⚠️  N\'oublie pas de changer ce mot de passe en production !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de la création de l\'admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 