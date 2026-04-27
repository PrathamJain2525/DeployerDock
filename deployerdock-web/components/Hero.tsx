"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, GitBranch, Globe, Zap } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "@/components/ui/badge";
import { redirect } from "next/navigation";

const Hero = () => {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              Deploy your apps
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">
              at lightning speed.
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            From Git to live in seconds. No config. No stress.
          </p>
          <Button
            size="lg"
            onClick={() => {
              redirect("/dashboard");
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105"
          >
            Get Started <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Hero Mockup */}
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Card className="max-w-4xl mx-auto backdrop-blur-xl bg-white/10 dark:bg-gray-800/10 border border-white/20 dark:border-gray-700/20 shadow-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  Deployed
                </Badge>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <GitBranch className="w-5 h-5 text-blue-500" />
                  <span className="text-sm font-mono">
                    git push origin main
                  </span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm font-mono">Building...</span>
                </div>
                <div className="flex items-center space-x-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Globe className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-mono">
                    Live at https://your-app.deployerdock.com
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Hero;
