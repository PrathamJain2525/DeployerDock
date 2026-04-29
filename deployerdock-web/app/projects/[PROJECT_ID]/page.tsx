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
  const PROJECT_ID = params.PROJECT_ID as string;

  const { user, isLoaded } = useUser();

  const [isRedeploying, setIsRedeploying] = useState(false);
  const [project, setProject] = useState<projectType | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const socketRef = useRef<Socket | null>(null);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Live":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
            <CheckCircle className="w-3 h-3 mr-2" /> Live
          </Badge>
        );

      case "Building":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
            <Clock className="w-3 h-3 mr-2" /> Building
          </Badge>
        );

      case "Failed":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
            <XCircle className="w-3 h-3 mr-2" /> Failed
          </Badge>
        );

      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
            <Clock className="w-3 h-3 mr-2" /> Unknown
          </Badge>
        );
    }
  };

  useEffect(() => {
    if (!PROJECT_ID) return;

    const storedLogs = localStorage.getItem(`build_logs:${PROJECT_ID}`);

    if (storedLogs) {
      try {
        setLogs(JSON.parse(storedLogs));
      } catch (error) {
        console.error("Failed to parse stored logs:", error);
      }
    }
  }, [PROJECT_ID]);

  useEffect(() => {
    if (!user || !PROJECT_ID) return;

    const fetchedProjects =
      (user.publicMetadata?.projects as Record<string, projectType>) || {};

    const foundProject =
      fetchedProjects[PROJECT_ID] ||
      Object.values(fetchedProjects).find(
        (p) => p.PROJECT_ID === PROJECT_ID
      ) ||
      null;

    setProject(foundProject);
  }, [user, PROJECT_ID]);

  useEffect(() => {
    if (!PROJECT_ID || !process.env.NEXT_PUBLIC_SOCKET_URL) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("Subscribe", `build_logs:${PROJECT_ID}`);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [PROJECT_ID]);

  const updateProjectStatus = async (status: "Building" | "Live" | "Failed") => {
    if (!project) return;

    const response = await fetch("/api/updateproject", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project: {
          PROJECT_ID: project.PROJECT_ID,
          LAST_DEPLOY: new Date().toISOString(),
          STATUS: status,
        },
      }),
    });

    if (!response.ok) {
      toast.error("Failed to update project status.");
      return;
    }

    setProject((prev) =>
      prev
        ? {
            ...prev,
            STATUS: status,
            LAST_DEPLOY: new Date().toISOString(),
          }
        : prev
    );
  };

  const handleSocketIncomingMessage = useCallback(
    async (message: string) => {
      const log = String(message);

      setLogs((prev) => {
        const updatedLogs = [...prev, log];
        localStorage.setItem(
          `build_logs:${PROJECT_ID}`,
          JSON.stringify(updatedLogs)
        );
        return updatedLogs;
      });

      setTimeout(() => {
        logContainerRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      if (
        log.includes("Completed the build for project") ||
        log.includes("Build completed for project") ||
        log === "DONE"
      ) {
        toast.success("Deployment completed successfully.");
        await updateProjectStatus("Live");
      }

      if (
        log.toLowerCase().includes("error") ||
        log.toLowerCase().includes("failed")
      ) {
        await updateProjectStatus("Failed");
      }
    },
    [PROJECT_ID, project]
  );

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.on("message", handleSocketIncomingMessage);

    return () => {
      socket.off("message", handleSocketIncomingMessage);
    };
  }, [handleSocketIncomingMessage]);

  const handleDeploy = async () => {
    if (!project) {
      toast.error("Project not found.");
      return;
    }

    await updateProjectStatus("Building");

    const response = await fetch("/api/deploy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        GIT_REPOSITORY_URL: project.GIT_REPOSITORY_URL,
        PROJECT_ID: project.PROJECT_ID,
        BASE_DIR: project.BASE_DIR || "",
        INSTALL_COMMAND: project.INSTALL_COMMAND || "npm install",
        BUILD_COMMAND: project.BUILD_COMMAND || "npm run build",
        BUILD_FOLDER_NAME: project.BUILD_FOLDER_NAME || "dist",
      }),
    });

    if (!response.ok) {
      await updateProjectStatus("Failed");
      toast.error("Deployment failed.");
      return;
    }

    toast.success("Deployment started.");
  };

  const handleRedeploy = async () => {
    setIsRedeploying(true);
    setLogs([]);
    localStorage.removeItem(`build_logs:${PROJECT_ID}`);

    try {
      await handleDeploy();
    } catch (error) {
      console.error("Redeployment error:", error);
      toast.error("Redeployment failed.");
      await updateProjectStatus("Failed");
    } finally {
      setIsRedeploying(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  };

  const handleDownload = () => {
    const blob = new Blob([logs.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${project?.PROJECT_ID || "project"}_build_logs.txt`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  const handleVisitSiteClick = () => {
    if (!project?.PROJECT_ID) return;

    const domain = process.env.NEXT_PUBLIC_APP_URL_DOMAIN;

    if (!domain) {
      toast.error("Preview domain is missing.");
      return;
    }

   window.open(`${domain}/${project.PROJECT_ID}/`, "_blank");
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Project not found</h1>
        <Link href="/projects">
          <Button className="mt-4">Back to Projects</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.PROJECT_ID}
                </h1>
                {getStatusIcon(project.STATUS)}
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {project.GIT_REPOSITORY_URL}
              </p>

              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Created{" "}
                    {project.CREATED_AT
                      ? new Date(project.CREATED_AT).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <Activity className="w-4 h-4" />
                  <span>
                    Last deployed{" "}
                    {project.LAST_DEPLOY
                      ? new Date(project.LAST_DEPLOY).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleVisitSiteClick}>
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Site
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

        <Tabs defaultValue="logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <GitBranch className="w-5 h-5" />
                    <span>Git Information</span>
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Repository
                  </p>

                  <div className="flex items-center justify-between">
                    <a
                      href={project.GIT_REPOSITORY_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-mono text-sm"
                    >
                      {project.GIT_REPOSITORY_URL}
                    </a>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(project.GIT_REPOSITORY_URL)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="w-5 h-5" />
                    <span>Configuration</span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Project ID
                    </p>
                    <p className="font-mono text-sm">{project.PROJECT_ID}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Base Directory
                    </p>
                    <p className="font-mono text-sm">
                      {project.BASE_DIR || "Root"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Install Command
                    </p>
                    <p className="font-mono text-sm">
                      {project.INSTALL_COMMAND}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Build Command
                    </p>
                    <p className="font-mono text-sm">{project.BUILD_COMMAND}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Build Folder
                    </p>
                    <p className="font-mono text-sm">
                      {project.BUILD_FOLDER_NAME}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5" />
                  <span>Deployment Logs</span>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm text-green-400 min-h-96 max-h-96 overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-gray-400">
                      Waiting for deployment logs...
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        &gt; {log}
                      </div>
                    ))
                  )}

                  <div ref={logContainerRef} />
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
            <Card>
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