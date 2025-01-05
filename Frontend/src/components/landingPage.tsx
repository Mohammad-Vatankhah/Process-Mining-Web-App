"use client";
import Link from "next/link";
import ParticlesBackground from "./particles";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function LandingPage() {
  return (
    <div className="bg-primary text-primary-foreground min-h-screen select-none">
      <section className="flex flex-col items-center justify-center py-20 relative">
        <div className="absolute w-full h-full">
          <ParticlesBackground />
        </div>
        <h1 className="text-4xl lg:text-6xl font-bold text-center">
          Simplify Process Mining with Our Web-Based Tool
        </h1>
        <p className="text-lg lg:text-xl text-center mt-4">
          Analyze event logs, visualize workflows, and optimize your business
          processes with ease.
        </p>
        <Link href="/process" className="z-10">
          <Button
            variant="secondary"
            className="mt-8 px-8 py-6 text-lg font-semibold"
          >
            Explore Now
          </Button>
        </Link>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-foreground text-3xl lg:text-4xl font-bold text-center">
            Key Capabilities
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <FeatureCard
              title="Event Log Analysis"
              description="Upload event logs in XES or CSV format to analyze business processes."
              icon="📂"
            />
            <FeatureCard
              title="Process Model Discovery"
              description="Generate models using algorithms like Alpha Miner and Inductive Miner."
              icon="📊"
            />
            <FeatureCard
              title="Conformance Checking"
              description="Compare discovered models with predefined ones to identify deviations."
              icon="✔️"
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-foreground text-3xl lg:text-4xl font-bold text-center">
            How It Works
          </h2>
          <div className="text-muted-foreground grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <StepCard
              step="1"
              title="Upload Your Data"
              description="Use our intuitive interface to upload event logs."
            />
            <StepCard
              step="2"
              title="Discover Processes"
              description="Automatically uncover workflows using advanced algorithms."
            />
            <StepCard
              step="3"
              title="Analyze Results"
              description="Visualize and refine your processes to improve efficiency."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-primary-foreground">
          <h2 className="text-3xl lg:text-4xl font-bold text-center">
            User Testimonials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            <Testimonial
              name="Sara Ahmed"
              review="Using this tool, we discovered inefficiencies we never knew existed!"
            />
            <Testimonial
              name="David Lee"
              review="The conformance checking feature helped us align processes with regulations."
            />
            <Testimonial
              name="Emily Chen"
              review="A must-have for businesses aiming to optimize operations."
            />
          </div>
        </div>
      </section>

      <footer className="bg-secondary py-8 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2025 Process Mining App. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <Card className="text-center shadow-md">
      <CardHeader className="flex justify-center">
        <p className="text-5xl bg-transparent">{icon}</p>
      </CardHeader>
      <CardContent>
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-base font-semibold">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="text-center shadow-md">
      <CardHeader className="flex justify-center text-3xl font-bold">
        {`${step}) ${title}`}
      </CardHeader>
      <CardContent>
        <CardDescription className="font-semibold text-base">
          {description}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

function Testimonial({ name, review }: { name: string; review: string }) {
  return (
    <Card className="text-center shadow-md">
      <CardContent>
        <CardDescription className="mt-4 italic text-base font-normal">
          {review}
        </CardDescription>
        <CardTitle className="mt-4 font-semibold">{name}</CardTitle>
      </CardContent>
    </Card>
  );
}
