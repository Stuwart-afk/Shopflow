import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import * as bcrypt from 'bcrypt';

async function main() {
    // DB Connection 
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    console.log('🌱 Seeding database...');

    await prisma.vehicle.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Cleared old data');

    const saltRounds = 10;
    const adminPassword = await bcrypt.hash('admin12345', saltRounds);
    const advisorPassword = await bcrypt.hash('advisor123', saltRounds);
    const mechanicPassword = await bcrypt.hash('mechanic123', saltRounds);
    const customerPassword = await bcrypt.hash('customer123', saltRounds);


    const admin = await prisma.user.create({
        data: {
            name: 'Brandon Babatuan',
            email: 'admin@admin.com',
            password_hash: adminPassword,
            role: 'admin',
        },
    });
    console.log(`✅ Admin: ${admin.email}`);

    const advisor = await prisma.user.create({
        data: {
            name: 'Stuwart-Advisor',
            email: 'advisor@advisor.com',
            password_hash: advisorPassword,
            role: 'advisor',
        },
    });
    console.log(`✅ Service Advisor: ${advisor.email}`);

    const mechanic1 = await prisma.user.create({
        data: {
            name: 'Stuwart-Mechanic',
            email: 'stuwart@mechanic.com',
            password_hash: mechanicPassword,
            role: 'mechanic',
        },
    });
    console.log(`✅ Stuwart Mechanic: ${mechanic1.email}`);

    const mechanic2 = await prisma.user.create({
        data: {
            name: 'Stuwie-Mechanic',
            email: 'stuwie@mechanic.com',
            password_hash: mechanicPassword,
            role: 'mechanic',
        },
    });
    console.log(`✅ Stuwie Mechanic: ${mechanic2.email}`);

    const customerUser1 = await prisma.user.create({
        data: {
            name: 'Glenn Quagmire',
            email: 'quagmire@customer.com',
            password_hash: customerPassword,
            role: 'customer',
            customer: {
                create: {
                    phone: '09171234567',
                    vehicles: {
                        create: [
                            {
                                plate_number: 'ABC-1234',
                                make: 'Toyota',
                                model: 'Vios',
                                year: 2021,
                            },
                            {
                                plate_number: 'XYZ-1432',
                                make: 'Honda',
                                model: 'Civi',
                                year: 2019,
                            },
                        ],
                    },
                },
            },
        },
    });
    console.log(`✅ Quagmire Customer: ${customerUser1.email}`);

    const customerUser2 = await prisma.user.create({
        data: {
            name: 'Brian Quagmire',
            email: 'brian@customer.com',
            password_hash: customerPassword,
            role: 'customer',
            customer: {
                create: {
                    phone: '09189876543',
                    vehicles: {
                        create: [
                            {
                                plate_number: 'DEF-9012',
                                make: 'Mitsubishi',
                                model: 'Montero Sport',
                                year: 2022,
                            },
                        ],
                    },
                },
            },
        },
    });
    console.log(`✅ Brian Customer: ${customerUser2.email}`);

    const userCount = await prisma.user.count();
    const customerCount = await prisma.customer.count();
    const vehicleCount = await prisma.vehicle.count();

    console.log('\n📊 Seed complete!');
    console.log(`   Users:    ${userCount}`);
    console.log(`   Customers: ${customerCount}`);
    console.log(`   Vehicles:  ${vehicleCount}`);

    
    await prisma.$disconnect();
    await pool.end();
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    });