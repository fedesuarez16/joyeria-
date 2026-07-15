"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart, cartSubtotal } from "@/store/cart";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/format";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

type Coupon = { code: string; discount_type: string; value: number };

export function CartView() {
  const { items, removeItem, setQuantity, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="mt-12 text-center">
        <p className="text-stone-500">Tu carrito está vacío.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const discount = coupon
    ? coupon.discount_type === "percent"
      ? Math.round(((subtotal * coupon.value) / 100) * 100) / 100
      : Math.min(coupon.value, subtotal)
    : 0;
  const total = subtotal - discount;

  async function applyCoupon() {
    setCouponError(null);
    if (!couponInput.trim()) return;
    const supabase = createClient();
    const { data, error } = await supabase.rpc("validate_coupon", {
      p_code: couponInput.trim(),
    });
    if (error || !data || data.length === 0) {
      setCoupon(null);
      setCouponError("Cupón inválido o vencido");
      return;
    }
    setCoupon(data[0]);
  }

  async function checkout() {
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("create_order", {
      p_items: items.map((i) => ({
        product_id: i.productId,
        variant_id: i.variantId,
        quantity: i.quantity,
      })),
      p_customer_name: customerName.trim(),
      p_customer_phone: "",
      p_coupon_code: coupon?.code ?? undefined,
    });
    setSubmitting(false);

    if (error) {
      setError(error.message);
      return;
    }

    const order = data as {
      order_number: number;
      subtotal: number;
      discount: number;
      total: number;
    };

    const url = buildWhatsAppUrl(items, {
      orderNumber: order.order_number,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      total: Number(order.total),
      couponCode: coupon?.code,
      customerName: customerName.trim() || undefined,
    });

    clear();
    window.location.href = url;
  }

  return (
    <div className="mt-6 space-y-6">
      <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
        {items.map((item) => (
          <li key={`${item.productId}:${item.variantId ?? ""}`} className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl text-stone-300">💍</div>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.variantName && (
                    <p className="text-xs text-stone-500">{item.variantName}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="self-start text-stone-400 hover:text-red-600"
                  aria-label="Quitar"
                >
                  ✕
                </button>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center rounded-lg border border-stone-300">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.variantId, item.quantity - 1)}
                    className="px-2.5 py-1 hover:text-accent"
                    aria-label="Restar"
                  >
                    −
                  </button>
                  <span className="w-7 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.productId, item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="px-2.5 py-1 hover:text-accent disabled:opacity-30"
                    aria-label="Sumar"
                  >
                    +
                  </button>
                </div>
                <p className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Cupón de descuento"
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm uppercase outline-none focus:border-accent"
          />
          <button
            type="button"
            onClick={applyCoupon}
            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
          >
            Aplicar
          </button>
        </div>
        {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
        {coupon && (
          <p className="mt-2 text-sm text-green-700">
            Cupón <strong>{coupon.code}</strong> aplicado:{" "}
            {coupon.discount_type === "percent" ? `${coupon.value}% off` : formatPrice(coupon.value)}
          </p>
        )}

        <div className="mt-4 space-y-1.5 border-t border-stone-200 pt-4 text-sm">
          <div className="flex justify-between text-stone-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Descuento</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Tu nombre (opcional)"
          className="mt-4 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-accent"
        />

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          onClick={checkout}
          disabled={submitting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.1c-.2.6-1.2 1.2-1.7 1.2-.4.1-1 .1-1.6-.1a13 13 0 0 1-5.8-5.1c-.5-.8-.9-1.8-.9-2.7 0-.8.4-1.5.8-1.9.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.6c-.1.2-.3.4-.1.7.5.9 1.2 1.6 2 2.2.4.3.8.5 1.2.7.3.1.5.1.7-.1l.6-.8c.2-.3.4-.2.7-.1l1.8.9c.3.1.5.2.5.4 0 .2.1.7-.4 1.3Z" />
          </svg>
          {submitting ? "Procesando…" : "Finalizar pedido por WhatsApp"}
        </button>
        <p className="mt-2 text-center text-xs text-stone-400">
          Al confirmar se reserva el stock y se abre WhatsApp con el detalle del pedido.
        </p>
      </div>
    </div>
  );
}
