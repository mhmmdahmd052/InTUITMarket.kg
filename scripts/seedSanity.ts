import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import path from 'path';

// Fix path resolution for npx sanity exec compilation folders:
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Allow grabbing the token from the command line argument if pasted
const cliToken = process.argv.length > 2 ? process.argv[process.argv.length - 1] : null;

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

if (!projectId || projectId === "yourprojectid" || projectId === "a1b2c3d4") {
  console.log('\n======================================================');
  console.log('🚨 STOP: ACTION REQUIRED TO FIX YOUR ERROR 🚨');
  console.log('======================================================\n');
  console.log('You are currently experiencing an error because the Sanity script');
  console.log('does not know WHICH database to connect to. I cannot guess your ID.');
  console.log('\nTo fix this permanently:');
  console.log('1. Go to your browser and log in at: https://www.sanity.io/manage');
  console.log('2. Click on your project name.');
  console.log('3. Copy your 8-character "Project ID" (e.g., pv8y60zz).');
  console.log('4. Open the file: web/.env.local');
  console.log('5. Change NEXT_PUBLIC_SANITY_PROJECT_ID="yourprojectid" to your new copied ID.');
  console.log('\nOnce you complete Step 5, run "npm run seed" again and it will work instantly!');
  console.log('\n======================================================\n');
  process.exit(1);
}

// Setup a client that uses the API token to allow writes
const client = createClient({
  projectId: projectId,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-03-27',
  token: cliToken || process.env.SANITY_TOKEN,
  useCdn: false,
});

async function runSeed() {
  console.log('Seeding data to Sanity.io...');

  const dummyProjects = [
    {
      _type: 'project',
      name: 'Steel Beam Structure A',
      status: 'completed',
      price: 24500,
      description: 'High strength cross beams for structural support in multi-level architectures.',
    },
    {
      _type: 'project',
      name: 'Reinforced Concrete Foundation',
      status: 'in-progress',
      price: 18200,
      description: 'Industrial grade foundational pour with heavy rebar framework.',
    },
    {
      _type: 'project',
      name: 'Commercial Facade Renovation',
      status: 'planning',
      price: 85000,
      description: 'Glass and steel exterior finishing for commercial building.',
    },
    {
      _type: 'project',
      name: 'Portland Cement Mix (50kg)',
      status: 'completed',
      price: 4500,
      description: 'Standard structural grade cement mixture for load-bearing pillars.',
    },
    {
      _type: 'project',
      name: 'Heavy Gauge Steel Bars (A500)',
      status: 'in-progress',
      price: 7500,
      description: 'Carbon-spec structural reinforcement grating for foundational meshes.',
    },
    {
      _type: 'project',
      name: 'Industrial Crane Rigging Wire',
      status: 'planning',
      price: 12400,
      description: 'Braided steel wire optimized for heavy lifting and overhead assembly loads.',
    },
    {
      _type: 'project',
      name: 'Pre-cast Concrete Panels',
      status: 'completed',
      price: 33000,
      description: 'Modular pre-cast concrete walls for rapid skyscraper exterior paneling.',
    },
    {
      _type: 'project',
      name: 'Titanium Fastener Bolts (Box)',
      status: 'completed',
      price: 850,
      description: 'Corrosion-resistant titanium bolts used for critical joint junctions.',
    },
    {
      _type: 'project',
      name: 'Structural Insulated Panels (SIPs)',
      status: 'in-progress',
      price: 14200,
      description: 'High-performance foam core sandwich panels for structural walls and roofs.',
    },
    {
      _type: 'project',
      name: 'Galvanized Roof Trusses',
      status: 'planning',
      price: 48000,
      description: 'Engineered zinc-coated steel frameworks for long-span warehouse roofing.',
    },
    {
      _type: 'project',
      name: 'Acoustic Ceiling Grid System',
      status: 'completed',
      price: 9300,
      description: 'Suspended industrial grid system engineered to dampen interior acoustics.',
    },
    {
      _type: 'project',
      name: 'Epoxy Floor Coating (50gal)',
      status: 'in-progress',
      price: 11000,
      description: 'Chemical-resistant industrial warehouse flooring compound.',
    }
  ];

  try {
    for (const project of dummyProjects) {
      console.log(`Creating project: ${project.name}`);
      await client.create(project);
    }
    console.log('Seed completed successfully!');
  } catch (err) {
    console.error('Error seeding data:', err);
  }
}

runSeed();
