"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Copy, Link as LinkIcon, Clock, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { toast } from "sonner";

interface TestLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidateName: string;
  portalUrl: string;
  expiresAt: string;
}

export function TestLinkModal({
  isOpen,
  onClose,
  candidateName,
  portalUrl,
  expiresAt
}: TestLinkModalProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(portalUrl);
    toast.success("Link copiado!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="relative w-full max-w-md bg-white dark:bg-card/70 rounded-[32px] overflow-hidden shadow-2xl border-1 border-card dark:border-card"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-chumbo/20 dark:hover:bg-chumbo/30 transition-colors z-10"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              {/* Top Gradient Decoration */}
              <div className="" />

              <div className="relative p-8 pt-12 flex flex-col items-center">
                {/* Animated Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, delay: 0.1 }}
                  className="w-20 h-20 bg-azure/20 border-azure/50 dark:bg-neon/20 border-2 dark:border-neon/50 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(196,255,87,0.2)]"
                >
                  <LinkIcon className="w-10 h-10 text-azure dark:text-neon" />
                </motion.div>

                {/* Header */}
                <div className="text-center space-y-2 mb-10">
                  <h2 className="text-3xl font-outfit font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                    Link Gerado!
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                    O teste para <span className="text-forest dark:text-neon font-bold">{candidateName}</span> já pode ser enviado.
                  </p>
                </div>

                {/* URL Box */}
                <div className="w-full text-left space-y-2.5 mb-8">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-azure dark:text-azure ml-1">
                    URL da Avaliação
                  </label>
                  <div className="flex items-center gap-2 p-2 bg-azure/20 dark:bg-azure/20 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                    <div className="flex-1 px-3 py-2 text-xs font-mono truncate text-slate-600 dark:text-slate-300">
                      {portalUrl}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl bg-azure/40 dark:bg-azure/20 shadow-sm text-forest dark:text-neon hover:bg-azure/50 hover:text-chumbo transition-all shrink-0"
                      onClick={copyToClipboard}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expiry Card */}
                <div className="w-full flex items-center gap-4 p-5 bg-azure/20 dark:bg-azure/20 border border-azure/10 dark:border-azure/20 rounded-[24px] mb-8">
                  <div className="w-10 h-10 rounded-full bg-azure/20 border border-azure/20 dark:bg-azure/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-azure/80 dark:text-azure/80" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-azure/80 dark:text-azure/80 leading-none mb-1">Expira em 72 horas</p>
                    <p className="text-[11px] text-azure/70 dark:text-azure/70">
                      {new Date(expiresAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="w-full flex flex-col gap-3">
                  <Button
                    className="h-14 rounded-2xl bg-neon/90 hover:bg-azure/20 text-chumbo font-bold text-base gap-2 hover:bg-neon/90 shadow-lg shadow-neon/20 border-none"
                    onClick={() => window.open(portalUrl, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" /> Abrir Portal agora
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 rounded-2xl text-chumbo dark:text-chumbo font-bold hover:bg-chumbo/30 dark:hover:text-slate-300 transition-colors"
                    onClick={onClose}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
