"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Users,
  Target,
  Heart,
  Mail,
  Twitter,
  Linkedin,
  Github,
  Rocket,
} from "lucide-react";
import { SiNextdotjs, SiTypescript, SiDocker, SiKubernetes, SiRedis } from '@icons-pack/react-simple-icons';
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
const techStack = [
  { name: "Next.js", icon: <SiNextdotjs size={32} /> },
  { name: "TypeScript", icon: <SiTypescript size={32} /> },
  { name: "Docker", icon: <SiDocker size={32} /> },
  { name: "Kubernetes", icon: <SiKubernetes size={32} /> },
  { name: "AWS", icon: <img
  src="https://cdn.jsdelivr.net/npm/simple-icons@v11/icons/amazonaws.svg"
  alt="AWS"
  width={32}
  height={32}
/>, },
  { name: "Redis", icon: <SiRedis size={24} /> },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <Link
                href="/"
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              >
                DeployerDock
              </Link>
            </div>
            <nav className="flex items-center space-x-6">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/about"
                className="text-blue-600 dark:text-blue-400 font-medium"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Statement */}
        <section className="text-center mb-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Mission
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              We believe that deploying applications should be as simple as
              pushing code. DeployerDock was born from the frustration of
              complex deployment pipelines and the desire to give developers
              their time back to focus on what they love most - building.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 text-center">
                <CardContent className="p-6">
                  <Target className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Simplicity First
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Complex problems deserve simple solutions. We eliminate the
                    complexity of deployment.
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 text-center">
                <CardContent className="p-6">
                  <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Lightning Fast
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    From git push to live in seconds. Speed is not just a
                    feature, it's our foundation.
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 text-center">
                <CardContent className="p-6">
                  <Heart className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Developer Love
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Built by developers, for developers. We understand your
                    workflow and pain points.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              About Me
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hi, I'm Pushpit Jain — a passionate Full Stack Engineer and the
              solo creator of DeployerDock. This project is my personal journey
              to simplify deployments for developers everywhere.
            </p>
          </div>
          <div className="flex justify-center">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 w-full max-w-md">
              <CardContent className="p-8 text-center">
                <Image
                  src="/ProfilePic.jpeg?height=120&width=120"
                  alt="Pushpit Jain"
                  width={120}
                  height={120}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Pushpit Jain
                </h3>
                <Badge variant="secondary" className="mb-3">
                  Full Stack Engineer
                </Badge>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Software engineering student at Delhi Technological University
                  with expertise in Next.js, Node.js, cloud infrastructure and
                  more.
                </p>
                <div className="flex justify-center space-x-3">
                  <a
                    href="https://x.com/Pushpit_jain_18/"
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/pushpitjain/"
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href="https://github.com/pushpitjain2006/"
                    className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tech Stack
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {techStack.map((tech, index) => (
              <Card
                key={index}
                className="flex flex-col justify-center items-center aspect-square w-full h-full min-h-[120px] min-w-[120px] bg-white/60 dark:bg-gray-800/60 border border-white/20 dark:border-gray-700/20 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="flex flex-col justify-center items-center p-4 h-full w-full">
                  <div className="flex items-center justify-center mb-2" style={{ height: 40 }}>
                    {tech.icon}
                  </div>
                  <div className="text-base font-medium text-gray-900 dark:text-white text-center">
                    {tech.name}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="text-center">
          <Card className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-200 dark:border-blue-800">
            <CardContent className="p-12">
              <Users className="w-16 h-16 text-blue-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Connect & Collaborate
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Wanna collaborate for hackathons, or partner for tech events? <br />
          I'm always open to connecting with fellow developers who share a passion for innovation and developer experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            asChild
          >
            <a href="mailto:pushpitjain@2006.com">
              <Mail className="w-4 h-4 mr-2" />
              Email Me
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://x.com/Pushpit_jain_18/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Connect on Twitter
            </a>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href="https://www.linkedin.com/in/pushpitjain/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Linkedin className="w-4 h-4 mr-2" />
              Connect on LinkedIn
            </a>
          </Button>
              </div>
              <div className="mt-6 text-gray-500 dark:text-gray-400 text-sm">
          Let’s build, learn, and innovate together!
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
