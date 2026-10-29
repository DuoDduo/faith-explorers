import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ApplicationForm } from "@/components/authoring/ApplicationForm";
import { AboutSection } from "@/components/sections/AboutSection";
import { Hero } from "@/components/ui/Hero";
import { ListSkeleton } from "@/components/ui/Skeletons";
import { getMyApplication } from "@/lib/api/authoring";
import { isWriter } from "@/lib/auth/guards";
import { loginHref } from "@/lib/auth/redirect";
import { getCurrentUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Write for us",
  description: "Share what God is teaching you. Apply to write for Faith Explorers.",
};

async function ApplicationPanel() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <p>
        <Link href={loginHref("/become-an-author")} className="btn">
          Sign in to apply
        </Link>
      </p>
    );
  }
  if (isWriter(user)) {
    return (
      <p>
        You&apos;re already an author.{" "}
        <Link href="/dashboard" className="btn">
          Go to your dashboard
        </Link>
      </p>
    );
  }

  const application = await getMyApplication();
  if (application?.status === "pending") {
    return (
      <p className="form-success" role="status">
        Thanks, {user.name.split(" ")[0]}! Your application from{" "}
        {formatDate(application.created_at)} is being reviewed.
      </p>
    );
  }
  return (
    <>
      {application?.status === "rejected" && (
        <p className="form-error">
          Your last application wasn&apos;t approved
          {application.review_note ? `: ${application.review_note}` : "."} You&apos;re welcome to
          apply again.
        </p>
      )}
      <ApplicationForm />
    </>
  );
}

export default function BecomeAnAuthorPage() {
  return (
    <>
      <Hero image="/images/hoe-may-14.jpg" title="Write for us" />
      <AboutSection image="/images/hoe-may-12.jpg" title="Share what you're learning">
        <p>
          Faith Explorers is written by people walking the same road as our readers: pastors,
          ministers, students and everyday believers. If you have something to share about faith,
          relationships, family or spiritual growth, we&apos;d love to hear from you.
        </p>
        <p>
          Tell us a little about yourself and what you&apos;d like to write. Once approved, you can
          draft articles in your dashboard and send them to us for review.
        </p>
      </AboutSection>
      <section className="about container">
        <div className="contact-container content application-card">
          <h2 className="h2">Apply to write</h2>
          <Suspense fallback={<ListSkeleton rows={2} />}>
            <ApplicationPanel />
          </Suspense>
        </div>
      </section>
    </>
  );
}
