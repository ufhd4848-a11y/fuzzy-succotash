import { PrismaClient, UserRole, OrderStatus, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@sushiwave.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      phone: '+7 (999) 999-99-99',
      address: 'Moscow, Admin Street 1',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+7 (999) 888-77-66',
      address: 'Moscow, User Street 42',
      role: UserRole.USER,
    },
  });
  console.log('✅ Created test user:', user.email);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Роллы',
        slug: 'rolls',
        description: 'Классические и фирменные роллы',
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Суши',
        slug: 'sushi',
        description: 'Традиционные японские суши',
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500',
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Сеты',
        slug: 'sets',
        description: 'Готовые наборы для компании',
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500',
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Сашими',
        slug: 'sashimi',
        description: 'Нарезанная свежая рыба',
        image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500',
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Гунканы',
        slug: 'gunkan',
        description: 'Суши с начинкой сверху',
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500',
        sortOrder: 5,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Напитки',
        slug: 'drinks',
        description: 'Японские напитки и безалкогольные',
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
        sortOrder: 6,
      },
    }),
  ]);

  console.log('✅ Created', categories.length, 'categories');

  // Create products
  const products = await Promise.all([
    // Роллы
    prisma.product.create({
      data: {
        name: 'Филадельфия Классик',
        slug: 'philadelphia-classic',
        description: 'Классический ролл с лососем, сливочным сыром и огурцом',
        price: 450.00,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
        weight: 220,
        calories: 320,
        proteins: 12.5,
        fats: 8.2,
        carbohydrates: 45.3,
        isActive: true,
        isBestseller: true,
        stockQuantity: 100,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Калифорния',
        slug: 'california',
        description: 'Ролл с крабом, авокадо, огурцом и икрой тобико',
        price: 380.00,
        image: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=500',
        weight: 200,
        calories: 280,
        proteins: 10.2,
        fats: 6.8,
        carbohydrates: 42.1,
        isActive: true,
        isBestseller: true,
        stockQuantity: 80,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Дракон',
        slug: 'dragon-roll',
        description: 'Ролл с угрем, авокадо и соусом унаги',
        price: 520.00,
        oldPrice: 580.00,
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500',
        weight: 240,
        calories: 350,
        proteins: 14.3,
        fats: 12.5,
        carbohydrates: 38.2,
        isActive: true,
        isBestseller: true,
        stockQuantity: 60,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Спайси Тунец',
        slug: 'spicy-tuna',
        description: 'Острый ролл с тунцом, соусом спайси и огурцом',
        price: 480.00,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        weight: 210,
        calories: 290,
        proteins: 15.2,
        fats: 7.1,
        carbohydrates: 35.4,
        isActive: true,
        isNew: true,
        stockQuantity: 50,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Радуга',
        slug: 'rainbow-roll',
        description: 'Ролл с разными видами рыбы сверху',
        price: 590.00,
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500',
        weight: 260,
        calories: 380,
        proteins: 18.5,
        fats: 10.2,
        carbohydrates: 42.3,
        isActive: true,
        isNew: true,
        stockQuantity: 40,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Веган Ролл',
        slug: 'vegan-roll',
        description: 'Овощной ролл с авокадо, огурцом, перцем и тофу',
        price: 320.00,
        image: 'https://images.unsplash.com/photo-1625938145744-e38051539994?w=500',
        weight: 190,
        calories: 220,
        proteins: 6.5,
        fats: 8.2,
        carbohydrates: 38.1,
        isActive: true,
        stockQuantity: 70,
        categoryId: categories[0].id,
      },
    }),

    // Суши
    prisma.product.create({
      data: {
        name: 'Суши с лососем',
        slug: 'sushi-salmon',
        description: 'Классические суши со свежим лососем',
        price: 120.00,
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500',
        weight: 35,
        calories: 45,
        proteins: 5.2,
        fats: 1.8,
        carbohydrates: 15.3,
        isActive: true,
        isBestseller: true,
        stockQuantity: 200,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Суши с тунцом',
        slug: 'sushi-tuna',
        description: 'Свежий тунец на рисе',
        price: 140.00,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        weight: 35,
        calories: 42,
        proteins: 6.8,
        fats: 0.5,
        carbohydrates: 15.1,
        isActive: true,
        stockQuantity: 150,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Суши с угрем',
        slug: 'sushi-eel',
        description: 'Угорь в соусе унаги на рисе',
        price: 160.00,
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500',
        weight: 40,
        calories: 85,
        proteins: 7.2,
        fats: 3.5,
        carbohydrates: 18.2,
        isActive: true,
        stockQuantity: 100,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Суши с креветкой',
        slug: 'sushi-shrimp',
        description: 'Отварная креветка на рисе',
        price: 130.00,
        image: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=500',
        weight: 35,
        calories: 38,
        proteins: 6.5,
        fats: 0.3,
        carbohydrates: 15.5,
        isActive: true,
        stockQuantity: 120,
        categoryId: categories[1].id,
      },
    }),

    // Сеты
    prisma.product.create({
      data: {
        name: 'Сет Филадельфия',
        slug: 'set-philadelphia',
        description: 'Набор из 3 видов филадельфии: классическая, с огурцом, лайт',
        price: 1200.00,
        oldPrice: 1350.00,
        image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500',
        weight: 650,
        calories: 950,
        proteins: 35.2,
        fats: 22.1,
        carbohydrates: 125.3,
        isActive: true,
        isBestseller: true,
        stockQuantity: 30,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Сет Для Двоих',
        slug: 'set-for-two',
        description: 'Романтический набор для двоих: 24 штуки',
        price: 890.00,
        image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500',
        weight: 480,
        calories: 720,
        proteins: 28.5,
        fats: 18.2,
        carbohydrates: 95.4,
        isActive: true,
        stockQuantity: 25,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Сет Праздничный',
        slug: 'set-party',
        description: 'Большой набор для компании: 64 штуки',
        price: 2800.00,
        image: 'https://images.unsplash.com/photo-1617196034183-421b4917c92d?w=500',
        weight: 1800,
        calories: 2800,
        proteins: 95.2,
        fats: 45.8,
        carbohydrates: 320.5,
        isActive: true,
        stockQuantity: 15,
        categoryId: categories[2].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Сет Премиум',
        slug: 'set-premium',
        description: 'Элитный набор с редкими видами рыбы',
        price: 3500.00,
        image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500',
        weight: 720,
        calories: 1100,
        proteins: 52.3,
        fats: 28.5,
        carbohydrates: 85.2,
        isActive: true,
        isNew: true,
        stockQuantity: 10,
        categoryId: categories[2].id,
      },
    }),

    // Сашими
    prisma.product.create({
      data: {
        name: 'Сашими Лосось',
        slug: 'sashimi-salmon',
        description: 'Нарезанный лосось, 5 кусочков',
        price: 450.00,
        image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500',
        weight: 75,
        calories: 120,
        proteins: 18.5,
        fats: 4.2,
        carbohydrates: 0,
        isActive: true,
        stockQuantity: 80,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Сашими Тунец',
        slug: 'sashimi-tuna',
        description: 'Нарезанный тунец, 5 кусочков',
        price: 520.00,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        weight: 75,
        calories: 110,
        proteins: 22.3,
        fats: 0.8,
        carbohydrates: 0,
        isActive: true,
        stockQuantity: 60,
        categoryId: categories[3].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Сашими Микс',
        slug: 'sashimi-mix',
        description: 'Ассорти из лосося, тунца и желтохвоста',
        price: 780.00,
        image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=500',
        weight: 120,
        calories: 180,
        proteins: 32.5,
        fats: 5.2,
        carbohydrates: 0,
        isActive: true,
        isNew: true,
        stockQuantity: 40,
        categoryId: categories[3].id,
      },
    }),

    // Гунканы
    prisma.product.create({
      data: {
        name: 'Гункан с икрой',
        slug: 'gunkan-ikura',
        description: 'Суши с красной икрой лосося',
        price: 280.00,
        image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=500',
        weight: 40,
        calories: 65,
        proteins: 8.2,
        fats: 2.5,
        carbohydrates: 16.3,
        isActive: true,
        stockQuantity: 70,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Гункан с тобико',
        slug: 'gunkan-tobiko',
        description: 'Суши с икрой летучей рыбы',
        price: 240.00,
        image: 'https://images.unsplash.com/photo-1559410545-0bdcd187e0a6?w=500',
        weight: 35,
        calories: 55,
        proteins: 6.8,
        fats: 1.2,
        carbohydrates: 15.8,
        isActive: true,
        stockQuantity: 80,
        categoryId: categories[4].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Гункан спайси',
        slug: 'gunkan-spicy',
        description: 'Острый гункан с тунцом и спайси соусом',
        price: 220.00,
        image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=500',
        weight: 40,
        calories: 75,
        proteins: 9.5,
        fats: 2.8,
        carbohydrates: 16.5,
        isActive: true,
        stockQuantity: 60,
        categoryId: categories[4].id,
      },
    }),

    // Напитки
    prisma.product.create({
      data: {
        name: 'Японская Сода Ramune',
        slug: 'ramune',
        description: 'Традиционная японская газировка',
        price: 180.00,
        image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500',
        weight: 200,
        calories: 80,
        proteins: 0,
        fats: 0,
        carbohydrates: 20,
        isActive: true,
        stockQuantity: 100,
        categoryId: categories[5].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Зеленый Чай',
        slug: 'green-tea',
        description: 'Японский зеленый чай сенча',
        price: 120.00,
        image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500',
        weight: 300,
        calories: 5,
        proteins: 0.2,
        fats: 0,
        carbohydrates: 1,
        isActive: true,
        stockQuantity: 150,
        categoryId: categories[5].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Матча Латте',
        slug: 'matcha-latte',
        description: 'Латте с японским зеленым чаем матча',
        price: 220.00,
        image: 'https://images.unsplash.com/photo-1515823664972-6d66e79bc394?w=500',
        weight: 350,
        calories: 120,
        proteins: 4.5,
        fats: 5.2,
        carbohydrates: 15.8,
        isActive: true,
        isNew: true,
        stockQuantity: 80,
        categoryId: categories[5].id,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Минеральная Вода',
        slug: 'water',
        description: 'Минеральная вода без газа',
        price: 80.00,
        image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500',
        weight: 500,
        calories: 0,
        proteins: 0,
        fats: 0,
        carbohydrates: 0,
        isActive: true,
        stockQuantity: 200,
        categoryId: categories[5].id,
      },
    }),
  ]);

  console.log('✅ Created', products.length, 'products');

  // Create sample orders
  const order1 = await prisma.order.create({
    data: {
      orderNumber: 'SW-000001',
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone!,
      address: user.address!,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CARD,
      subtotal: 890.00,
      deliveryFee: 0,
      discount: 0,
      total: 890.00,
      items: {
        create: [
          {
            productId: products[0].id,
            productName: products[0].name,
            productImage: products[0].image,
            price: products[0].price,
            quantity: 1,
          },
          {
            productId: products[6].id,
            productName: products[6].name,
            productImage: products[6].image,
            price: products[6].price,
            quantity: 2,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: 'SW-000002',
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone!,
      address: user.address!,
      status: OrderStatus.PREPARING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.ONLINE,
      subtotal: 1200.00,
      deliveryFee: 150.00,
      discount: 100.00,
      total: 1250.00,
      items: {
        create: [
          {
            productId: products[10].id,
            productName: products[10].name,
            productImage: products[10].image,
            price: products[10].price,
            quantity: 1,
          },
        ],
      },
    },
  });

  console.log('✅ Created 2 sample orders');

  console.log('\n🎉 Database seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('   Admin: admin@sushiwave.com / admin123');
  console.log('   User:  user@example.com / user123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });