'use client';

import { Mail, Phone, Building2 } from 'lucide-react';
import { ServiceProvider } from '@/types/portfolio';
import SectionWrapper from './SectionWrapper';

interface ServiceProvidersSectionProps {
  content: { providers?: ServiceProvider[] };
  isEditingLayout: boolean;
}

export default function ServiceProvidersSection({ content, isEditingLayout }: ServiceProvidersSectionProps) {
  const providers = content.providers || [];

  return (
    <SectionWrapper title="Service Providers" isEditingLayout={isEditingLayout}>
      {providers.length === 0 ? (
        <p className="text-xs text-forest/40 italic">No service providers added yet.</p>
      ) : (
        <div className="space-y-3">
          {providers.map((provider) => (
            <div key={provider.id} className="p-3 rounded-xl bg-sage-light/40 space-y-1.5">
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-forest/40" />
                <span className="text-sm font-medium text-forest">{provider.name}</span>
              </div>
              <p className="text-xs text-forest/60 pl-5.5">{provider.service}</p>
              <div className="flex items-center gap-3 pl-5.5">
                {provider.email && (
                  <a href={`mailto:${provider.email}`} className="flex items-center gap-1 text-xs text-forest/50 hover:text-terracotta transition-colors">
                    <Mail className="w-3 h-3" />
                    <span className="truncate max-w-[140px]">{provider.email}</span>
                  </a>
                )}
                {provider.phone && (
                  <a href={`tel:${provider.phone}`} className="flex items-center gap-1 text-xs text-forest/50 hover:text-terracotta transition-colors">
                    <Phone className="w-3 h-3" />
                    <span>{provider.phone}</span>
                  </a>
                )}
              </div>
              {provider.contractType && (
                <div className="pl-5.5">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/5 text-forest/50 uppercase tracking-wide font-medium">
                    {provider.contractType}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
