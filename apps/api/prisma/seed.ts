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

const PRODUCT_COUNT = Number(process.env.SEED_PRODUCT_COUNT ?? 480);
const BATCH_SIZE = 1000;
const MAX_ITEMS_PER_BASE_PRODUCT = 6;

const rolesSeed = [
  { codigo: 'SUPER_ADMIN', nombre: 'Super admin', descripcion: 'Acceso completo al sistema' },
  { codigo: 'ADMIN', nombre: 'Admin', descripcion: 'Administracion operativa del minimarket' },
  { codigo: 'SUPERVISOR', nombre: 'Supervisor', descripcion: 'Supervision de operaciones y autorizaciones' },
  { codigo: 'VENDEDOR', nombre: 'Vendedor', descripcion: 'Operacion de ventas' },
];

const permisosSeed = [
  { codigo: 'dashboard.ver', modulo: 'dashboard', descripcion: 'Ver dashboard operativo' },
  { codigo: 'usuarios.gestionar', modulo: 'usuarios', descripcion: 'Crear, editar, listar y eliminar usuarios' },
  { codigo: 'stock.autorizar', modulo: 'ventas', descripcion: 'Autorizar ventas con stock insuficiente' },
];

const permisosPorRol: Record<string, string[]> = {
  SUPER_ADMIN: permisosSeed.map((permiso) => permiso.codigo),
  ADMIN: ['stock.autorizar'],
  SUPERVISOR: ['stock.autorizar'],
  VENDEDOR: ['dashboard.ver'],
};

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
  { nombre: 'Coca-Cola Embonor', telefono: '+56940001001', email: 'ventas.embonor@example.com', direccion: 'Av. Las Condes 12200, Santiago' },
  { nombre: 'Nestle Chile', telefono: '+56940001002', email: 'pedidos.nestle@example.com', direccion: 'Las Condes 11287, Santiago' },
  { nombre: 'Watt\'s Comercial', telefono: '+56940001003', email: 'distribucion.watts@example.com', direccion: 'Camino Melipilla 10600, Maipu' },
  { nombre: 'Unilever Chile', telefono: '+56940001004', email: 'clientes.unilever@example.com', direccion: 'Av. Presidente Riesco 5335, Santiago' },
  { nombre: 'Carozzi', telefono: '+56940001005', email: 'ventas.carozzi@example.com', direccion: 'Camino Longitudinal Sur 5201, San Bernardo' },
  { nombre: 'CCU', telefono: '+56940001006', email: 'pedidos.ccu@example.com', direccion: 'Av. Vitacura 2670, Santiago' },
  { nombre: 'Agrosuper', telefono: '+56940001007', email: 'comercial.agrosuper@example.com', direccion: 'Camino La Estrella 401, Rancagua' },
  { nombre: 'Soprole', telefono: '+56940001008', email: 'distribucion.soprole@example.com', direccion: 'Av. Santa Maria 0842, Santiago' },
  { nombre: 'Dimak Mayorista', telefono: '+56940001009', email: 'ventas.dimak@example.com', direccion: 'Av. Americo Vespucio 1501, Quilicura' },
  { nombre: 'Distribuidora Rabie', telefono: '+56940001010', email: 'pedidos.rabie@example.com', direccion: 'Panamericana Norte 18900, Lampa' },
];

type CatalogoCategoria = {
  nombre: string;
  productos: string[];
  marcas: string[];
  variantes: string[];
  formatos: string[];
  precioMin: number;
  precioMax: number;
};

type ProductoCatalogo = {
  categoriaNombre: string;
  producto: string;
  marca: string;
  variante: string;
  formato: string;
};

const catalogoProductos: CatalogoCategoria[] = [
  {
    nombre: 'Bebidas',
    productos: ['Bebida cola', 'Bebida lima limon', 'Bebida naranja', 'Agua mineral', 'Jugo nectar', 'Bebida energetica', 'Te helado', 'Agua saborizada'],
    marcas: ['Coca-Cola', 'Sprite', 'Fanta', 'Vital', 'Andina', 'Watts', 'Red Bull', 'Kem'],
    variantes: ['Original', 'Sin azucar', 'Light', 'Zero', 'Naranja', 'Manzana', 'Durazno', 'Limon'],
    formatos: ['350 ml lata', '500 ml botella', '1 L botella', '1.5 L botella', '2 L botella', '2.5 L botella', '6 x 350 ml', '12 x 350 ml'],
    precioMin: 700,
    precioMax: 12990,
  },
  {
    nombre: 'Lacteos',
    productos: ['Leche', 'Yogur', 'Queso gauda', 'Quesillo', 'Mantequilla', 'Crema de leche', 'Manjar', 'Postre lacteo'],
    marcas: ['Soprole', 'Colun', 'Loncoleche', 'Nestle', 'Quillayes', 'Watts', 'Parmalat', 'Surlat'],
    variantes: ['Entera', 'Descremada', 'Sin lactosa', 'Protein', 'Natural', 'Frutilla', 'Vainilla', 'Light'],
    formatos: ['125 g', '170 g', '250 g', '500 g', '900 g', '1 kg', '1 L', '6 unidades'],
    precioMin: 650,
    precioMax: 8990,
  },
  {
    nombre: 'Abarrotes',
    productos: ['Arroz', 'Fideos', 'Aceite', 'Harina', 'Azucar', 'Sal', 'Lentejas', 'Salsa de tomate'],
    marcas: ['Carozzi', 'Tucapel', 'Chef', 'Miraflores', 'Iansa', 'Lobos', 'Banquete', 'Lucchetti'],
    variantes: ['Grado 1', 'Integral', 'Tradicional', 'Libre de gluten', 'Maravilla', 'Canola', 'Fina', 'Con albahaca'],
    formatos: ['200 g', '400 g', '500 g', '750 g', '1 kg', '1.5 kg', '2 kg', '5 kg'],
    precioMin: 490,
    precioMax: 12990,
  },
  {
    nombre: 'Limpieza',
    productos: ['Detergente', 'Cloro', 'Lavalozas', 'Papel higienico', 'Toalla absorbente', 'Limpiador piso', 'Desinfectante', 'Suavizante'],
    marcas: ['Omo', 'Quix', 'Clorinda', 'Nova', 'Elite', 'Poett', 'Virutex', 'Comfort'],
    variantes: ['Original', 'Limon', 'Lavanda', 'Antibacterial', 'Ultra', 'Hipoalergenico', 'Concentrado', 'Aroma floral'],
    formatos: ['450 ml', '750 ml', '900 ml', '1 L', '1.5 L', '3 L', '6 unidades', '12 unidades'],
    precioMin: 890,
    precioMax: 15990,
  },
  {
    nombre: 'Confites',
    productos: ['Chocolate', 'Galleta', 'Caramelo', 'Papas fritas', 'Ramitas', 'Alfajor', 'Chicle', 'Barra cereal'],
    marcas: ['Sahne Nuss', 'Costa', 'Ambrosoli', 'Evercrisp', 'Marco Polo', 'Bon o Bon', 'Trident', 'Nutra Bien'],
    variantes: ['Leche', 'Bitter', 'Vainilla', 'Chocolate', 'Queso', 'Menta', 'Frutilla', 'Avellana'],
    formatos: ['30 g', '45 g', '85 g', '100 g', '140 g', '180 g', '250 g', '12 unidades'],
    precioMin: 350,
    precioMax: 6990,
  },
  {
    nombre: 'Panaderia',
    productos: ['Pan molde', 'Pan integral', 'Hallulla', 'Marraqueta', 'Queque', 'Masa pizza', 'Tortilla', 'Pan pita'],
    marcas: ['Ideal', 'Castaño', 'San Camilo', 'Kingsbury', 'Cuisine & Co', 'Tarragona', 'Fuchs', 'La Selecta'],
    variantes: ['Blanco', 'Integral', 'Multigrano', 'Sin azucar', 'Vainilla', 'Chocolate', 'Tradicional', 'Artesanal'],
    formatos: ['250 g', '400 g', '500 g', '600 g', '700 g', '800 g', '6 unidades', '12 unidades'],
    precioMin: 790,
    precioMax: 5990,
  },
  {
    nombre: 'Congelados',
    productos: ['Hamburguesa', 'Papas prefritas', 'Verduras surtidas', 'Pizza', 'Helado', 'Nuggets', 'Choclo', 'Empanada'],
    marcas: ['La Crianza', 'Minuto Verde', 'Frutos del Maipo', 'San Jorge', 'Savory', 'Tarragona', 'Cuisine & Co', 'PF'],
    variantes: ['Vacuno', 'Pollo', 'Queso', 'Primavera', 'Vainilla', 'Napolitana', 'Familiar', 'Tradicional'],
    formatos: ['250 g', '400 g', '500 g', '700 g', '1 kg', '1.5 kg', '6 unidades', '12 unidades'],
    precioMin: 1490,
    precioMax: 14990,
  },
  {
    nombre: 'Frutas y Verduras',
    productos: ['Manzana', 'Platano', 'Tomate', 'Papa', 'Cebolla', 'Zanahoria', 'Lechuga', 'Palta'],
    marcas: ['Huerto Central', 'Campo Lindo', 'Valle Verde', 'Agro Maule', 'Fruta Sur', 'La Vega', 'Bio Campo', 'Santa Isabel'],
    variantes: ['Roja', 'Verde', 'Maduro', 'Malla', 'Primera seleccion', 'Organica', 'Nacional', 'Premium'],
    formatos: ['unidad', '500 g', '1 kg', '1.5 kg', '2 kg', '3 kg', '5 kg', 'bandeja'],
    precioMin: 390,
    precioMax: 9990,
  },
  {
    nombre: 'Cuidado Personal',
    productos: ['Shampoo', 'Jabon', 'Pasta dental', 'Cepillo dental', 'Desodorante', 'Acondicionador', 'Toalla higienica', 'Alcohol gel'],
    marcas: ['Dove', 'Rexona', 'Colgate', 'Pepsodent', 'Nivea', 'Head & Shoulders', 'Kotex', 'Elite'],
    variantes: ['Original', 'Sensitive', 'Menta', 'Antibacterial', 'Humectante', 'Control caida', 'Invisible', 'Aloe vera'],
    formatos: ['75 ml', '90 g', '150 ml', '250 ml', '350 ml', '400 ml', '6 unidades', '16 unidades'],
    precioMin: 690,
    precioMax: 8990,
  },
  {
    nombre: 'Mascotas',
    productos: ['Alimento perro', 'Alimento gato', 'Snack perro', 'Arena sanitaria', 'Collar', 'Shampoo mascota', 'Lata gato', 'Hueso carnaza'],
    marcas: ['Dog Chow', 'Cat Chow', 'Champion Dog', 'Whiskas', 'Master Dog', 'Pedigree', 'Fit Formula', 'Doko'],
    variantes: ['Adulto', 'Cachorro', 'Senior', 'Carne', 'Pollo', 'Pescado', 'Control olor', 'Piel sensible'],
    formatos: ['85 g', '100 g', '500 g', '1 kg', '3 kg', '8 kg', '10 kg', '15 kg'],
    precioMin: 790,
    precioMax: 35990,
  },
];

const adjetivosDescripcion = ['seleccionado', 'familiar', 'de alta rotacion', 'para venta diaria', 'con stock estable', 'formato conveniente', 'calidad supermercado', 'ideal para minimarket'];

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

function shuffle<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(0, index);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function roundTo(value: number, step: number) {
  return Math.round(value / step) * step;
}

function buildProductCatalog() {
  const productos: ProductoCatalogo[] = [];

  for (const categoria of catalogoProductos) {
    for (const producto of categoria.productos) {
      const combinacionesProducto: ProductoCatalogo[] = [];

      for (const marca of categoria.marcas) {
        for (const variante of categoria.variantes) {
          for (const formato of categoria.formatos) {
            combinacionesProducto.push({
              categoriaNombre: categoria.nombre,
              producto,
              marca,
              variante,
              formato,
            });
          }
        }
      }

      productos.push(...shuffle(combinacionesProducto).slice(0, MAX_ITEMS_PER_BASE_PRODUCT));
    }
  }

  if (productos.length < PRODUCT_COUNT) {
    throw new Error(`El catalogo solo permite ${productos.length} productos unicos. Reduce PRODUCT_COUNT o agrega mas combinaciones.`);
  }

  return shuffle(productos).slice(0, PRODUCT_COUNT);
}

function getCatalogoCategoria(nombre: string) {
  const catalogo = catalogoProductos.find((categoria) => categoria.nombre === nombre);
  if (!catalogo) throw new Error(`No existe catalogo para la categoria ${nombre}.`);
  return catalogo;
}

function calcularPrecio(catalogo: CatalogoCategoria) {
  const base = randomInt(catalogo.precioMin, catalogo.precioMax);
  return roundTo(base, base >= 10000 ? 100 : 10);
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

async function crearRolesYPermisos() {
  for (const rol of rolesSeed) {
    await prisma.rol.upsert({
      where: { codigo: rol.codigo },
      update: { nombre: rol.nombre, descripcion: rol.descripcion, activo: true },
      create: { ...rol, activo: true },
    });
  }

  for (const permiso of permisosSeed) {
    await prisma.permiso.upsert({
      where: { codigo: permiso.codigo },
      update: { modulo: permiso.modulo, descripcion: permiso.descripcion },
      create: permiso,
    });
  }

  await prisma.rolPermiso.deleteMany();

  for (const [rolCodigo, permisos] of Object.entries(permisosPorRol)) {
    const rol = await prisma.rol.findUnique({ where: { codigo: rolCodigo } });
    if (!rol) throw new Error(`Rol no creado: ${rolCodigo}.`);

    for (const permisoCodigo of permisos) {
      const permiso = await prisma.permiso.findUnique({ where: { codigo: permisoCodigo } });
      if (!permiso) throw new Error(`Permiso no creado: ${permisoCodigo}.`);

      await prisma.rolPermiso.create({
        data: {
          rolId: rol.id,
          permisoId: permiso.id,
        },
      });
    }
  }
}

async function crearUsuariosBase() {
  const usuarios = [
    {
      nombre: 'Super Admin',
      email: 'superadmin@minimarket.local',
      password: 'SuperAdmin123',
      pinAutorizacion: '1234',
      rol: 'SUPER_ADMIN' as const,
    },
    {
      nombre: 'Admin',
      email: 'admin@minimarket.local',
      password: 'Admin123',
      pinAutorizacion: '2222',
      rol: 'ADMIN' as const,
    },
    {
      nombre: 'Supervisor',
      email: 'supervisor@minimarket.local',
      password: 'Supervisor123',
      pinAutorizacion: '3333',
      rol: 'SUPERVISOR' as const,
    },
  ];

  for (const usuario of usuarios) {
    await prisma.usuario.upsert({
      where: { email: usuario.email },
      update: {
        nombre: usuario.nombre,
        pinAutorizacionHash: hashPassword(usuario.pinAutorizacion),
        rol: { connect: { codigo: usuario.rol } },
        activo: true,
      },
      create: {
        nombre: usuario.nombre,
        email: usuario.email,
        passwordHash: hashPassword(usuario.password),
        pinAutorizacionHash: hashPassword(usuario.pinAutorizacion),
        rol: { connect: { codigo: usuario.rol } },
        activo: true,
      },
    });
  }
}

async function main() {
  console.log('Creando roles y permisos...');
  await crearRolesYPermisos();

  console.log('Creando usuarios base...');
  await crearUsuariosBase();

  console.log('Limpiando datos existentes...');
  await limpiarDatos();

  console.log('Creando categorias...');
  const categorias = await Promise.all(
    categoriasSeed.map((categoria) => prisma.categoria.create({ data: categoria })),
  );
  const categoriasByNombre = new Map(categorias.map((categoria) => [categoria.nombre, categoria]));

  console.log('Creando proveedores...');
  const proveedores = await Promise.all(
    proveedoresSeed.map((proveedor) => prisma.proveedor.create({ data: proveedor })),
  );

  console.log(`Creando ${PRODUCT_COUNT.toLocaleString('es-CL')} productos...`);
  const now = new Date();
  const productosCatalogo = buildProductCatalog();

  for (let offset = 0; offset < PRODUCT_COUNT; offset += BATCH_SIZE) {
    const size = Math.min(BATCH_SIZE, PRODUCT_COUNT - offset);
    const data = Array.from({ length: size }, (_, localIndex) => {
      const index = offset + localIndex + 1;
      const item = productosCatalogo[offset + localIndex];
      const catalogo = getCatalogoCategoria(item.categoriaNombre);
      const categoria = categoriasByNombre.get(item.categoriaNombre);
      if (!categoria) throw new Error(`Categoria no creada: ${item.categoriaNombre}.`);

      const proveedor = proveedores[(catalogo.marcas.indexOf(item.marca) + index) % proveedores.length];
      const precioVenta = calcularPrecio(catalogo);
      const stock = randomInt(0, 200);
      const stockMinimo = randomInt(5, 20);
      const descuento = random() < 0.08 ? randomInt(5, 25) : 0;
      const createdAt = new Date(now.getTime() - randomInt(0, 180) * 24 * 60 * 60 * 1000);
      const nombre = `${item.producto} ${item.marca} ${item.variante} ${item.formato}`;

      return {
        codigoBarra: ean13(index),
        nombre,
        descripcion: `${nombre}, producto ${pick(adjetivosDescripcion)} distribuido por ${proveedor.nombre}.`,
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
