"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ExternalLink,
  GitBranch,
  Settings,
  Activity,
  Terminal,
  RefreshCw,
  Calendar,
  Zap,
  CheckCircle,
  Copy,
  Download,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { projectType } from "@/types/project";
import { useUser } from "@clerk/nextjs";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

export default function ProjectDetailsPage() {
  const params = useParams();
  const PROJECT_ID: string = params.PROJECT_ID as string;
  const [isRedeploying, setIsRedeploying] = useState(false);
  const [project, setProject] = useState<projectType | null>(null);
  const { user, isLoaded } = useUser();
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const getStatusIcon = (status: string) => {
    console.log("Status:", status);
    switch (status) {
      case "Live":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            {" "}
            <CheckCircle className="w-3 h-3 mr-2" /> Live
          </Badge>
        );
      case "Building":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            {" "}
            <Clock className="w-3 h-3 mr-2" /> Building
          </Badge>
        );
      case "Failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            {" "}
            <XCircle className="w-3 h-3 mr-2" /> Failed
          </Badge>
        );
      default:
        return <Clock className="w-3 h-3 text-gray-500" />;
    }
  };

  useEffect(() => {
    if (PROJECT_ID) {
      const storedLogs = localStorage.getItem(`build_logs:${PROJECT_ID}`);
      if (storedLogs) {
        try {
          setLogs(JSON.parse(storedLogs));
        } catch (e) {
          console.error("Failed to parse stored logs", e);
        }
      }
    }
  }, [PROJECT_ID]);

  useEffect(() => {
    const fetchAndSetProject = async () => {
      const fetchedProjects =
        ((await user?.publicMetadata?.projects) as projectType[]) || [];
      const foundProject = Object.values(fetchedProjects).find(
        (p) => p.PROJECT_ID === PROJECT_ID
      );
      if (foundProject) {
        setProject(foundProject);
      } else {
        setProject(null);
      }
    };

    if (user) {
      fetchAndSetProject();
    }
  }, [isLoaded, user, PROJECT_ID]);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || "");
      socketRef.current.connect();
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, [PROJECT_ID]);

  useEffect(() => {
    console.log(`Subscribing to build_logs:${PROJECT_ID}`);
    socketRef.current?.emit("Subscribe", `build_logs:${PROJECT_ID}`);
  }, [PROJECT_ID]);

  const handleDeploy = async () => {
    if (!project) {
      toast.error("Project not found.");
      return;
    }
    const res1 = await fetch("/api/updateproject", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        PROJECT_ID: project.PROJECT_ID,
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
        GIT_REPOSITORY_URL: project.GIT_REPOSITORY_URL,
        PROJECT_ID: project.PROJECT_ID,
        BASE_DIR: project.BASE_DIR,
        INSTALL_COMMAND: project.INSTALL_COMMAND,
        BUILD_COMMAND: project.BUILD_COMMAND,
        BUILD_FOLDER_NAME: project.BUILD_FOLDER_NAME,
      }),
    });
    if (!res.ok) {
      toast.error("Deployment failed.");
      return;
    }
  };
  const handleRedeploy = async () => {
    setIsRedeploying(true);
    setLogs([]);
    localStorage.removeItem(`build_logs:${PROJECT_ID}`);

    try {
      await handleDeploy();
      toast.success("Redeployment started successfully.");
    } catch (error) {
      console.error("Redeployment error:", error);
      toast.error("Redeployment failed. Please try again.");
    } finally {
      setIsRedeploying(false);
    }
    logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const handleSocketIncomingMessage = useCallback(
    async (message: string) => {
      try {
        const log = message;

        if (log == "DONE") {
          toast.success("Deployment completed successfully.");
          await fetch("/api/updateproject", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              PROJECT_ID: project?.PROJECT_ID,
              LAST_DEPLOY: new Date().toISOString(),
              STATUS: "Live",
            }),
          });
          // visit site in new tab
          toast.success(
            `Project ${project?.PROJECT_ID} is live! Visiting site...`
          );
          if (
            !process.env.NEXT_PUBLIC_APP_URL_DOMAIN ||
            process.env.NEXT_PUBLIC_APP_URL_DOMAIN.startsWith("localhost")
          ) {
            toast.error(
              "Preview links are not available currently. Sorry for the inconvenience."
            );
            return;
          }
          window.open(
            `http://${project?.PROJECT_ID}.${process.env.NEXT_PUBLIC_APP_URL_DOMAIN}`,
            "_blank"
          );
          return;
        }

        setLogs((prev) => {
          const updatedLogs = [...prev, log];
          if (
            log != "Connected to the socket" &&
            log != `Joined build_logs: ${PROJECT_ID}`
          ) {
            localStorage.setItem(
              `build_logs:${PROJECT_ID}`,
              JSON.stringify(updatedLogs)
            );
          }
          return updatedLogs;
        });
        logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
      } catch (err) {
        console.error("Error parsing message:", err);
      }
    },
    [PROJECT_ID]
  );

  useEffect(() => {
    socketRef.current?.on("message", handleSocketIncomingMessage);

    return () => {
      socketRef.current?.off("message", handleSocketIncomingMessage);
    };
  }, [handleSocketIncomingMessage]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  const handleDownload = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project?.PROJECT_ID}_build_logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleVisitSiteClick = (e: React.MouseEvent) => {
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
    window.open(
      `http://${project?.PROJECT_ID}.${process.env.NEXT_PUBLIC_APP_URL_DOMAIN}`,
      "_blank"
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 mb-4 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-spin">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/projects">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Projects
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  DeployerDock
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project?.PROJECT_ID}
                </h1>

                {getStatusIcon(project?.STATUS || "Unknown")}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {project?.GIT_REPOSITORY_URL}
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created{" "}
                    {new Date(project?.CREATED_AT || "").toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>
                    Last deployed{" "}
                    {new Date(project?.LAST_DEPLOY || "").toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" asChild onClick={handleVisitSiteClick}>
                <div>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Site
                </div>
              </Button>
              <Button
                onClick={handleRedeploy}
                disabled={isRedeploying}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRedeploying ? "animate-spin" : ""
                  }`}
                />
                {isRedeploying ? "Redeploying..." : "Redeploy"}
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {/* <TabsTrigger value="deployments">Deployments</TabsTrigger> */}
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Git Information */}
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="w-5 h-5" />
                    <span>Git Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Repository
                    </p>
                    <div className="flex items-center justify-between">
                      <a
                        href={project?.GIT_REPOSITORY_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm"
                      >
                        {project?.GIT_REPOSITORY_URL}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          project?.GIT_REPOSITORY_URL &&
                          copyToClipboard(project.GIT_REPOSITORY_URL)
                        }
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Deployment Configuration */}
              <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Project ID
                    </p>
                    <p className="font-mono text-sm">{project?.PROJECT_ID}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Base Directory
                    </p>
                    <p className="font-mono text-sm">
                      {project?.BASE_DIR || "./"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Install Command
                    </p>
                    <p className="font-mono text-sm">
                      {project?.INSTALL_COMMAND}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Build Command
                    </p>
                    <p className="font-mono text-sm">
                      {project?.BUILD_COMMAND}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Build Folder
                    </p>
                    <p className="font-mono text-sm">
                      {project?.BUILD_FOLDER_NAME}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5" />
                  <span>Deployment Logs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 min-h-96 max-h-96 overflow-y-auto">
                  {logs.map((log, index) => (
                    <div key={index} className="mb-1">
                      &gt; {log}
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700/20">
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Configure your project deployment settings and environment
                  variables.
                </p>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
