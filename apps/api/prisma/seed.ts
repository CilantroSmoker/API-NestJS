import { config } from 'dotenv';
import { resolve } from 'path';
import { randomBytes, scryptSync } from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

config({ path: resolve(__dirname, '../../.env') });
config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no esta definida.');
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

const PRODUCT_COUNT = 10000;
const BATCH_SIZE = 1000;

const categoriasSeed = [
  { nombre: 'Bebidas', descripcion: 'Bebidas gaseosas, jugos, aguas y energeticas', descuento: 0 },
  { nombre: 'Lacteos', descripcion: 'Leches, yogures, quesos y derivados', descuento: 0 },
  { nombre: 'Abarrotes', descripcion: 'Productos basicos de despensa', descuento: 0 },
  { nombre: 'Limpieza', descripcion: 'Articulos de aseo para el hogar', descuento: 0 },
  { nombre: 'Confites', descripcion: 'Chocolates, dulces, galletas y snacks', descuento: 0 },
  { nombre: 'Panaderia', descripcion: 'Panes, masas y productos horneados', descuento: 0 },
  { nombre: 'Congelados', descripcion: 'Comidas y productos congelados', descuento: 0 },
  { nombre: 'Frutas y Verduras', descripcion: 'Productos frescos de temporada', descuento: 0 },
  { nombre: 'Cuidado Personal', descripcion: 'Higiene y cuidado personal', descuento: 0 },
  { nombre: 'Mascotas', descripcion: 'Alimentos y accesorios para mascotas', descuento: 0 },
];

const proveedoresSeed = [
  { nombre: 'Distribuidora Central', telefono: '+56940001001', email: 'contacto.central@example.com', direccion: 'Av. Principal 1200, Santiago' },
  { nombre: 'Comercial San Pedro', telefono: '+56940001002', email: 'ventas.sanpedro@example.com', direccion: 'San Pedro 455, Curico' },
  { nombre: 'Proveedor Maule', telefono: '+56940001003', email: 'maule.proveedor@example.com', direccion: 'Ruta 5 Sur Km 250, Talca' },
  { nombre: 'Alimentos del Sur', telefono: '+56940001004', email: 'pedidos.sur@example.com', direccion: 'Camino Industrial 88, Chillan' },
  { nombre: 'Bebidas Chile', telefono: '+56940001005', email: 'ventas.bebidas@example.com', direccion: 'Los Aromos 331, Santiago' },
  { nombre: 'Lacteos Los Andes', telefono: '+56940001006', email: 'contacto.losandes@example.com', direccion: 'Los Andes 901, Linares' },
  { nombre: 'Comercial Don Juan', telefono: '+56940001007', email: 'donjuan@example.com', direccion: 'Arturo Prat 640, Talca' },
  { nombre: 'Distribuidora Talca', telefono: '+56940001008', email: 'distribuidora.talca@example.com', direccion: 'Uno Sur 1550, Talca' },
  { nombre: 'Productos El Bosque', telefono: '+56940001009', email: 'elbosque@example.com', direccion: 'El Bosque 720, Rancagua' },
  { nombre: 'Mayorista Express', telefono: '+56940001010', email: 'mayorista.express@example.com', direccion: 'Av. Comercio 300, Santiago' },
];

const productosPorCategoria: Record<string, string[]> = {
  Bebidas: ['Coca Cola', 'Sprite', 'Fanta', 'Agua mineral', 'Jugo naranja', 'Bebida energetica', 'Te helado', 'Soda'],
  Lacteos: ['Leche entera', 'Leche descremada', 'Yogur frutilla', 'Queso gauda', 'Mantequilla', 'Crema de leche', 'Quesillo', 'Manjar'],
  Abarrotes: ['Arroz grado 1', 'Fideos espiral', 'Aceite maravilla', 'Harina sin polvos', 'Azucar granulada', 'Sal fina', 'Lentejas', 'Salsa tomate'],
  Limpieza: ['Detergente liquido', 'Cloro gel', 'Lavalozas', 'Papel higienico', 'Toalla nova', 'Limpiador piso', 'Desinfectante', 'Esponja multiuso'],
  Confites: ['Chocolate leche', 'Galleta vainilla', 'Caramelo surtido', 'Papas fritas', 'Ramitas queso', 'Alfajor', 'Chicle menta', 'Barra cereal'],
  Panaderia: ['Pan molde blanco', 'Pan integral', 'Hallulla', 'Marraqueta', 'Queque vainilla', 'Masa pizza', 'Tortilla', 'Pan pita'],
  Congelados: ['Hamburguesa vacuno', 'Papas prefritas', 'Verduras surtidas', 'Pizza congelada', 'Helado vainilla', 'Nuggets pollo', 'Choclo congelado', 'Empanada queso'],
  'Frutas y Verduras': ['Manzana roja', 'Platano', 'Tomate larga vida', 'Papa malla', 'Cebolla', 'Zanahoria', 'Lechuga', 'Palta hass'],
  'Cuidado Personal': ['Shampoo familiar', 'Jabon tocador', 'Pasta dental', 'Cepillo dental', 'Desodorante', 'Acondicionador', 'Toalla higienica', 'Alcohol gel'],
  Mascotas: ['Alimento perro adulto', 'Alimento gato adulto', 'Snack perro', 'Arena sanitaria', 'Collar mascota', 'Shampoo mascota', 'Lata gato', 'Hueso carnaza'],
};

const formatos = ['250 g', '500 g', '1 kg', '1.5 L', '2 L', '6 un', '12 un', 'familiar', 'premium', 'economico'];

let seed = 20260509;

function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}

function randomInt(min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function pick<T>(items: T[]) {
  return items[randomInt(0, items.length - 1)];
}

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function ean13(index: number) {
  const base = `780${String(100000000 + index).slice(0, 9)}`;
  const digits = base.split('').map(Number);
  const sum = digits.reduce((acc, digit, position) => acc + digit * (position % 2 === 0 ? 1 : 3), 0);
  const checksum = (10 - (sum % 10)) % 10;
  return `${base}${checksum}`;
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64);
  return `scrypt:${salt}:${derivedKey.toString('hex')}`;
}

async function limpiarDatos() {
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.movimiento.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.categoria.deleteMany();
}

async function crearUsuariosBase() {
  const usuarios = [
    {
      nombre: 'Super Admin',
      email: 'superadmin@minimarket.local',
      password: 'SuperAdmin123',
      rol: 'SUPER_ADMIN' as const,
    },
    {
      nombre: 'Admin',
      email: 'admin@minimarket.local',
      password: 'Admin123',
      rol: 'ADMIN' as const,
    },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {
        nombre: usuario.nombre,
        rol: usuario.rol,
        activo: true,
      },
      create: {
        nombre: usuario.nombre,
        email: usuario.email,
        passwordHash: hashPassword(usuario.password),
        rol: usuario.rol,
        activo: true,
      },
    });
  }
}

async function main() {
  console.log('Creando usuarios base...');
  await crearUsuariosBase();

  console.log('Limpiando datos existentes...');
  await limpiarDatos();

  console.log('Creando categorias...');
  const categorias = await Promise.all(
    categoriasSeed.map((categoria) => prisma.categoria.create({ data: categoria })),
  );

  console.log('Creando proveedores...');
  const proveedores = await Promise.all(
    proveedoresSeed.map((proveedor) => prisma.proveedor.create({ data: proveedor })),
  );

  console.log(`Creando ${PRODUCT_COUNT.toLocaleString('es-CL')} productos...`);
  const now = new Date();

  for (let offset = 0; offset < PRODUCT_COUNT; offset += BATCH_SIZE) {
    const size = Math.min(BATCH_SIZE, PRODUCT_COUNT - offset);
    const data = Array.from({ length: size }, (_, localIndex) => {
      const index = offset + localIndex + 1;
      const categoria = categorias[index % categorias.length];
      const proveedor = proveedores[(index * 7) % proveedores.length];
      const baseName = pick(productosPorCategoria[categoria.nombre]);
      const formato = pick(formatos);
      const precioVenta = roundTo(randomInt(500, 15000), 10);
      const stock = randomInt(0, 200);
      const stockMinimo = randomInt(5, 20);
      const descuento = random() < 0.08 ? randomInt(5, 25) : 0;
      const createdAt = new Date(now.getTime() - randomInt(0, 180) * 24 * 60 * 60 * 1000);

      return {
        codigoBarra: ean13(index),
        nombre: `${baseName} ${formato} #${String(index).padStart(5, '0')}`,
        descripcion: `${baseName} ${formato} distribuido por ${proveedor.nombre}`,
        precio: precioVenta,
        stock,
        stockMinimo,
        descuento,
        categoriaId: categoria.id,
        proveedorId: proveedor.id,
        createdAt,
        updatedAt: createdAt,
      };
    });

    await prisma.producto.createMany({ data });
    console.log(`Productos creados: ${(offset + size).toLocaleString('es-CL')}/${PRODUCT_COUNT.toLocaleString('es-CL')}`);
  }

  console.log('Seed completado correctamente.');
}

main()
  .catch((error) => {
    console.error('Error ejecutando seed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
