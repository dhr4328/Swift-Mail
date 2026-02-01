import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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

                <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>

                <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-foreground/80">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h2>
                        <p>
                            When you use Swift Mail, we access data from your Gmail account via the Google Gmail API.
                            This includes email metadata (senders, subjects, dates) and message content for the purpose of categorization and organization.
                            We do <strong>not</strong> store your email content on our servers. All processing happens in real-time or matches your requests.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
                        <p>
                            We use the access to your Gmail account solely to provide the features of the Swift Mail application, specifically:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Sorting and filtering your emails.</li>
                            <li>Generating statistics about your inbox usage.</li>
                            <li>Performing actions (trash, archive, mark read) initiated by you.</li>
                        </ul>
                        <p className="mt-2">
                            We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">3. Google User Data Policy</h2>
                        <p>
                            Swift Mail's use and transfer to any other app of information received from Google APIs will adhere to the
                            <a href="https://developers.google.com/terms/api-services-user-data-policy" className="text-primary hover:underline ml-1" target="_blank" rel="noopener noreferrer">
                                Google API Services User Data Policy
                            </a>, including the Limited Use requirements.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">4. Data Security</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information.
                            Your Google access tokens are handled securely and are only used to authenticate requests to the Gmail API on your behalf.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h2>
                        <p>
                            We do not retain your email data. Cache data used for performance is temporary and can be cleared at any time.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">6. Changes to This Policy</h2>
                        <p>
                            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-3">7. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
