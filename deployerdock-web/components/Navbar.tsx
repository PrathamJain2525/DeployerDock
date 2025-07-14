"use client";
import { ArrowRight, Menu, Moon, Rocket, Sun, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useState } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";

const Navbar = () => {
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isSignedIn } = useAuth();

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 shadow-sm ${
        isDarkMode ? " bg-gray-900/80" : "bg-white/70"
      }`}
      style={{
        WebkitBackdropFilter: "blur(12px)",
        backdropFilter: "blur(12px)",
      }}
    >
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

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  Dashboard
                  <span className="ml-1">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button
                    variant={isDarkMode ? "secondary" : "outline"}
                    size="sm"
                  >
                    Login
                  </Button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 dark:text-white" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 right-0 w-full h-screen bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <div className="flex flex-col items-center justify-center h-full space-y-8 text-lg">
            <Link
              href="#features"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="/about"
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              About
            </Link>
            <SignInButton mode="modal">
              <Button variant={isDarkMode ? "secondary" : "outline"} size="sm">
                Login
              </Button>
            </SignInButton>

            <SignUpButton mode="modal">
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
