import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Package, ChevronDown, Search, X } from "lucide-react";
import api from "../../api/client";
import toast from "react-hot-toast";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_STYLES = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-400" },
  PROCESSING: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-400",
  },
  SHIPPED: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-400",
  },
  DELIVERED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-400",
  },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  REFUNDED: { bg: "bg-stone-100", text: "text-stone-600", dot: "bg-stone-400" },
};

function OrderDetailModal({ order, onClose, onUpdated }) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingNumber || "");
  const [saving, setSaving] = useState(false);

  async function handleUpdate() {
    setSaving(true);
    try {
      await api.patch(`/orders/${order.id}/status`, {
        status,
        trackingNumber: tracking || undefined,
      });
      toast.success("Order updated");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-lg my-8 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <div>
            <h2 className="font-semibold text-stone-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer */}
          <div className="bg-stone-50 rounded-2xl p-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
              Customer
            </p>
            <p className="font-semibold text-stone-900">
              {order.user?.firstName} {order.user?.lastName}
            </p>
            <p className="text-sm text-stone-500">{order.user?.email}</p>
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
              Items
            </p>
            <div className="space-y-2">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-100 overflow-hidden flex-shrink-0">
                    {item.product?.images?.[0]?.url ? (
                      <img
                        src={item.product.images[0].url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={14} className="text-stone-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-stone-400">
                      {[item.variant?.color, item.variant?.size]
                        .filter(Boolean)
                        .join(" · ")}{" "}
                      · ×{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-stone-900">
                    ${(Number(item.unitPrice) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount</span>
                <span>-${Number(order.discountAmount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-500">
              <span>Shipping</span>
              <span>
                {Number(order.shippingCost) === 0
                  ? "Free"
                  : `$${Number(order.shippingCost).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-100">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>

          {/* Update status */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
              Update Status
            </p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Tracking number (optional)"
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
            <button
              onClick={handleUpdate}
              disabled={saving}
              className="w-full bg-stone-900 text-white font-semibold py-3 rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50 text-sm"
            >
              {saving ? "Saving..." : "Update Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter, page],
    queryFn: () =>
      api
        .get("/orders", { params: { limit: 20, page } })
        .then((r) => r.data.data),
  });

  const orders = (data?.orders || []).filter((o) => {
    if (statusFilter && o.status !== statusFilter) return false;
    if (search && !o.id.includes(search) && !o.user?.email?.includes(search))
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-stone-900">
          Orders
        </h1>
        <p className="text-stone-400 text-sm mt-1">
          {data?.pagination?.total || 0} total orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ID or email"
            className="pl-9 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 w-56"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Status summary chips */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const count = (data?.orders || []).filter(
            (o) => o.status === s,
          ).length;
          if (!count) return null;
          const style = STATUS_STYLES[s];
          return (
            <button
              key={s}
              onClick={() => setStatusFilter((f) => (f === s ? "" : s))}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${statusFilter === s ? "border-stone-900" : "border-transparent"} ${style.bg} ${style.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
              {s} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Order
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden md:table-cell">
                Customer
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider hidden sm:table-cell">
                Date
              </th>
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Status
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {isLoading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 bg-stone-100 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-16 text-center">
                  <Package size={40} className="text-stone-200 mx-auto mb-3" />
                  <p className="text-sm text-stone-400">No orders found</p>
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const s = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
                return (
                  <tr
                    key={order.id}
                    className="hover:bg-stone-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <td className="px-5 py-4">
                      <p className="text-sm font-semibold text-stone-900 font-mono">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-stone-400">
                        {order.items?.length} item
                        {order.items?.length !== 1 ? "s" : ""}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-sm text-stone-700">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p className="text-xs text-stone-400">
                        {order.user?.email}
                      </p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-sm text-stone-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <p className="text-sm font-bold text-stone-900">
                        ${Number(order.total).toFixed(2)}
                      </p>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination?.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-stone-500">
            Page {page} of {data.pagination.totalPages}
          </span>
          <button
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => qc.invalidateQueries(["admin-orders"])}
        />
      )}
    </div>
  );
}
