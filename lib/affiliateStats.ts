import { db } from "@/lib/db";
import { computeAffiliateCommissions, sumCommissions, currentApplicableRate } from "@/lib/affiliateCommission";

// Shared by /api/affiliates/[id] (staff, any affiliate) and
// /api/affiliates/me (the logged-in affiliate, scoped to themselves) so both
// views compute stats identically.
export async function getAffiliateStats(affiliateId: string) {
  const affiliate = await db.affiliate.findUnique({ where: { id: affiliateId }, include: { tiers: true } });
  if (!affiliate) return null;

  const orders = await db.order.findMany({
    where: { affiliateId },
    orderBy: { createdAt: "asc" },
    include: { customer: true },
  });

  const paidOrders = orders.filter((o) => o.paymentStatus === "paid");
  const commissionInputs = paidOrders.map((o) => ({ id: o.id, netRevenue: o.subtotal - o.discountAmount }));
  const commissions = computeAffiliateCommissions(commissionInputs, affiliate.baseCommissionRate, affiliate.tiers);
  const commissionByOrderId = new Map(commissions.map((c) => [c.orderId, c]));
  const totalRevenue = commissionInputs.reduce((s, o) => s + o.netRevenue, 0);
  const totalCommission = sumCommissions(commissions);

  const byCustomer = new Map<
    string,
    { customer: (typeof orders)[number]["customer"]; orderCount: number; paidOrderCount: number; revenue: number; commission: number }
  >();
  for (const order of orders) {
    if (!byCustomer.has(order.customerId)) {
      byCustomer.set(order.customerId, { customer: order.customer, orderCount: 0, paidOrderCount: 0, revenue: 0, commission: 0 });
    }
    const entry = byCustomer.get(order.customerId)!;
    entry.orderCount += 1;
    if (order.paymentStatus === "paid") {
      entry.paidOrderCount += 1;
      const netRevenue = order.subtotal - order.discountAmount;
      entry.revenue += netRevenue;
      entry.commission += commissionByOrderId.get(order.id)?.commission ?? 0;
    }
  }

  return {
    affiliate: {
      id: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
      code: affiliate.code,
      customerDiscountType: affiliate.customerDiscountType,
      customerDiscountValue: affiliate.customerDiscountValue,
      baseCommissionRate: affiliate.baseCommissionRate,
      active: affiliate.active,
      tiers: affiliate.tiers.map((t) => ({ id: t.id, minSales: t.minSales, rate: t.rate })),
    },
    totalReferredCustomers: byCustomer.size,
    totalOrders: orders.length,
    totalPaidOrders: paidOrders.length,
    totalRevenue,
    totalCommission,
    currentRate: currentApplicableRate(totalRevenue, affiliate.baseCommissionRate, affiliate.tiers),
    customers: Array.from(byCustomer.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map((e) => ({
        id: e.customer.id,
        name: `${e.customer.firstName} ${e.customer.lastName}`,
        email: e.customer.email,
        orderCount: e.orderCount,
        paidOrderCount: e.paidOrderCount,
        revenue: e.revenue,
        commission: e.commission,
      })),
  };
}
