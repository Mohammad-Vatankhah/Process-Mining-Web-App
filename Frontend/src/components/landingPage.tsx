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
          Optimize Your Business with Process Mining
        </h1>
        <p className="text-lg lg:text-xl text-center mt-4">
          Uncover inefficiencies, enhance workflows, and improve decision-making
          with our powerful process mining tools.
        </p>
        <Link href="/process" className="z-10">
          <Button
            variant="secondary"
            className="mt-8 px-8 py-6 text-lg font-semibold"
          >
            Get Started
          </Button>
        </Link>
      </section>

      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-foreground text-3xl lg:text-4xl font-bold text-center">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <FeatureCard
              title="Process Discovery"
              description="Automatically discover business processes from event logs and visualize workflows."
              icon="🔍"
            />
            <FeatureCard
              title="Conformance Checking"
              description="Ensure your processes align with expectations and uncover deviations."
              icon="✔️"
            />
            <FeatureCard
              title="Performance Analysis"
              description="Analyze process performance, find bottlenecks, and optimize your operations."
              icon="⏱️"
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
              title="Upload Event Logs"
              description="Easily upload event data and let our system analyze it."
            />
            <StepCard
              step="2"
              title="Process Discovery"
              description="Automatically uncover hidden workflows within your business."
            />
            <StepCard
              step="3"
              title="Analyze & Optimize"
              description="Use the insights to improve and streamline your business operations."
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-primary-foreground">
          <h2 className="text-3xl lg:text-4xl font-bold text-center">
            What Our Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
            <Testimonial
              name="John Doe"
              review="This tool has transformed the way we analyze and optimize our business processes!"
            />
            <Testimonial
              name="Jane Smith"
              review="The performance analysis feature is a game-changer for identifying bottlenecks."
            />
            <Testimonial
              name="Alex Johnson"
              review="Highly recommend this app for any business looking to improve efficiency."
            />
          </div>
        </div>
      </section>

      <footer className="bg-secondary py-8 text-secondary-foreground">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Process Mining App. All Rights Reserved.</p>
          <div className="mt-4">
            <a href="/terms" className="hover:underline mx-2">
              Terms of Service
            </a>
            <a href="/privacy" className="hover:underline mx-2">
              Privacy Policy
            </a>
            <a href="/contact" className="hover:underline mx-2">
              Contact Us
            </a>
          </div>
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
