import { ButtonLink } from "@/components/ui/ButtonLink";
import { Hero } from "@/components/ui/Hero";

export default function NotFound() {
  return (
    <>
      <Hero
        image="/images/hoe-may.jpg"
        title="Page not found"
        subtitle="We couldn't find that page."
      />
      <ButtonLink href="/articles">Browse articles</ButtonLink>
    </>
  );
}
