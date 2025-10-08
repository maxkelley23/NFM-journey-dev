"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RefreshCw, Download, Mail, MessageSquare } from "lucide-react";

type OutputProps = {
  text: string;
  isLoading?: boolean;
  onReset?: () => void;
};

export const ModernOutput = ({ text, isLoading, onReset }: OutputProps) => {
  const [copied, setCopied] = useState(false);
  const [selectedView, setSelectedView] = useState<"formatted" | "raw">("formatted");

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy campaign text", error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaign-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Parse the campaign text into structured sections
  const parseCampaign = (campaignText: string) => {
    const sections = campaignText.split(/(?=Email \d+:|SMS \d+:)/);
    return sections.filter(s => s.trim()).map(section => {
      const lines = section.trim().split('\n');
      const header = lines[0];
      const isEmail = header.startsWith('Email');
      const isSMS = header.startsWith('SMS');

      if (isEmail) {
        const subjectMatch = section.match(/Subject.*?: (.*)/);
        const bodyStart = section.indexOf('\n\n') + 2;
        const bodyEnd = section.lastIndexOf('\n\n');
        const body = section.substring(bodyStart, bodyEnd > bodyStart ? bodyEnd : section.length);

        return {
          type: 'email' as const,
          header,
          subject: subjectMatch ? subjectMatch[1] : '',
          body: body.trim()
        };
      } else if (isSMS) {
        const bodyStart = section.indexOf('\n') + 1;
        return {
          type: 'sms' as const,
          header,
          body: section.substring(bodyStart).trim()
        };
      }

      return {
        type: 'text' as const,
        header: '',
        body: section
      };
    });
  };

  if (isLoading) {
    return (
      <motion.section
        className="card p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
            <motion.div
              className="absolute inset-0 w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Generating Your Campaign
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Our AI is crafting personalized content for your journey...
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  if (!text) {
    return (
      <motion.section
        className="card p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800">
            <Mail className="w-8 h-8 text-gray-400 dark:text-gray-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Campaign Output
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Your email series will appear here once generated
            </p>
          </div>
        </div>
      </motion.section>
    );
  }

  const campaigns = parseCampaign(text);

  return (
    <motion.section
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with Actions */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Campaign Generated Successfully
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {campaigns.filter(c => c.type === 'email').length} emails and {campaigns.filter(c => c.type === 'sms').length} SMS messages ready
            </p>
          </div>
          <div className="flex gap-2">
            {onReset && (
              <motion.button
                type="button"
                className="btn-secondary px-4 py-2 flex items-center gap-2"
                onClick={onReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-4 h-4" />
                Start Over
              </motion.button>
            )}
            <motion.button
              type="button"
              className="btn-secondary px-4 py-2 flex items-center gap-2"
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            <motion.button
              type="button"
              className="btn-primary px-4 py-2 flex items-center gap-2"
              onClick={handleCopy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy All
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedView === "formatted"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setSelectedView("formatted")}
          >
            Formatted View
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedView === "raw"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={() => setSelectedView("raw")}
          >
            Raw Text
          </button>
        </div>
      </div>

      {/* Content Display */}
      <AnimatePresence mode="wait">
        {selectedView === "formatted" ? (
          <motion.div
            key="formatted"
            className="space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {campaigns.map((campaign, index) => (
              <motion.div
                key={index}
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {campaign.type === 'email' && (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {campaign.header}
                      </h3>
                    </div>
                    {campaign.subject && (
                      <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Subject Line
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">
                          {campaign.subject}
                        </p>
                      </div>
                    )}
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {campaign.body}
                      </pre>
                    </div>
                  </>
                )}
                {campaign.type === 'sms' && (
                  <>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                        <MessageSquare className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {campaign.header}
                      </h3>
                    </div>
                    <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                        {campaign.body}
                      </pre>
                    </div>
                  </>
                )}
                {campaign.type === 'text' && (
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                    {campaign.body}
                  </pre>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="raw"
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
              {text}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};