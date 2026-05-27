import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../api/client';
import Alert from '../components/Alert';

type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

interface Venta {
  id: number;
  total: number;
  descuentoTotal: number;
  metodoPago?: MetodoPago;
  createdAt: string;
  detalles?: {
    productoId: number;
    cantidad: number;
    subtotal: number;
    producto?: { nombre: string };
  }[];
}

interface ProductoStock {
  id: number;
  codigoBarra?: string | null;
  nombre: string;
  stock: number;
  stockMinimo: number;
}

const formatMoney = (value: number) =>
  value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

const sameMonth = (date: Date, now: Date) =>
  date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();

const dayKey = (date: Date) => date.toISOString().slice(0, 10);

const shortDay = (date: Date) =>
  date.toLocaleDateString('es-CL', { weekday: 'short', day: '2-digit' }).replace('.', '');

export default function Dashboard() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [stockBajo, setStockBajo] = useState<ProductoStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      const [ventasData, stockData] = await Promise.all([
        apiFetch<Venta[]>('/ventas'),
        apiFetch<ProductoStock[]>('/productos/alertas/stock-bajo'),
      ]);
      setVentas(ventasData);
      setStockBajo(stockData.filter((producto) => producto.stock < 5));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const metricas = useMemo(() => {
    const now = new Date();
    const ventasMes = ventas.filter((venta) => sameMonth(new Date(venta.createdAt), now));
    const totalVentas = ventasMes.reduce((acc, venta) => acc + venta.total, 0);
    const numeroVentas = ventasMes.length;
    const ticketPromedio = numeroVentas ? totalVentas / numeroVentas : 0;
    const unidadesPorProducto = new Map<string, number>();

    for (const venta of ventasMes) {
      for (const detalle of venta.detalles ?? []) {
        const nombre = detalle.producto?.nombre ?? `Producto #${detalle.productoId}`;
        unidadesPorProducto.set(nombre, (unidadesPorProducto.get(nombre) ?? 0) + detalle.cantidad);
      }
    }

    return {
      totalVentas,
      numeroVentas,
      ticketPromedio,
      productoMasVendido: [...unidadesPorProducto.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sin ventas',
    };
  }, [ventas]);

  const ventasSemana = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return { key: dayKey(date), label: shortDay(date), total: 0 };
    });

    for (const venta of ventas) {
      const day = days.find((item) => item.key === dayKey(new Date(venta.createdAt)));
      if (day) day.total += venta.total;
    }
    return days;
  }, [ventas]);

  const topProductos = useMemo(() => {
    const ingresos = new Map<string, number>();
    for (const venta of ventas) {
      for (const detalle of venta.detalles ?? []) {
        const nombre = detalle.producto?.nombre ?? `Producto #${detalle.productoId}`;
        ingresos.set(nombre, (ingresos.get(nombre) ?? 0) + detalle.subtotal);
      }
    }
    return [...ingresos.entries()]
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [ventas]);

  const metodosPago = useMemo(() => {
    const totals: Record<MetodoPago, number> = { EFECTIVO: 0, TARJETA: 0, TRANSFERENCIA: 0 };
    for (const venta of ventas) totals[venta.metodoPago ?? 'EFECTIVO'] += venta.total;
    return [
      { label: 'Efectivo', key: 'EFECTIVO' as MetodoPago, total: totals.EFECTIVO, color: '#198754' },
      { label: 'Tarjeta', key: 'TARJETA' as MetodoPago, total: totals.TARJETA, color: '#e94560' },
      { label: 'Transferencia', key: 'TRANSFERENCIA' as MetodoPago, total: totals.TRANSFERENCIA, color: '#2563eb' },
    ];
  }, [ventas]);

  const maxSemana = Math.max(...ventasSemana.map((day) => day.total), 1);
  const maxProducto = Math.max(...topProductos.map((producto) => producto.total), 1);
  const totalMetodos = metodosPago.reduce((acc, metodo) => acc + metodo.total, 0);
  let donutOffset = 25;

  if (loading) return <div className="loading">Cargando dashboard...</div>;

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="page-subtitle">Resumen del mes, ventas recientes e inventario critico</p>
        </div>
      </div>

      {error && <Alert message={error} onClose={() => setError('')} />}

      <div className="kpi-grid">
        <article className="kpi-card"><span>Ventas totales</span><strong>{formatMoney(metricas.totalVentas)}</strong><small>Mes actual</small></article>
        <article className="kpi-card"><span>Numero de ventas</span><strong>{metricas.numeroVentas.toLocaleString('es-CL')}</strong><small>Tickets generados</small></article>
        <article className="kpi-card"><span>Producto mas vendido</span><strong>{metricas.productoMasVendido}</strong><small>Por unidades</small></article>
        <article className="kpi-card"><span>Ticket promedio</span><strong>{formatMoney(metricas.ticketPromedio)}</strong><small>Venta media</small></article>
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel dashboard-panel-wide">
          <div className="dashboard-panel-header"><h3>Ventas en el tiempo</h3><span>Ultimos 7 dias</span></div>
          <div className="line-chart">
            <svg viewBox="0 0 700 260" role="img" aria-label="Grafico de ventas de la semana">
              <polyline className="chart-grid-line" points="40,30 680,30 680,210 40,210 40,30" />
              <polyline
                className="line-chart-path"
                points={ventasSemana.map((day, index) => `${40 + index * (640 / 6)},${210 - (day.total / maxSemana) * 170}`).join(' ')}
              />
              {ventasSemana.map((day, index) => {
                const x = 40 + index * (640 / 6);
                const y = 210 - (day.total / maxSemana) * 170;
                return (
                  <g key={day.key}>
                    <circle className="line-chart-dot" cx={x} cy={y} r="5" />
                    <text x={x} y="236" textAnchor="middle">{day.label}</text>
                    <text x={x} y={Math.max(y - 12, 18)} textAnchor="middle">{formatMoney(day.total)}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header"><h3>Top 5 productos</h3><span>Ingresos</span></div>
          <div className="bar-chart">
            {topProductos.length === 0 && <p className="empty-state">No hay ventas registradas.</p>}
            {topProductos.map((producto) => (
              <div className="bar-row" key={producto.nombre}>
                <div><span>{producto.nombre}</span><strong>{formatMoney(producto.total)}</strong></div>
                <div className="bar-track"><span style={{ width: `${Math.max((producto.total / maxProducto) * 100, 4)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-header"><h3>Metodos de pago</h3><span>Distribucion</span></div>
          <div className="donut-wrap">
            <svg viewBox="0 0 42 42" className="donut-chart" role="img" aria-label="Grafico de metodos de pago">
              <circle className="donut-bg" cx="21" cy="21" r="15.915" />
              {metodosPago.map((metodo) => {
                const percent = totalMetodos ? (metodo.total / totalMetodos) * 100 : 0;
                const segment = (
                  <circle key={metodo.key} className="donut-segment" cx="21" cy="21" r="15.915" stroke={metodo.color} strokeDasharray={`${percent} ${100 - percent}`} strokeDashoffset={donutOffset} />
                );
                donutOffset -= percent;
                return segment;
              })}
            </svg>
            <div className="donut-legend">
              {metodosPago.map((metodo) => (
                <div key={metodo.key}><span style={{ background: metodo.color }} /><strong>{metodo.label}</strong><em>{formatMoney(metodo.total)}</em></div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="dashboard-panel inventory-alerts">
        <div className="dashboard-panel-header"><h3>Productos por agotarse</h3><span>Menos de 5 unidades</span></div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Producto</th><th>Codigo</th><th>Stock</th><th>Minimo</th></tr></thead>
            <tbody>
              {stockBajo.slice(0, 12).map((producto) => (
                <tr key={producto.id}><td>{producto.nombre}</td><td>{producto.codigoBarra || '-'}</td><td><span className="badge badge-red">{producto.stock}</span></td><td>{producto.stockMinimo}</td></tr>
              ))}
              {stockBajo.length === 0 && <tr><td colSpan={4}><div className="empty-cart">No hay productos bajo 5 unidades.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
