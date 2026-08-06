import { Mountain, Users, Map, Satellite, Globe, type LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  Mountain,
  Users,
  Map,
  Satellite,
  Globe,
};

export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const Icon = icons[name] || Globe;
  return <Icon className={className} />;
}
