import { Request, Response } from 'express'
import prisma from '../../lib/prisma'
import { layout } from '../views/layout'

export async function getDashboard(req: Request, res: Response) {
  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 29)

  const [totalOrders, totalUsers, totalProducts, recentOrders, revenue, dailyOrders, lowStockVariants] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: true },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    // Last 30 days of orders for chart
    prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: { not: 'CANCELLED' },
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' },
    }),
    // Low stock variants
    prisma.productVariant.findMany({
      where: { stock: { lte: 5 } },
      include: { product: { select: { name: true } } },
      orderBy: { stock: 'asc' },
      take: 10,
    }),
  ])

  const totalRevenue = Number(revenue._sum.total || 0).toFixed(2)

  // Build 30-day chart data
  const chartData: { date: string; revenue: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(now.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const dayRevenue = dailyOrders
      .filter(o => o.createdAt.toISOString().slice(0, 10) === dateStr)
      .reduce((sum, o) => sum + Number(o.total), 0)
    chartData.push({ date: dateStr, revenue: dayRevenue })
  }

  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1)
  const chartLabels = chartData.map(d => {
    const date = new Date(d.date)
    return `${date.getDate()}/${date.getMonth() + 1}`
  })

  // SVG chart
  const chartWidth = 900
  const chartHeight = 200
  const padding = { top: 20, right: 20, bottom: 30, left: 60 }
  const innerWidth = chartWidth - padding.left - padding.right
  const innerHeight = chartHeight - padding.top - padding.bottom

  const points = chartData.map((d, i) => {
    const x = padding.left + (i / (chartData.length - 1)) * innerWidth
    const y = padding.top + innerHeight - (d.revenue / maxRevenue) * innerHeight
    return { x, y, ...d }
  })

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPoints = [
    `${points[0].x},${padding.top + innerHeight}`,
    ...points.map(p => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${padding.top + innerHeight}`,
  ].join(' ')

  // Y-axis labels
  const yLabels = [0, 0.25, 0.5, 0.75, 1].map(ratio => {
    const value = maxRevenue * ratio
    const y = padding.top + innerHeight - ratio * innerHeight
    return `<text x="${padding.left - 8}" y="${y + 4}" fill="#555" font-size="10" text-anchor="end">R${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value.toFixed(0)}</text>`
  }).join('')

  // X-axis labels (every 5 days)
  const xLabels = chartData.map((d, i) => {
    if (i % 5 !== 0) return ''
    const x = padding.left + (i / (chartData.length - 1)) * innerWidth
    const date = new Date(d.date)
    return `<text x="${x}" y="${chartHeight - 5}" fill="#555" font-size="10" text-anchor="middle">${date.getDate()}/${date.getMonth() + 1}</text>`
  }).join('')

  const svgChart = `
    <svg viewBox="0 0 ${chartWidth} ${chartHeight}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:200px;">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>

      <!-- Grid lines -->
      ${[0.25, 0.5, 0.75, 1].map(ratio => {
        const y = padding.top + innerHeight - ratio * innerHeight
        return `<line x1="${padding.left}" y1="${y}" x2="${padding.left + innerWidth}" y2="${y}" stroke="#1a1a1a" stroke-width="1"/>`
      }).join('')}

      <!-- Area fill -->
      <polygon points="${areaPoints}" fill="url(#areaGrad)"/>

      <!-- Line -->
      <polyline points="${polylinePoints}" fill="none" stroke="#ffffff" stroke-width="1.5"/>

      <!-- Data points -->
      ${points.filter((_, i) => i % 5 === 0).map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="3" fill="#ffffff"/>
      `).join('')}

      <!-- Y labels -->
      ${yLabels}

      <!-- X labels -->
      ${xLabels}

      <!-- Tooltip areas (invisible, for hover) -->
      ${points.map((p, i) => `
        <g class="chart-point" data-date="${p.date}" data-revenue="${p.revenue.toFixed(2)}">
          <line x1="${p.x}" y1="${padding.top}" x2="${p.x}" y2="${padding.top + innerHeight}" stroke="transparent" stroke-width="20"/>
          <circle cx="${p.x}" cy="${p.y}" r="6" fill="transparent"/>
        </g>
      `).join('')}
    </svg>
  `

  // Low stock rows
  const lowStockRows = lowStockVariants.length === 0 ? '<div class="empty-state" style="padding:2rem;">All variants well stocked</div>' : lowStockVariants.map(v => `
    <tr>
      <td><strong>${v.product.name}</strong></td>
      <td style="color:#888;">${v.color} / ${v.size}</td>
      <td>
        <span style="
          display:inline-block;
          padding:3px 10px;
          font-size:0.6rem;
          letter-spacing:0.1em;
          font-weight:600;
          background:${v.stock === 0 ? '#1a0000' : '#1a0a00'};
          color:${v.stock === 0 ? '#ff6b6b' : '#ffb347'};
          border:1px solid ${v.stock === 0 ? '#ff6b6b33' : '#ffb34733'};
        ">
          ${v.stock === 0 ? 'OUT OF STOCK' : `${v.stock} left`}
        </span>
      </td>
      <td>
        <a href="/admin/products/${v.productId}/edit" class="btn btn-sm btn-secondary">Restock</a>
      </td>
    </tr>
  `).join('')

  const recentRows = recentOrders.map(o => `
    <tr>
      <td style="color:#888;font-size:0.7rem;">#${o.id.slice(0, 8).toUpperCase()}</td>
      <td>${o.user.name}</td>
      <td>R${Number(o.total).toFixed(2)}</td>
      <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
      <td style="color:#888;font-size:0.7rem;">${new Date(o.createdAt).toLocaleDateString('en-ZA')}</td>
      <td><a href="/admin/orders/${o.id}" class="btn btn-sm btn-secondary">View</a></td>
    </tr>
  `).join('')

  const body = `
    <!-- Stats -->
    <div class="card-grid">
      <div class="card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">R${totalRevenue}</div>
        <div class="stat-sub">Excluding cancelled</div>
      </div>
      <div class="card">
        <div class="stat-label">Total Orders</div>
        <div class="stat-value">${totalOrders}</div>
      </div>
      <div class="card">
        <div class="stat-label">Customers</div>
        <div class="stat-value">${totalUsers}</div>
      </div>
      <div class="card">
        <div class="stat-label">Products</div>
        <div class="stat-value">${totalProducts}</div>
      </div>
    </div>

    <!-- Revenue Chart -->
    <div class="card" style="margin-bottom:1.5rem;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <div>
          <div class="stat-label">Revenue</div>
          <div style="font-size:0.85rem;font-weight:600;">Last 30 Days</div>
        </div>
        <div id="chart-tooltip" style="font-size:0.75rem;color:#888;text-align:right;"></div>
      </div>
      <div id="chart-container" style="position:relative;">
        ${svgChart}
      </div>
    </div>

    <!-- Bottom grid -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;">

      <!-- Recent Orders -->
      <div class="card">
        <div class="page-header" style="margin-bottom:1.5rem;">
          <span style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:#888;">Recent Orders</span>
          <a href="/admin/orders" class="btn btn-sm btn-secondary">View All</a>
        </div>
        ${recentOrders.length === 0 ? '<div class="empty-state">No orders yet</div>' : `
          <table>
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>${recentRows}</tbody>
          </table>
        `}
      </div>

      <!-- Stock Alerts -->
      <div class="card">
        <div class="page-header" style="margin-bottom:1.5rem;">
          <span style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:#888;">
            Stock Alerts
            ${lowStockVariants.length > 0 ? `<span style="display:inline-block;margin-left:0.5rem;background:#1a0000;color:#ff6b6b;font-size:0.55rem;padding:2px 8px;border-radius:2px;">${lowStockVariants.length}</span>` : ''}
          </span>
          <a href="/admin/products" class="btn btn-sm btn-secondary">All Products</a>
        </div>
        <table>
          <thead><tr><th>Product</th><th>Variant</th><th>Stock</th><th></th></tr></thead>
          <tbody>${lowStockRows}</tbody>
        </table>
      </div>
    </div>

    <script>
      // Chart hover tooltips
      document.querySelectorAll('.chart-point').forEach(point => {
        point.addEventListener('mouseenter', function() {
          const date = this.dataset.date
          const revenue = this.dataset.revenue
          const d = new Date(date)
          document.getElementById('chart-tooltip').innerHTML =
            '<span style="color:#fff;font-weight:600;">R' + revenue + '</span>' +
            '<br/><span style="color:#555;font-size:0.65rem;">' + d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) + '</span>'
        })
        point.addEventListener('mouseleave', function() {
          document.getElementById('chart-tooltip').innerHTML = ''
        })
      })
    </script>
  `

  res.send(layout('Dashboard', body, 'dashboard'))
}