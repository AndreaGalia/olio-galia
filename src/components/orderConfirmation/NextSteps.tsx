"use client";

import { motion } from "framer-motion";
import { useT } from "@/hooks/useT";

export default function NextSteps() {
  const { t } = useT();

  const steps = [
    {
      number: "1",
      title: t.orderConfirmation.steps.processing.title,
      description: t.orderConfirmation.steps.processing.description,
      bgColor: "bg-olive/5",
      borderColor: "border-olive/10",
      numberBg: "bg-olive",
      numberColor: "text-beige",
      titleColor: "text-olive"
    },
    {
      number: "2",
      title: t.orderConfirmation.steps.contact.title,
      description: t.orderConfirmation.steps.contact.description,
      bgColor: "bg-beige/30",
      borderColor: "border-olive/10",
      numberBg: "bg-olive",
      numberColor: "text-beige",
      titleColor: "text-olive"
    },
    {
      number: "3",
      title: t.orderConfirmation.steps.delivery.title,
      description: t.orderConfirmation.steps.delivery.description,
      bgColor: "bg-olive/5",
      borderColor: "border-olive/10",
      numberBg: "bg-olive",
      numberColor: "text-beige",
      titleColor: "text-olive"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="mb-8"
    >
      <h2 className="text-2xl font-serif text-olive mb-4 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t.orderConfirmation.steps.title}
      </h2>
      
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={index} className={`flex gap-4 p-4 ${step.bgColor} border ${step.borderColor}`}>
            <div className={`w-8 h-8 ${step.numberBg} flex items-center justify-center flex-shrink-0 mt-1`}>
              <span className={`text-sm font-bold ${step.numberColor}`}>{step.number}</span>
            </div>
            <div>
              <h3 className={`font-semibold ${step.titleColor} mb-1`}>{step.title}</h3>
              <p className="text-sm text-nocciola">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}