"use client";

import { useEffect, useState, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

const BRAND_ICONS: Record<string, string> = {
  visa: "VISA",
  mastercard: "MC",
  amex: "AMEX",
  discover: "DISC",
};

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise =
  stripePublishableKey &&
  !stripePublishableKey.includes("REPLACE")
    ? loadStripe(stripePublishableKey)
    : null;

// ─── Add Card Form (inside Elements context) ─────────────────────────────────

function AddCardForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSaving(true);
    setError(null);

    try {
      // Get SetupIntent
      const res = await fetch("/api/client/setup-intent", { method: "POST" });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Erreur serveur");
        return;
      }

      const { clientSecret } = json.data;
      const card = elements.getElement(CardElement);
      if (!card) return;

      const { error: stripeError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: { card },
      });

      if (stripeError) {
        setError(stripeError.message ?? "Erreur Stripe");
        return;
      }

      onSuccess();
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="border border-[#D1E5E5] rounded-[10px] p-3 bg-white focus-within:ring-2 focus-within:ring-[#1CA7A6]">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#1F2937",
                fontFamily: "Inter, sans-serif",
                "::placeholder": { color: "#9CA3AF" },
              },
            },
            hidePostalCode: true,
          }}
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-[8px] px-3 py-2">
          {error}
        </p>
      )}
      <Button type="submit" loading={saving} size="sm">
        Enregistrer la carte
      </Button>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stripeReady] = useState(() => stripePromise !== null);

  const fetchMethods = useCallback(() => {
    setLoading(true);
    fetch("/api/client/payment-methods")
      .then((r) => r.json())
      .then((j) => setMethods(j.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchMethods(); }, [fetchMethods]);

  const handleDelete = async (pmId: string) => {
    setDeletingId(pmId);
    try {
      await fetch(`/api/client/payment-methods?pmId=${pmId}`, { method: "DELETE" });
      fetchMethods();
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddSuccess = () => {
    setShowForm(false);
    fetchMethods();
  };

  return (
    <div className="flex flex-col gap-5 max-w-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#1F2937]">Moyens de paiement</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez vos cartes bancaires enregistrées
          </p>
        </div>
        {stripeReady && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Annuler" : "+ Ajouter"}
          </Button>
        )}
      </div>

      {/* Stripe not configured */}
      {!stripeReady && (
        <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-4 flex items-start gap-3">
          <div className="text-amber-600 shrink-0 mt-0.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Paiement en ligne non encore activé
            </p>
            <p className="text-sm text-amber-600 mt-1">
              La gestion des cartes bancaires sera disponible une fois Stripe configuré.
              Vos demandes d'intervention fonctionnent déjà normalement.
            </p>
          </div>
        </div>
      )}

      {/* Add card form */}
      {stripeReady && showForm && stripePromise && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Nouvelle carte</CardTitle>
          </CardHeader>
          <Elements stripe={stripePromise}>
            <AddCardForm onSuccess={handleAddSuccess} />
          </Elements>
        </Card>
      )}

      {/* Cards list */}
      {stripeReady && (
        <Card padding="none" className="overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin w-5 h-5 border-2 border-[#1CA7A6] border-t-transparent rounded-full" />
            </div>
          ) : !methods.length ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-500">Aucune carte enregistrée</p>
              <p className="text-xs text-gray-400 mt-1">
                Ajoutez une carte pour accélérer vos paiements
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E6F2F2]">
              {methods.map((m) => (
                <div key={m.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-7 rounded bg-[#1F2937] flex items-center justify-center text-[10px] font-bold text-white tracking-wide shrink-0">
                      {BRAND_ICONS[m.brand] ?? "CARD"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1F2937] capitalize">
                        {m.brand} •••• {m.last4}
                      </p>
                      <p className="text-xs text-gray-400">
                        Expire {String(m.expMonth).padStart(2, "0")}/{m.expYear}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    className="text-xs px-2.5 py-1.5 rounded-[6px] border border-[#D1E5E5] text-gray-500 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40"
                  >
                    {deletingId === m.id ? "…" : "Supprimer"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Security note */}
      <div className="flex items-start gap-2 text-xs text-gray-400">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <p>
          Vos données bancaires sont chiffrées et stockées de façon sécurisée par Stripe.
          GoServi n'a jamais accès à vos numéros de carte complets.
        </p>
      </div>
    </div>
  );
}
