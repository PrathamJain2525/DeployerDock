"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  ExternalLink,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Sun,
  Moon,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { projectType } from "@/types/project";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

export default function ProjectsPage() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useUser();
  const projects: projectType[] =
    (user?.publicMetadata.projects as projectType[]) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Live":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Building":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "Failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Live":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "Building":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
    }
  };

  const filteredProjects = Object.values(projects).filter((project) => {
    const matchesSearch =
      project.PROJECT_ID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.GIT_REPOSITORY_URL.toLowerCase().includes(
        searchTerm.toLowerCase()
      );
    const matchesFilter =
      filterStatus === "all" || project.STATUS === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePreviewClick = (e: React.MouseEvent, PROJECT_ID: string) => {
    e.preventDefault();
    if (
      !process.env.NEXT_PUBLIC_APP_URL_DOMAIN ||
      process.env.NEXT_PUBLIC_APP_URL_DOMAIN.startsWith("localhost")
    ) {
      toast.error(
        "Preview links are not available currently. Sorry for the inconvenience."
      );
      return;
    }
    if (PROJECT_ID) {
      window.open(
        `https://${PROJECT_ID}.${process.env.NEXT_PUBLIC_APP_URL_DOMAIN}`,
        "_blank"
      );
    }
  };

  return (
    <div className={`${isDarkMode ? "dark" : ""}`}>
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
                  href="/dashboard"
                  className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                >
                  DeployerDock
                </Link>
              </div>
              <nav className="flex items-center space-x-6">
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-white" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/projects"
                  className="text-blue-600 dark:text-blue-400 font-medium"
                >
                  Projects
                </Link>
              </nav>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Projects
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage and monitor all your deployments
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "Live" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Live")}
              >
                Live
              </Button>
              <Button
                variant={filterStatus === "Building" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Building")}
              >
                Building
              </Button>
              <Button
                variant={filterStatus === "Failed" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("Failed")}
              >
                Failed
              </Button>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.PROJECT_ID}
                className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 group overflow-hidden"
              >
                <div className="relative">
                  <Image
                    src="/placeholder.svg" // TODO: Placeholder image, replace with project preview
                    alt={`${project.PROJECT_ID} screenshot`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(project.STATUS)}>
                      {getStatusIcon(project.STATUS)}
                      <span className="ml-1 capitalize">{project.STATUS}</span>
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-1">
                        {project.PROJECT_ID}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {project.PROJECT_ID}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.GIT_REPOSITORY_URL}
                  </p>

                  <div className="flex items-center text-xs justify-between text-gray-500 dark:text-gray-400 m-6">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 m-1" />
                      Created <br />
                      {new Date(project.CREATED_AT).toLocaleDateString()}
                    </div>
                    <div>
                      Deploy <br />
                      {new Date(project.LAST_DEPLOY).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      asChild
                      onClick={(e) => handlePreviewClick(e, project.PROJECT_ID)}
                    >
                      <div>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Preview
                      </div>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-transparent"
                      asChild
                    >
                      <Link href={`/projects/${project.PROJECT_ID}`}>
                        <Eye className="w-3 h-3 mr-1" />
                        Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No projects found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Get started by deploying your first project"}
              </p>
              <Button asChild>
                <Link href="/dashboard">Deploy New Project</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
