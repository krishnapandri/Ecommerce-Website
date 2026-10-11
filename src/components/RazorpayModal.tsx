import React, { useState } from 'react';
import { X, ShieldCheck, Lock, CreditCard, Smartphone, Building2, CheckCircle2 } from 'lucide-react';

interface RazorpayModalProps {
  amount: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  onSuccess: (paymentId: string) => void;
  onClose: () => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  amount,
  orderNumber,
  customerName,
  customerEmail,
  onSuccess,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'card' | 'upi' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState('08/28');
  const [cvv, setCvv] = useState('742');

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const generatedPaymentId = `pay_rzp_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setIsProcessing(false);
      onSuccess(generatedPaymentId);
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scaleUp">
        {/* Razorpay Brand Header */}
        <div className="bg-[#0C2340] text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-[#3395FF] text-white font-bold text-xs px-2 py-0.5 rounded tracking-wider">
                RAZORPAY
              </div>
              <span className="text-xs text-slate-300">Secure Checkout</span>
            </div>
            <div className="text-sm font-semibold mt-1">LuxeLane Accessories</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-300">Amount to Pay</div>
            <div className="text-xl font-bold font-mono tabular-nums text-[#3395FF]">
              ${amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-3 border-b border-slate-100">
            <span>Customer: <strong className="text-slate-800">{customerName || 'Guest'}</strong></span>
            <span>Ref: <strong className="font-mono text-slate-800">{orderNumber}</strong></span>
          </div>

          {/* Payment Method Selector */}
          <div className="grid grid-cols-3 gap-2 my-4">
            <button
              onClick={() => setActiveTab('upi')}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                activeTab === 'upi'
                  ? 'border-[#3395FF] bg-blue-50/50 text-[#0C2340] font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4 mx-auto mb-1 text-[#3395FF]" />
              <span className="text-xs">UPI / QR</span>
            </button>

            <button
              onClick={() => setActiveTab('card')}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                activeTab === 'card'
                  ? 'border-[#3395FF] bg-blue-50/50 text-[#0C2340] font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-4 h-4 mx-auto mb-1 text-[#3395FF]" />
              <span className="text-xs">Cards</span>
            </button>

            <button
              onClick={() => setActiveTab('netbanking')}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                activeTab === 'netbanking'
                  ? 'border-[#3395FF] bg-blue-50/50 text-[#0C2340] font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <Building2 className="w-4 h-4 mx-auto mb-1 text-[#3395FF]" />
              <span className="text-xs">Net Banking</span>
            </button>
          </div>

          {/* Tab Form */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-3">
            {activeTab === 'upi' && (
              <div className="space-y-2">
                <label className="block text-slate-700 font-medium">Virtual Payment Address (VPA)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#3395FF]"
                    placeholder="name@upi"
                  />
                  <span className="inline-flex items-center text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 rounded">
                    Verified
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Instant authorization via Google Pay, PhonePe, or Paytm simulator.
                </p>
              </div>
            )}

            {activeTab === 'card' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#3395FF]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">Expiry</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#3395FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-medium mb-1">CVV</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:outline-none focus:border-[#3395FF]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'netbanking' && (
              <div className="space-y-2">
                <label className="block text-slate-700 font-medium">Select Popular Bank</label>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((bank) => (
                    <div
                      key={bank}
                      className="p-2 bg-white rounded border border-slate-200 text-center font-medium text-slate-700 hover:border-[#3395FF] cursor-pointer"
                    >
                      {bank}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Razorpay Test Simulation Badge */}
          <div className="flex items-center gap-2 mt-4 p-2 bg-blue-50 text-[#0C2340] rounded text-[11px]">
            <Lock className="w-3.5 h-3.5 text-[#3395FF]" />
            <span>Sandbox Test Mode · No real charge will occur</span>
          </div>

          {/* Pay Button */}
          <div className="mt-5 space-y-2">
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              className="w-full py-3 bg-[#3395FF] hover:bg-[#1E87FF] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authorizing via Razorpay...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ${amount.toFixed(2)} Securely</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
            >
              Cancel and Return to Checkout
            </button>
          </div>
        </div>

        {/* Razorpay Footer */}
        <div className="bg-slate-100 px-6 py-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <span>PCI-DSS Level 1 Certified</span>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>256-bit SSL Encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
};
