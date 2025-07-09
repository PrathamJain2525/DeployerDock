"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  // Settings,
  User,
  Calendar,
  Activity,
  ExternalLink,
  Eye,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Sun,
  Moon,
  RotateCcwIcon,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { UserButton, useUser, ClerkLoaded } from "@clerk/nextjs";
import { projectType } from "@/types/project";
import { useTheme } from "@/context/ThemeContext";
import { generateSlug } from "random-word-slugs";
import { toast } from "sonner";
import { redirect } from "next/navigation";

export default function Dashboard() {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    gitUrl: "",
    projectName: generateSlug(),
    baseDir: "",
    installCommand: "npm install",
    buildCommand: "npm run build",
    buildFolder: "dist",
  });
  const [projects, setProjects] = useState<projectType[]>([]);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const setData = async () => {
      const fetchedProjects = (await user?.publicMetadata
        ?.projects) as projectType[];
      setProjects(fetchedProjects || []);
      console.log("Projects loaded:", projects);
    };
    setData();
  }, [user]);

  const handleDeploy = async () => {
    setLoading(true);
    console.log("Deploying with data:", formData);
    if (!formData.gitUrl) {
      toast.error("Git repository URL is required.");
      return;
    }
    const res1 = await fetch("/api/addproject", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        GIT_REPOSITORY_URL: formData.gitUrl,
        PROJECT_ID: formData.projectName,
        BASE_DIR: formData.baseDir,
        INSTALL_COMMAND: formData.installCommand,
        BUILD_COMMAND: formData.buildCommand,
        BUILD_FOLDER_NAME: formData.buildFolder,
        CREATED_AT: new Date().toISOString(),
        LAST_DEPLOY: new Date().toISOString(),
        STATUS: "Building",
      }),
    });
    if (!res1.ok) {
      toast.error("Failed to add project.");
      return;
    }

    const res = await fetch("/api/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        GIT_REPOSITORY_URL: formData.gitUrl,
        PROJECT_ID: formData.projectName,
        BASE_DIR: formData.baseDir,
        INSTALL_COMMAND: formData.installCommand,
        BUILD_COMMAND: formData.buildCommand,
        BUILD_FOLDER_NAME: formData.buildFolder,
      }),
    });
    if (!res.ok) {
      toast.error("Deployment failed.");
      return;
    }
    setLoading(false);
    redirect(`/projects/${formData.projectName}`);
  };

  const getStatusIcon = (status: string) => {
    console.log("Status:", status);
    switch (status) {
      case "Live":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "Building":
        return <Clock className="w-7 h-7 text-yellow-500 m-3" />;
      case "Failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "building":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100";
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
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DeployerDock
                </span>
              </div>
              <div className="flex items-center space-x-4">
                {/* <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button> */}
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

                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <UserButton />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Name
                    </p>
                    <p className="font-medium">{user?.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </p>
                    <p className="font-medium">{`${user?.emailAddresses[0]}`}</p>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Deployments
                      </span>
                      <span className="font-medium">
                        {Object.entries(projects)?.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Active Projects
                      </span>
                      <span className="font-medium">
                        {
                          Object.entries(projects)?.filter(
                            ([_, project]) => project.STATUS !== "Failed"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Quick Deploy */}
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>New Deployment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gitUrl">Git Repository URL</Label>
                      <Input
                        id="gitUrl"
                        type="url"
                        placeholder="https://github.com/username/repo"
                        value={formData.gitUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, gitUrl: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="projectName"
                          placeholder="my-awesome-project"
                          value={formData.projectName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              projectName: e.target.value,
                            })
                          }
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="p-2"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              projectName: generateSlug(),
                            })
                          }
                          title="Generate random project name"
                        >
                          <RotateCcwIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="baseDir">Base Directory (Optional)</Label>
                      <Input
                        id="baseDir"
                        placeholder="./"
                        value={formData.baseDir}
                        onChange={(e) =>
                          setFormData({ ...formData, baseDir: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="installCommand">Install Command</Label>
                      <Input
                        id="installCommand"
                        value={formData.installCommand}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            installCommand: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buildCommand">Build Command</Label>
                      <Input
                        id="buildCommand"
                        value={formData.buildCommand}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buildCommand: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buildFolder">Build Folder</Label>
                      <Input
                        id="buildFolder"
                        value={formData.buildFolder}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            buildFolder: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      disabled={loading}
                      onClick={handleDeploy}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Deploy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Projects List */}
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-5 h-5" />
                      <span>Your Projects</span>
                    </div>
                    <Link href="/projects">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(projects).map(([key, project]) => (
                      <div
                        key={project.PROJECT_ID}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(project.STATUS)}
                            <div>
                              <h3 className="font-medium">
                                {project.PROJECT_ID}
                              </h3>
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3 h-3" />
                                  Created{" "}
                                  {new Date(
                                    project.CREATED_AT
                                  ).toLocaleString()}
                                </div>
                                <div>
                                  Last deploy{" "}
                                  {new Date(
                                    project.LAST_DEPLOY
                                  ).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(project.STATUS)}>
                            {project.STATUS}
                          </Badge>
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={`http://${project.PROJECT_ID}.${process.env.NEXT_PUBLIC_APP_URL_DOMAIN}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Preview
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/projects/${project.PROJECT_ID}`}>
                              <Eye className="w-3 h-3 mr-1" />
                              Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
