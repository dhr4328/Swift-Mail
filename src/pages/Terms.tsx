import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-8">
                    <Link to="/">
                        <Button variant="ghost" size="sm" className="gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>

                <h1 className="text-3xl font-bold text-foreground mb-8">Terms of Service</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/80">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Introduction</h2>
                        <p>
                            Welcome to Swift Mail ("we," "our," or "us"). By accessing or using our website and services,
                            you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. Description of Service</h2>
                        <p>
                            Swift Mail is a tool designed to help users organize, filter, and clean their Gmail inboxes.
                            We utilize the Gmail API to access, categorize, and manage your emails based on your instructions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. User Obligations</h2>
                        <p>
                            You agree to use Swift Mail only for lawful purposes and in accordance with these Terms.
                            You are responsible for maintaining the confidentiality of your account information.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Intellectual Property</h2>
                        <p>
                            The service and its original content, features, and functionality are and will remain the exclusive property of Swift Mail and its licensors.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Termination</h2>
                        <p>
                            We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever,
                            including without limitation if you breach the Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Limitation of Liability</h2>
                        <p>
                            In no event shall Swift Mail, nor its directors, employees, partners, agents, suppliers, or affiliates,
                            be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation,
                            loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Terms;
