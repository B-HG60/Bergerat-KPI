import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Initialisation de la base de données...');

  // Créer les KPIs prédéfinis
  const defaultKpis = [
    { name: 'Production cellule non mécanisée', unit: 'unité/heure', order: 1 },
    { name: 'Production cellule mécanisée', unit: 'unité/heure', order: 2 },
    { name: 'Lignes réceptionnées/jour — cellule non mécanisée', unit: 'lignes/jour', order: 3 },
    { name: 'Lignes réceptionnées/jour — cellule mécanisée', unit: 'lignes/jour', order: 4 },
    { name: 'Total expédié/jour', unit: 'unités/jour', order: 5 },
  ];

  for (const kpi of defaultKpis) {
    await prisma.kpiDefinition.upsert({
      where: { id: kpi.name }, // on utilise le nom comme identifiant pour le seed
      update: {},
      create: {
        name: kpi.name,
        unit: kpi.unit,
        order: kpi.order,
        isDefault: true,
      },
    });
  }

  // Créer un admin par défaut
  const adminPassword = await bcrypt.hash('Admin2024!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bergerat.com' },
    update: {},
    create: {
      email: 'admin@bergerat.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'Bergerat',
      role: 'ADMIN',
    },
  });

  // Créer un manager de démo
  const managerPassword = await bcrypt.hash('Manager2024!', 12);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@bergerat.com' },
    update: {},
    create: {
      email: 'manager@bergerat.com',
      password: managerPassword,
      firstName: 'Jean',
      lastName: 'Dupont',
      role: 'MANAGER',
    },
  });

  // Créer un collaborateur de démo
  const collabPassword = await bcrypt.hash('Collab2024!', 12);
  await prisma.user.upsert({
    where: { email: 'collaborateur@bergerat.com' },
    update: {},
    create: {
      email: 'collaborateur@bergerat.com',
      password: collabPassword,
      firstName: 'Marie',
      lastName: 'Martin',
      role: 'COLLABORATEUR',
      managerId: manager.id,
    },
  });

  console.log('Base de données initialisée avec succès !');
  console.log('');
  console.log('Comptes créés :');
  console.log('  Admin :         admin@bergerat.com / Admin2024!');
  console.log('  Manager :       manager@bergerat.com / Manager2024!');
  console.log('  Collaborateur : collaborateur@bergerat.com / Collab2024!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
