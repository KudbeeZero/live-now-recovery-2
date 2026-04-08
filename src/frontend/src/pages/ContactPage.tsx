import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Mail } from "lucide-react";
import { useState } from "react";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Client-side only — no backend contact form
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen" data-ocid="contact.page">
      {/* Dark hero header */}
      <section className="bg-navy px-4 py-16">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Mail className="w-5 h-5 text-live-green" />
            <p className="text-xs font-bold uppercase tracking-widest text-live-green">
              Get in Touch
            </p>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Contact <span className="text-live-green">Us</span>
          </h1>
          <p className="text-on-dark">
            No PHI. Email, subject, and message only.
          </p>
        </div>
      </section>

      <div className="max-w-lg mx-auto px-4 py-12">
        {submitted ? (
          <div
            className="flex flex-col items-center gap-4 py-12 text-center"
            data-ocid="contact.success_state"
          >
            <CheckCircle className="w-12 h-12 text-live-green" />
            <h2 className="text-xl font-bold text-navy">Message Received</h2>
            <p className="text-muted-foreground text-sm">
              We'll be in touch. No data was stored.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSubmitted(false);
                setForm({ email: "", subject: "", message: "" });
              }}
              className="min-h-[44px]"
              data-ocid="contact.secondary_button"
            >
              Send Another
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-card border border-border p-6 space-y-5"
          >
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((f) => ({ ...f, email: e.target.value }))
                }
                placeholder="you@example.com"
                className="mt-1 min-h-[44px]"
                required
                data-ocid="contact.input"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={form.subject}
                onChange={(e) =>
                  setForm((f) => ({ ...f, subject: e.target.value }))
                }
                placeholder="Provider availability question"
                className="mt-1 min-h-[44px]"
                required
                data-ocid="contact.input"
              />
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="How can we help?"
                className="mt-1 min-h-[120px]"
                required
                data-ocid="contact.textarea"
              />
            </div>
            <Button
              type="submit"
              className="w-full min-h-[44px] bg-live-green hover:bg-live-green/90 text-navy font-semibold"
              data-ocid="contact.submit_button"
            >
              Send Message
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
