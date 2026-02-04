import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, MapPin, Clock, DollarSign, Mail, Globe, ChevronLeft } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getColorsForType, categoryLabels, getCategoryForType } from './businessCategories';
import type { Business } from '../../types';

interface BusinessDetailModalProps {
  business: Business | null;
  distanceInfo?: string;
  onClose: () => void;
  onBackToResupply?: () => void;
}

export function BusinessDetailModal({ business, distanceInfo, onClose, onBackToResupply }: BusinessDetailModalProps) {
  if (!business) return null;

  const colors = getColorsForType(business.type);
  const category = getCategoryForType(business.type);
  const categoryLabel = categoryLabels[category] || 'SERVICES';

  const handleCall = () => {
    if (business.phone) {
      window.open(`tel:${business.phone.replace(/\D/g, '')}`);
    }
  };

  const handleDirections = () => {
    if (business.googleMapsUrl) {
      window.open(business.googleMapsUrl, '_blank');
    } else if (business.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(business.address)}`, '_blank');
    }
  };

  const handleEmail = () => {
    if (business.email) {
      window.open(`mailto:${business.email}`);
    }
  };

  const handleWebsite = () => {
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-4 border-b border-[var(--border)]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <span className={cn('text-[10px] font-semibold uppercase tracking-wider', colors.text)}>
                  {categoryLabel}
                </span>
                <h2 className="font-semibold text-lg text-[var(--foreground)] mt-0.5">{business.name}</h2>
                {distanceInfo && (
                  <p className="text-xs text-[var(--foreground-muted)] mt-0.5">{distanceInfo}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 -mr-2 -mt-1 rounded-lg hover:bg-[var(--background)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick action buttons */}
            <div className="flex gap-2 mt-3">
              {business.phone && (
                <button
                  onClick={handleCall}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </button>
              )}
              {(business.googleMapsUrl || business.address) && (
                <button
                  onClick={handleDirections}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                >
                  <MapPin className="w-4 h-4" />
                  Directions
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
            {/* Phone */}
            {business.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Phone</p>
                  <button onClick={handleCall} className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                    {business.phone}
                  </button>
                </div>
              </div>
            )}

            {/* Address */}
            {business.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Address</p>
                  <button onClick={handleDirections} className="text-sm text-[var(--foreground)] hover:text-[var(--accent)] text-left">
                    {business.address}
                  </button>
                </div>
              </div>
            )}

            {/* Hours */}
            {business.hours && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[var(--foreground-muted)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Hours</p>
                  <p className="text-sm text-[var(--foreground)]">{business.hours}</p>
                </div>
              </div>
            )}

            {/* Pricing */}
            {business.pricing && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Pricing</p>
                  <p className="text-sm text-[var(--foreground)]">{business.pricing}</p>
                </div>
              </div>
            )}

            {/* Email */}
            {business.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Email</p>
                  <button onClick={handleEmail} className="text-sm text-[var(--foreground)] hover:text-[var(--primary)]">
                    {business.email}
                  </button>
                </div>
              </div>
            )}

            {/* Website */}
            {business.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-[var(--primary)] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)]">Website</p>
                  <button onClick={handleWebsite} className="text-sm text-[var(--foreground)] hover:text-[var(--primary)] truncate max-w-[250px] block text-left">
                    {business.website.replace(/^https?:\/\//, '')}
                  </button>
                </div>
              </div>
            )}

            {/* Services */}
            {business.services && business.services.length > 0 && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] mb-2">Services Available</p>
                <div className="flex flex-wrap gap-1.5">
                  {business.services.map((service) => (
                    <span
                      key={service}
                      className="px-2 py-1 text-xs bg-[var(--background)] text-[var(--foreground-muted)] rounded-md border border-[var(--border)]"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {business.notes && (
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="text-[10px] uppercase tracking-wider text-[var(--foreground-muted)] mb-1">Hiker Notes</p>
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">{business.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {onBackToResupply && (
            <div className="p-4 border-t border-[var(--border)]">
              <button
                onClick={onBackToResupply}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Resupply Overview
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
