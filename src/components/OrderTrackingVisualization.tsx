import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import {
  CheckCircle2,
  Package,
  Truck,
  Home,
  AlertCircle,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react';

interface OrderTrackingProps {
  order: Order;
  initialExpanded?: boolean;
}

interface StepDef {
  key: OrderStatus;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TRACKING_STEPS: StepDef[] = [
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    description: 'Payment authorized & order logged',
    icon: CheckCircle2,
  },
  {
    key: 'processing',
    label: 'Processing',
    description: 'Hand-inspected & packaged with care',
    icon: Package,
  },
  {
    key: 'shipped',
    label: 'In Transit',
    description: 'Dispatched via express courier',
    icon: Truck,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    description: 'Handed over at destination',
    icon: Home,
  },
];

const STATUS_ORDER: Record<string, number> = {
  confirmed: 0,
  processing: 1,
  shipped: 2,
  delivered: 3,
};

export const OrderTrackingVisualization: React.FC<OrderTrackingProps> = ({
  order,
  initialExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const isCancelled = order.orderStatus === 'cancelled';
  const currentStepIndex = STATUS_ORDER[order.orderStatus] ?? 0;

  // Calculate delivery estimate date (3 days after order creation)
  const orderDate = new Date(order.createdAt);
  const estimatedDeliveryDate = new Date(orderDate);
  estimatedDeliveryDate.setDate(orderDate.getDate() + 3);

  const formattedEstimatedDate = estimatedDeliveryDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  // Calculate completion percentage for the connecting progress line
  const progressPercent = isCancelled
    ? 0
    : (currentStepIndex / (TRACKING_STEPS.length - 1)) * 100;

  const trackingNumber = `LX-${order.orderNumber.replace(/[^0-9]/g, '') || '89201'}-EXP`;

  return (
    <div className="bg-white rounded-xl border border-[#E7E5E4] overflow-hidden shadow-2xs transition-all">
      {/* Header bar with toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-[#FAFAF9] flex items-center justify-between cursor-pointer hover:bg-[#F5F5F4] transition-colors border-b border-[#E7E5E4]"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#78350F]" />
          <span className="text-xs font-semibold text-[#1C1917] tracking-wide">
            Live Shipment Tracking
          </span>
          <span className="text-[#A8A29E] text-xs">·</span>
          <span className="font-mono text-[11px] text-[#78716C]">
            {trackingNumber}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {!isCancelled && (
            <span className="text-[#57534E] hidden sm:inline">
              {order.orderStatus === 'delivered' ? (
                <span className="text-emerald-700 font-medium">Delivered</span>
              ) : (
                <>Est. Delivery: <strong className="text-[#1C1917]">{formattedEstimatedDate}</strong></>
              )}
            </span>
          )}
          <button
            type="button"
            className="p-1 text-[#78716C] hover:text-[#1C1917] rounded transition-colors"
            aria-label={isExpanded ? 'Collapse tracking' : 'Expand tracking'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-6">
          {isCancelled ? (
            /* Cancelled State Banner */
            <div className="flex items-start gap-3 p-3.5 bg-red-50/80 border border-red-200 rounded-lg text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div>
                <div className="font-semibold text-red-900">Order Cancelled</div>
                <p className="text-red-700 mt-0.5 leading-relaxed">
                  This order was cancelled on {new Date(order.updatedAt).toLocaleDateString()}. All reserved inventory has been automatically restored.
                </p>
              </div>
            </div>
          ) : (
            /* Multi-step Visual Pipeline */
            <div className="space-y-6">
              {/* Stepper Node Row */}
              <div className="relative pt-2 pb-1">
                {/* Connecting Track Background */}
                <div className="absolute top-5 left-6 right-6 h-0.5 bg-[#E7E5E4] -translate-y-1/2 z-0" />

                {/* Animated / Completed Progress Fill */}
                <div
                  className="absolute top-5 left-6 h-0.5 bg-[#78350F] -translate-y-1/2 z-0 transition-all duration-500 ease-out"
                  style={{
                    width: `calc(${progressPercent}% * (100% - 48px) / 100)`,
                  }}
                />

                {/* Milestones Grid */}
                <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                  {TRACKING_STEPS.map((step, idx) => {
                    const isCompleted = idx < currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    const isPending = idx > currentStepIndex;

                    const IconComponent = step.icon;

                    return (
                      <div key={step.key} className="flex flex-col items-center group">
                        {/* Circle Indicator */}
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 border ${
                            isCompleted
                              ? 'bg-[#78350F] border-[#78350F] text-white shadow-xs'
                              : isCurrent
                              ? 'bg-white border-[#78350F] text-[#78350F] ring-4 ring-[#FEF3C7] shadow-sm font-bold'
                              : 'bg-white border-[#D6D3D1] text-[#A8A29E]'
                          }`}
                        >
                          <IconComponent className="w-4 h-4" />
                        </div>

                        {/* Step Label */}
                        <div className="mt-2.5">
                          <div
                            className={`text-[11px] sm:text-xs font-semibold leading-tight ${
                              isCurrent
                                ? 'text-[#78350F]'
                                : isCompleted
                                ? 'text-[#1C1917]'
                                : 'text-[#A8A29E]'
                            }`}
                          >
                            {step.label}
                          </div>
                          <div className="text-[10px] text-[#78716C] mt-0.5 hidden sm:block max-w-[110px] mx-auto leading-tight">
                            {step.description}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Context & Real-Time Detail Card */}
              <div className="bg-[#FAFAF9] rounded-lg border border-[#E7E5E4] p-3.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
                    <Clock className="w-3.5 h-3.5 text-[#78350F]" />
                    <span>Real-Time Status</span>
                  </div>

                  <div className="font-medium text-[#1C1917]">
                    {order.orderStatus === 'confirmed' && (
                      <span>Order verified and scheduled for atelier packaging.</span>
                    )}
                    {order.orderStatus === 'processing' && (
                      <span>Handcrafted accessories are undergoing quality check & boxing.</span>
                    )}
                    {order.orderStatus === 'shipped' && (
                      <span>Package in transit with express carrier. On schedule.</span>
                    )}
                    {order.orderStatus === 'delivered' && (
                      <span className="text-emerald-700 font-semibold">
                        Package successfully delivered to front door.
                      </span>
                    )}
                  </div>

                  <div className="text-[11px] text-[#78716C]">
                    Carrier: <span className="text-[#1C1917] font-medium">LuxeLane Express Logistics</span>
                  </div>
                </div>

                <div className="space-y-1.5 sm:border-l sm:border-[#E7E5E4] sm:pl-4">
                  <div className="flex items-center gap-1.5 text-[#78716C] text-[11px] uppercase tracking-wider font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-[#78350F]" />
                    <span>Delivery Address</span>
                  </div>

                  <div className="text-[#1C1917] font-medium truncate">
                    {order.shippingAddress.fullName}
                  </div>
                  <div className="text-[11px] text-[#78716C] leading-snug">
                    {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
