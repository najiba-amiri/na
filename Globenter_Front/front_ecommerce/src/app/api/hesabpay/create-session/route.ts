import { NextResponse } from "next/server";

type Item = { id: string; name: string; price: number; quantity?: number };

export async function POST(req: Request) {
  try {
    const { email, items } = await req.json();

    // 1) Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items is required" }, { status: 400 });
    }

    // 2) Read env (supports both sandbox/prod naming styles)
    const envMode = (process.env.HESABPAY_ENV || "sandbox").toLowerCase();
    const baseUrl =
      envMode === "production"
        ? process.env.HESABPAY_BASE_URL_PROD || process.env.HESABPAY_BASE_URL
        : process.env.HESABPAY_BASE_URL || process.env.HESABPAY_BASE_URL_PROD;
    const apiKey =
      envMode === "production"
        ? process.env.HESABPAY_API_KEY_PROD ||
          process.env.HESABPAY_API_KEY ||
          process.env.HESABPAY_API_KEY_SANDBOX
        : process.env.HESABPAY_API_KEY_SANDBOX ||
          process.env.HESABPAY_API_KEY ||
          process.env.HESABPAY_API_KEY_PROD;
    const siteUrl =
      process.env.FRONTEND_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        {
          error:
            "Missing HesabPay env config. Set HESABPAY_ENV + HESABPAY_BASE_URL/HESABPAY_API_KEY_SANDBOX (or *_PROD).",
        },
        { status: 500 }
      );
    }

    // 3) Sanitize items
    const cleanItems: Item[] = items.map((i: any) => ({
      id: String(i.id),
      name: String(i.name),
      price: Number(i.price),
      quantity: i.quantity ? Number(i.quantity) : 1,
    }));

    if (
      cleanItems.some(
        (i) => !i.id || !i.name || !Number.isFinite(i.price) || i.price <= 0 || !Number.isFinite(i.quantity ?? 1) || (i.quantity ?? 1) <= 0
      )
    ) {
      return NextResponse.json({ error: "Invalid items payload" }, { status: 400 });
    }

    // 4) Build payload
    const payload = {
      email: email || undefined, // optional
      items: cleanItems.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity ?? 1,
      })),
      redirect_success_url: `${siteUrl}/payment/success`,
      redirect_failure_url: `${siteUrl}/payment/failure`,
    };

    // 5) Call HesabPay
    const resp = await fetch(`${baseUrl}/api/v1/payment/create-session`, {
      method: "POST",
      headers: {
        Authorization: `API-KEY ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    // HesabPay returns JSON (we saw it contains "url")
    const data = await resp.json().catch(() => ({}));

    // 6) Handle errors from HesabPay
    if (!resp.ok) {
      return NextResponse.json(
        { error: data?.message || "Create session failed", raw: data },
        { status: 400 }
      );
    }

    // 7) Accept either "payment_url" or "url"
    const paymentUrl = data?.payment_url || data?.url;

    if (!paymentUrl) {
      return NextResponse.json(
        { error: "Session created but no checkout URL returned", raw: data },
        { status: 400 }
      );
    }

    return NextResponse.json({
      payment_url: paymentUrl,
      raw: data, // keep for debugging; later you can remove raw in prod
    });
  } catch (err) {
    console.error("HesabPay create-session error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
