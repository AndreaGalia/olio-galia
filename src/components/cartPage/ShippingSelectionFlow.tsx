"use client";

import { ShippingZone } from '@/types/shipping';
import ShippingZoneSelector from './ShippingZoneSelector';

interface ShippingSelectionFlowProps {
  value: ShippingZone | null;
  onChange: (zone: ShippingZone | null) => void;
}

export default function ShippingSelectionFlow({ value, onChange }: ShippingSelectionFlowProps) {
  return (
    <ShippingZoneSelector
      selectedZone={value}
      onSelectZone={onChange}
    />
  );
}
