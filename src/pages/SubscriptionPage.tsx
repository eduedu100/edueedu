import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const plans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 9.99,
    features: [
      'Access to all basic activities',
      'Limited progress tracking',
      'Email support'
    ]
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 19.99,
    features: [
      'Access to all activities',
      'Advanced progress tracking',
      'Priority support',
      'Downloadable resources'
    ],
    recommended: true
  },
  {
    id: 'family',
    name: 'Family Plan',
    price: 29.99,
    features: [
      'Everything in Premium',
      'Up to 4 child profiles',
      '24/7 support',
      'Family progress dashboard'
    ]
  }
];

const SubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSubscribe = async (planId: string) => {
    try {
      setLoading(true);
      setError('');

      // Calculate subscription end date (30 days from now)
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

      // Create subscription record
      const { error: subscriptionError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan: planId,
          status: 'active',
          current_period_end: currentPeriodEnd.toISOString()
        });

      if (subscriptionError) throw subscriptionError;

      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-lg text-gray-600">
            Select the perfect subscription plan for your child's learning journey
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 bg-red-50 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 ${
                plan.recommended ? 'border-primary-500' : 'border-transparent'
              }`}
            >
              {plan.recommended && (
                <div className="bg-primary-500 text-white text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
                  Recommended
                </div>
              )}

              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">
                  ${plan.price}
                </span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.recommended ? 'primary' : 'outline'}
                fullWidth
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
              >
                {loading ? 'Processing...' : `Subscribe to ${plan.name}`}
              </Button>
            </motion.div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto mt-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Subscription FAQs
          </h2>
          <dl className="space-y-6">
            <div>
              <dt className="font-medium text-gray-900">When will I be charged?</dt>
              <dd className="mt-2 text-gray-600">
                You'll be charged immediately upon subscribing, and then on the same
                date each month.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">Can I cancel anytime?</dt>
              <dd className="mt-2 text-gray-600">
                Yes, you can cancel your subscription at any time. You'll continue
                to have access until the end of your billing period.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-900">
                Is there a refund policy?
              </dt>
              <dd className="mt-2 text-gray-600">
                We offer a 30-day money-back guarantee if you're not satisfied with
                your subscription.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;