import type { Metadata } from "next";
import { AboutSection } from "@/components/sections/AboutSection";
import { Faq } from "@/components/sections/Faq";
import { MissionBanner } from "@/components/sections/MissionBanner";
import { Hero } from "@/components/ui/Hero";

export const metadata: Metadata = {
  title: "About Us",
  description: "Who we are and what Faith Explorers is for.",
};

export default function AboutPage() {
  return (
    <>
      <Hero image="/images/hoe-may-2.jpg" />

      <AboutSection image="/images/hoe-may-7.jpg" title="What we do">
        <p>
          Welcome to Faith Explorers! Faith Explorers is a vibrant online community dedicated to
          supporting and inspiring individuals on their faith journey. Our mission is to provide a
          trusted space where believers can deepen their understanding of the Christian faith,
          cultivate meaningful relationships, and find practical guidance for navigating the
          complexities of life.
        </p>
        <p>
          Our team of passionate writers, contributors, and faith leaders are committed to creating
          content that is both relevant and transformative. We understand that faith is not a
          one-size-fits-all experience, and that&apos;s why we strive to address a wide range of
          topics that resonate with the diverse needs and interests of our readers.
        </p>
      </AboutSection>

      <MissionBanner title="Our Mission">
        <p>
          At Faith Explorers, we believe that faith is not just a set of beliefs, but a way of life
          that touches every aspect of our existence. Whether you&apos;re seeking guidance on
          strengthening your relationships, finding purpose in your career, navigating seasons of
          uncertainty, or deepening your spiritual practices, we are here to walk alongside you.
        </p>
        <p>
          Through our thought-provoking articles, practical resources, and engaging community, we
          aim to provide you with the tools and support you need to flourish in your faith journey.
          We strive to offer insights grounded in the timeless wisdom of the Bible, while also
          drawing from contemporary insights and experiences.
        </p>
      </MissionBanner>

      <AboutSection image="/images/hoe-may-14.jpg" title="Connect with Us">
        <p>
          To stay connected with Faith Explorers, we invite you to join our newsletter community. By
          subscribing, you&apos;ll receive regular updates, exclusive content, and opportunities to
          participate in special events and discussions. Our aim is to create a space where you feel
          seen, heard, and supported as you explore the depths of your faith. We are honored to be a
          part of your faith journey, and we hope that our website serves as a valuable resource and
          source of inspiration. If you have any questions, feedback, or ideas for collaboration,
          please don&apos;t hesitate to reach out. We are here to serve you and walk alongside you
          on this adventure of faith.
        </p>
      </AboutSection>

      <Faq />
    </>
  );
}
