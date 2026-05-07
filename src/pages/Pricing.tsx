import { Check, Zap, Crown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For light users who need occasional cleanup.",
    icon: Mail,
    highlight: false,
    badge: null,
    cta: "Get Started Free",
    ctaVariant: "outline" as const,
    features: [
      "Email analytics & overview",
      "Inbox health score",
      "Quick Insights dashboard",
      "Delete up to 500 emails/month",
      "Basic category filters",
      "Bulk select & delete",
    ],
    missing: [
      "Delete All (unlimited)",
      "Scheduled auto-clean",
      "Multi-account support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$6",
    period: "per month",
    description: "For power users who want a permanently clean inbox.",
    icon: Zap,
    highlight: true,
    badge: "Most Popular",
    cta: "Start Pro — $6/mo",
    ctaVariant: "default" as const,
    features: [
      "Everything in Free",
      "Unlimited Delete All",
      "All category & time filters",
      "Unsubscribe assistant",
      "Scheduled auto-clean (coming soon)",
      "Priority support",
    ],
    missing: ["Multi-account support"],
  },
  {
    id: "lifetime",
    name: "Lifetime",
    price: "$49",
    period: "one-time",
    description: "Pay once, use forever. No subscriptions.",
    icon: Crown,
    highlight: false,
    badge: "Best Value",
    cta: "Get Lifetime Access",
    ctaVariant: "outline" as const,
    features: [
      "Everything in Pro",
      "Lifetime updates",
      "Multi-account support",
      "Early access to new features",
      "Priority support",
    ],
    missing: [],
  },
];

const faqs = [
  {
    q: "Is my Gmail data safe?",
    a: "Yes. We only request read and modify permissions. We never store your email content — all operations happen via the Gmail API in real time.",
  },
  {
    q: "What counts toward the 500 email/month limit?",
    a: "Each email moved to trash counts as 1. Archiving and mark-as-read actions are unlimited on all plans.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. Cancel your Pro subscription anytime from your account settings with no questions asked.",
  },
  {
    q: "What is the Lifetime plan?",
    a: "A one-time payment that gives you permanent Pro access with no monthly fees. Perfect if you dislike subscriptions.",
  },
];

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Mail className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold text-foreground">Smart Gmail Cleaner</span>
          </button>
          <Button variant="outline" size="sm" onClick={() => navigate("/")}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-10 text-center px-4">
        <div className="inline-flex items-center gap-2 bg-card border border-border px-4 py-1.5 rounded-full mb-6 text-sm text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" />
          Simple, transparent pricing
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-2xl mx-auto leading-tight">
          Clean your inbox.<br />Own your time.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Start for free. Upgrade when you need unlimited power.
        </p>
      </section>

      {/* Plans */}
      <section className="pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-card border rounded-2xl p-8 flex flex-col gap-6 transition-shadow ${
                  plan.highlight
                    ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                    : "border-border hover:shadow-md"
                }`}
              >
                {plan.badge && (
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold rounded-full ${
                      plan.highlight
                        ? "bg-primary text-primary-foreground"
                        : "bg-amber-500 text-white"
                    }`}
                  >
                    {plan.badge}
                  </div>
                )}

                {/* Plan header */}
                <div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
                      plan.highlight ? "bg-primary text-primary-foreground" : "bg-muted/40"
                    }`}
                  >
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm mb-1">/{plan.period}</span>
                </div>

                {/* CTA */}
                <Button
                  variant={plan.ctaVariant}
                  className="w-full"
                  onClick={() => navigate("/")}
                >
                  {plan.cta}
                </Button>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-foreground">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-muted-foreground/50 line-through">
                      <span className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            {["No credit card for Free plan", "Cancel anytime", "Secure OAuth — we never store passwords", "GDPR-friendly"].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 border-t border-border px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.q} className="bg-card border border-border rounded-xl p-6">
                <p className="font-semibold text-foreground mb-2">{faq.q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Swift Mail. Your emails, your privacy.</p>
          <div className="flex gap-6">
            <a href="/terms" className="hover:underline hover:text-foreground transition-colors">Terms</a>
            <a href="/privacy" className="hover:underline hover:text-foreground transition-colors">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
