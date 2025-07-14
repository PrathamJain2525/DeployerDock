import { Rocket } from "lucide-react";
import Link from "next/link";
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">DeployerDock</span>
            </div>
            <p className="text-gray-400">
              The fastest way to deploy your applications.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="#features"
                  className="hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="hover:text-white transition-colors"
                >
                  How it Works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link
                  href="/about"
                  className="hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link href="https://pushpitjain.medium.com/" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="mailto:pushpitjain2006@gmail.com" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="https://x.com/Pushpit_jain_18" className="hover:text-white transition-colors">
                  X (Twitter)
                </Link>
              </li>
              <li>
                <Link href="https://github.com/pushpitjain2006/" className="hover:text-white transition-colors">
                  GitHub
                </Link>
              </li>
              <li>
                <Link href="https://www.linkedin.com/in/pushpitjain2006/" className="hover:text-white transition-colors">
                  LinkedIn
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; 2024 DeployerDock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
