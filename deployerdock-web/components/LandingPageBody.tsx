import React from "react";
import { Card, CardContent } from "./ui/card";
import { GitBranch, Globe, Shield, Zap } from "lucide-react";

const LandingPageBody = () => {
  const steps = [
    {
      number: "01",
      title: "Connect your Git Repository",
      description:
        "Link your GitHub, GitLab, or Bitbucket repository in seconds",
    },
    {
      number: "02",
      title: "Set Build Commands",
      description: "Configure your build settings or use our smart defaults",
    },
    {
      number: "03",
      title: "Deploy",
      description: "Watch your app go live with real-time deployment logs",
    },
  ];
  const features = [
    {
      icon: GitBranch,
      title: "Deploy from Git",
      description:
        "Connect your repository and deploy from GitHub, GitLab, or Bitbucket",
    },
    {
      icon: Zap,
      title: "Custom Build Commands",
      description: "Full control over your build process with custom commands",
    },
    {
      icon: Globe,
      title: "Project Previews",
      description: "Preview every deployment before it goes live",
    },
    {
      icon: Shield,
      title: "Dashboard Control",
      description: "Manage all your deployments from one powerful dashboard",
    },
  ];
  return (
    <>
      {/* Trusted By Section */}
      {/* <section className="pt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-8">
        Trusted by Students at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
        <div className="text-2xl font-bold text-gray-400">
          Delhi Technological University
        </div>
          </div>
        </div>
      </section> */}

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Deploy in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <Card
                key={index}
                className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105"
              >
                <CardContent className="p-8 text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to deploy with confidence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 group"
              >
                <CardContent className="p-6">
                  <feature.icon className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default LandingPageBody;
