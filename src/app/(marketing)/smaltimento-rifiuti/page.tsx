"use client";

import { useT } from '@/hooks/useT';
import { useState, useEffect } from 'react';

export default function WasteDisposalPage() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { t } = useT();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const tableItems = [
    t.wasteDisposalPage.table.items.bottle,
    t.wasteDisposalPage.table.items.pipette,
    t.wasteDisposalPage.table.items.ring,
    t.wasteDisposalPage.table.items.bulb,
    t.wasteDisposalPage.table.items.label,
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-beige to-sabbia">

      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-8 w-32 h-32 rounded-full bg-olive animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 rounded-full bg-salvia"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-nocciola"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 max-w-5xl relative z-10">
          <div className="text-center">
            <div className={`inline-flex items-center gap-3 bg-olive/10 text-olive px-4 py-2 rounded-full text-sm font-medium mb-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="w-2 h-2 bg-olive rounded-full animate-pulse"></div>
              {t.wasteDisposalPage.hero.badge}
            </div>

            <h1
              className={`text-3xl sm:text-4xl lg:text-5xl font-serif text-olive mb-4 leading-tight transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {t.wasteDisposalPage.hero.title}
            </h1>

            <p
              className={`text-lg sm:text-xl text-salvia italic mb-6 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {t.wasteDisposalPage.hero.subtitle}
            </p>

            <p
              className={`text-base sm:text-lg text-nocciola max-w-3xl mx-auto leading-relaxed transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {t.wasteDisposalPage.hero.description}
            </p>
          </div>
        </div>
      </section>

      {/* Recycling Table Section */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-olive to-salvia px-6 py-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-serif text-beige mb-2">
                {t.wasteDisposalPage.table.title}
              </h2>
              <p className="text-beige/90 text-sm sm:text-base">
                {t.wasteDisposalPage.table.subtitle}
              </p>
            </div>

            {/* Table Content - Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-beige border-b-2 border-sabbia">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-olive uppercase tracking-wider">
                      {t.wasteDisposalPage.table.headers.component}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-olive uppercase tracking-wider">
                      {t.wasteDisposalPage.table.headers.material}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-olive uppercase tracking-wider">
                      {t.wasteDisposalPage.table.headers.code}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sabbia">
                  {tableItems.map((item, index) => (
                    <tr
                      key={index}
                      className="hover:bg-beige/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm sm:text-base text-olive font-medium">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm sm:text-base text-nocciola">
                        {item.material}
                      </td>
                      <td className="px-6 py-4 text-sm sm:text-base text-salvia font-semibold">
                        {item.code}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Content - Mobile Cards */}
            <div className="md:hidden divide-y divide-sabbia">
              {tableItems.map((item, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-beige/30 transition-colors duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-nocciola font-medium">
                        {t.wasteDisposalPage.table.headers.component}
                      </span>
                      <span className="text-base font-semibold text-olive">
                        {item.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-nocciola font-medium">
                        {t.wasteDisposalPage.table.headers.material}
                      </span>
                      <span className="text-base text-nocciola">
                        {item.material}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wider text-nocciola font-medium">
                        {t.wasteDisposalPage.table.headers.code}
                      </span>
                      <span className="text-base font-bold text-salvia">
                        {item.code}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Instructions Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-olive/5 to-salvia/5">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <h2 className="text-2xl sm:text-3xl font-serif text-olive text-center mb-10">
            {t.wasteDisposalPage.instructions.title}
          </h2>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {t.wasteDisposalPage.instructions.steps.map((step: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-olive to-salvia text-beige font-bold text-xl mb-4 mx-auto">
                  {index + 1}
                </div>
                <h3 className="text-lg font-semibold text-olive mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-nocciola text-center leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Note */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          <div className="bg-gradient-to-r from-olive/10 to-salvia/10 rounded-xl p-6 sm:p-8 border-l-4 border-olive">
            <div className="flex items-start gap-4">
              <svg
                className="w-6 h-6 text-olive flex-shrink-0 mt-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-sm sm:text-base text-nocciola leading-relaxed">
                {t.wasteDisposalPage.footer.note}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
