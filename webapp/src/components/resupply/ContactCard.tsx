import { Phone, MapPin, Clock, Globe, Mail, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Business, BusinessType } from '../../types';

interface ContactCardProps {
  business: Business;
  compact?: boolean;
}

const typeLabels: Record<BusinessType, string> = {
  outfitter: 'Outfitter',
  hostel: 'Hostel',
  grocery: 'Grocery',
  restaurant: 'Restaurant',
  post_office: 'Post Office',
  lodging: 'Lodging',
  general_store: 'General Store',
  visitor_center: 'Visitor Center',
  shuttle: 'Shuttle',
  laundry: 'Laundry',
  camping: 'Camping',
  campground: 'Campground',
  shelter: 'Shelter',
  medical: 'Medical',
  pharmacy: 'Pharmacy',
  veterinary: 'Veterinary',
  hospital: 'Hospital',
  library: 'Library',
  services: 'Services',
  activity: 'Activity',
  museum: 'Museum',
  kennel: 'Kennel',
  shipping: 'Shipping',
};

const typeColors: Record<BusinessType, string> = {
  outfitter: 'bg-amber-500',
  hostel: 'bg-blue-500',
  grocery: 'bg-green-500',
  restaurant: 'bg-orange-500',
  post_office: 'bg-red-500',
  lodging: 'bg-purple-500',
  general_store: 'bg-teal-500',
  visitor_center: 'bg-indigo-500',
  shuttle: 'bg-cyan-500',
  laundry: 'bg-pink-500',
  camping: 'bg-lime-500',
  campground: 'bg-emerald-500',
  shelter: 'bg-stone-500',
  medical: 'bg-rose-500',
  pharmacy: 'bg-fuchsia-500',
  veterinary: 'bg-violet-500',
  hospital: 'bg-red-600',
  library: 'bg-sky-500',
  services: 'bg-slate-500',
  activity: 'bg-yellow-500',
  museum: 'bg-indigo-600',
  kennel: 'bg-amber-600',
  shipping: 'bg-gray-500',
};

export function ContactCard({ business, compact = false }: ContactCardProps) {
  const handleCall = () => {
    if (business.phone) {
      window.open(`tel:${business.phone.replace(/\D/g, '')}`);
    }
  };

  const handleMap = () => {
    if (business.googleMapsUrl) {
      window.open(business.googleMapsUrl, '_blank');
    } else if (business.address) {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(business.address)}`, '_blank');
    }
  };

  const handleWebsite = () => {
    if (business.website) {
      window.open(business.website, '_blank');
    }
  };

  const handleEmail = () => {
    if (business.email) {
      window.open(`mailto:${business.email}`);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between py-1.5 px-2 bg-[var(--background)] rounded border border-[var(--border-light)]">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn('w-2 h-2 rounded-full shrink-0', typeColors[business.type])} />
          <span className="text-sm font-medium truncate">{business.name}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {business.phone && (
            <button
              onClick={handleCall}
              className="p-1 rounded hover:bg-[var(--background-secondary)] text-[var(--primary)]"
              aria-label={`Call ${business.name} at ${business.phone}`}
            >
              <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
          {(business.googleMapsUrl || business.address) && (
            <button
              onClick={handleMap}
              className="p-1 rounded hover:bg-[var(--background-secondary)] text-[var(--accent)]"
              aria-label={`Open ${business.name} in Maps`}
            >
              <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--background)] rounded-lg border border-[var(--border-light)] p-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('px-1.5 py-0.5 text-[10px] font-medium text-white rounded', typeColors[business.type])}>
              {typeLabels[business.type]}
            </span>
          </div>
          <h4 className="font-semibold text-sm leading-tight">{business.name}</h4>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1.5 text-xs text-[var(--foreground-muted)]">
        {business.phone && (
          <button
            onClick={handleCall}
            className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors w-full text-left"
          >
            <Phone className="w-3.5 h-3.5 shrink-0 text-[var(--primary)]" />
            <span>{business.phone}</span>
          </button>
        )}

        {business.address && (
          <button
            onClick={handleMap}
            className="flex items-start gap-2 hover:text-[var(--accent)] transition-colors w-full text-left"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--accent)]" />
            <span className="leading-snug">{business.address}</span>
          </button>
        )}

        {business.hours && (
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-[var(--foreground-muted)]" />
            <span className="leading-snug">{business.hours}</span>
          </div>
        )}

        {business.website && (
          <button
            onClick={handleWebsite}
            className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors w-full text-left"
          >
            <Globe className="w-3.5 h-3.5 shrink-0 text-[var(--primary)]" />
            <span className="truncate">{business.website.replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
          </button>
        )}

        {business.email && (
          <button
            onClick={handleEmail}
            className="flex items-center gap-2 hover:text-[var(--primary)] transition-colors w-full text-left"
          >
            <Mail className="w-3.5 h-3.5 shrink-0 text-[var(--primary)]" />
            <span className="truncate">{business.email}</span>
          </button>
        )}
      </div>

      {/* Pricing */}
      {business.pricing && (
        <div className="mt-2 pt-2 border-t border-[var(--border-light)]">
          <p className="text-xs font-medium text-[var(--accent)]">{business.pricing}</p>
        </div>
      )}

      {/* Notes */}
      {business.notes && (
        <p className="mt-2 text-xs text-[var(--foreground-muted)] italic leading-snug">
          {business.notes}
        </p>
      )}

      {/* Services */}
      {business.services && business.services.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {business.services.map((service) => (
            <span
              key={service}
              className="px-1.5 py-0.5 text-[10px] bg-[var(--background-secondary)] text-[var(--foreground-muted)] rounded"
            >
              {service}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
