import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category';
import Topping from '../models/Topping';
import Product from '../models/Product';
import User from '../models/User';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shawarma');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Category.deleteMany({}),
      Topping.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create admin user (password will be hashed by the User model's pre-save hook)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@shawarma.com',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create categories
    const categories = [
      { name: 'Shawarma', description: 'Shawarmas traditionnels et modernes', available: true },
      { name: 'Végétarien', description: 'Options végétariennes et vegan', available: true },
      { name: 'Grillades', description: 'Viandes grillées et brochettes', available: true },
      { name: 'Entrées', description: 'Mezze et entrées libanaises', available: true },
      { name: 'Boissons', description: 'Boissons chaudes et froides', available: true },
      { name: 'Desserts', description: 'Desserts orientaux et occidentaux', available: true },
    ];

    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create toppings
    const toppings = [
      { name: 'Tomates', price: 100, available: true, category: 'Légumes', description: 'Tomates fraîches' },
      { name: 'Oignons', price: 100, available: true, category: 'Légumes', description: 'Oignons blancs' },
      { name: 'Concombres', price: 100, available: true, category: 'Légumes', description: 'Concombres croquants' },
      { name: 'Sauce Ail', price: 150, available: true, category: 'Sauces', description: 'Sauce à l\'ail maison' },
      { name: 'Salade', price: 100, available: true, category: 'Légumes', description: 'Salade verte fraîche' },
      { name: 'Sauce Piquante', price: 150, available: true, category: 'Sauces', description: 'Sauce harissa' },
      { name: 'Fromage', price: 200, available: true, category: 'Fromages', description: 'Fromage blanc crémeux' },
      { name: 'Houmous', price: 200, available: true, category: 'Sauces', description: 'Houmous maison' },
      { name: 'Riz Basmati', price: 300, available: true, category: 'Autres', description: 'Riz basmati parfumé' },
      { name: 'Légumes Grillés', price: 250, available: true, category: 'Légumes', description: 'Légumes de saison grillés' },
    ];

    const createdToppings = await Topping.insertMany(toppings);
    console.log(`Created ${createdToppings.length} toppings`);

    // Create products
    const products = [
      {
        name: 'Shawarma Classique',
        description: 'Tendre agneau mariné avec légumes frais, sauce tahini et pain pita chaud',
        basePrice: 2000,
        sizeVariations: [
          { size: 'small', name: 'Petit', price: 0, available: true },
          { size: 'medium', name: 'Moyen', price: 500, available: true },
          { size: 'large', name: 'Grand', price: 1000, available: true },
        ],
        category: 'Shawarma',
        image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400&h=300&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
          'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop'
        ],
        toppings: createdToppings.slice(0, 4),
        available: true
      },
      {
        name: 'Shawarma Poulet',
        description: 'Poulet mariné aux épices, légumes croquants et sauce blanche crémeuse',
        basePrice: 1800,
        sizeVariations: [
          { size: 'small', name: 'Petit', price: 0, available: true },
          { size: 'medium', name: 'Moyen', price: 400, available: true },
          { size: 'large', name: 'Grand', price: 800, available: true },
        ],
        category: 'Shawarma',
        image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
        toppings: createdToppings.slice(0, 5),
        available: true
      },
      {
        name: 'Shawarma Mixte',
        description: 'Mélange d\'agneau et poulet avec sauce spéciale et légumes variés',
        basePrice: 2200,
        sizeVariations: [
          { size: 'small', name: 'Petit', price: 0, available: true },
          { size: 'medium', name: 'Moyen', price: 600, available: true },
          { size: 'large', name: 'Grand', price: 1200, available: true },
        ],
        category: 'Shawarma',
        image: 'https://images.unsplash.com/photo-1603360946369-dc9bb6258143?w=400&h=300&fit=crop',
        toppings: createdToppings.slice(0, 6),
        available: true
      },
      {
        name: 'Shawarma Végétarien',
        description: 'Falafel croustillant, houmous, légumes frais et sauce tahini',
        basePrice: 1600,
        sizeVariations: [
          { size: 'small', name: 'Petit', price: 0, available: true },
          { size: 'medium', name: 'Moyen', price: 400, available: true },
          { size: 'large', name: 'Grand', price: 800, available: true },
        ],
        category: 'Végétarien',
        image: 'https://images.unsplash.com/photo-1593504049359-74330189a345?w=400&h=300&fit=crop',
        toppings: [createdToppings[0], createdToppings[2], createdToppings[4], createdToppings[7]],
        available: true
      },
      {
        name: 'Assiette Grillades',
        description: 'Assortiment de viandes grillées avec riz basmati et légumes',
        basePrice: 3500,
        sizeVariations: [
          { size: 'normal', name: 'Normal', price: 0, available: true },
          { size: 'familial', name: 'Familial', price: 1500, available: true },
        ],
        category: 'Grillades',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=300&fit=crop',
        toppings: [createdToppings[8], createdToppings[9]],
        available: true
      },
      {
        name: 'Mezze Libanais',
        description: 'Assortiment d\'entrées: houmous, moutabal, taboulé, falafel',
        basePrice: 2500,
        sizeVariations: [
          { size: 'small', name: 'Petit', price: 0, available: true },
          { size: 'large', name: 'Grand', price: 1000, available: true },
        ],
        category: 'Entrées',
        image: 'https://images.unsplash.com/photo-1599020792689-9fde458e7e17?w=400&h=300&fit=crop',
        toppings: [],
        available: true
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`Created ${createdProducts.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Admin user: admin@shawarma.com / admin123`);
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Toppings: ${createdToppings.length}`);
    console.log(`- Products: ${createdProducts.length}`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed function
seedData();
